export type CircuitState = 'closed' | 'open' | 'half_open';

type LogFields = Record<string, number | string>;
type DependencyLogger = (event: string, fields: LogFields) => void;

interface CircuitBreakerOptions {
  maxConcurrent: number;
  failuresToOpen: number;
  failureWindowMs: number;
  cooldownMs: number;
  now: () => number;
  logger: DependencyLogger;
}

export class DependencyCircuitUnavailableError extends Error {
  constructor(
    readonly reason: 'open' | 'saturated' | 'half_open',
    readonly retryAfterSeconds: number,
  ) {
    super('Stellar payment verification is temporarily unavailable');
    this.name = 'DependencyCircuitUnavailableError';
  }
}

/**
 * A deliberately per-process breaker. Vercel may reuse a warm function, so this
 * protects its local connection budget without requiring another paid service.
 */
export function createCircuitBreaker(options: CircuitBreakerOptions) {
  let state: CircuitState = 'closed';
  let inFlight = 0;
  let halfOpenProbeActive = false;
  let failures = 0;
  let failureWindowStartedAt: number | undefined;
  let openUntil = 0;

  const retryAfterSeconds = () => state === 'open'
    ? Math.max(1, Math.ceil((openUntil - options.now()) / 1_000))
    : 1;

  const openCircuit = (now: number) => {
    state = 'open';
    openUntil = now + options.cooldownMs;
    options.logger('circuit_opened', { failures, cooldown_ms: options.cooldownMs });
  };

  const closeCircuit = () => {
    const changed = state !== 'closed';
    state = 'closed';
    failures = 0;
    failureWindowStartedAt = undefined;
    openUntil = 0;
    if (changed) options.logger('circuit_closed', {});
  };

  const recordFailure = (now: number) => {
    if (state === 'half_open') {
      openCircuit(now);
      return;
    }
    if (state !== 'closed') return;

    if (failureWindowStartedAt === undefined || now - failureWindowStartedAt > options.failureWindowMs) {
      failures = 1;
      failureWindowStartedAt = now;
    } else {
      failures += 1;
    }
    if (failures >= options.failuresToOpen) openCircuit(now);
  };

  return {
    async execute<T>(operation: () => Promise<T>): Promise<T> {
      const now = options.now();
      if (state === 'open') {
        if (now < openUntil) {
          throw new DependencyCircuitUnavailableError('open', retryAfterSeconds());
        }
        state = 'half_open';
        options.logger('circuit_half_open', {});
      }
      if (state === 'half_open' && halfOpenProbeActive) {
        throw new DependencyCircuitUnavailableError('half_open', Math.ceil(options.cooldownMs / 1_000));
      }
      if (inFlight >= options.maxConcurrent) {
        options.logger('request_rejected', { reason: 'saturated', max_concurrent: options.maxConcurrent });
        throw new DependencyCircuitUnavailableError('saturated', Math.ceil(options.cooldownMs / 1_000));
      }

      const isHalfOpenProbe = state === 'half_open';
      if (isHalfOpenProbe) halfOpenProbeActive = true;
      inFlight += 1;
      try {
        const result = await operation();
        // A success that began before the circuit opened must not close it.
        if (state === 'half_open') closeCircuit();
        else if (state === 'closed') {
          failures = 0;
          failureWindowStartedAt = undefined;
        }
        return result;
      } catch (error) {
        recordFailure(options.now());
        throw error;
      } finally {
        inFlight -= 1;
        if (isHalfOpenProbe) halfOpenProbeActive = false;
      }
    },
    snapshot: () => ({ state, inFlight, failures, openUntil }),
  };
}

class HorizonDependencyError extends Error {
  constructor(readonly kind: 'timeout' | 'network' | 'invalid_response' | 'upstream_status') {
    super('Stellar Horizon did not complete payment verification');
    this.name = 'HorizonDependencyError';
  }
}

export class PaymentVerificationUnavailableError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super('Stellar payment verification is temporarily unavailable');
    this.name = 'PaymentVerificationUnavailableError';
  }
}

type FetchImplementation = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface StellarHorizonVerifierOptions {
  fetchImplementation?: FetchImplementation;
  timeoutMs?: number;
  retryDelayMs?: number;
  maxConcurrent?: number;
  failuresToOpen?: number;
  failureWindowMs?: number;
  cooldownMs?: number;
  now?: () => number;
  logger?: DependencyLogger;
}

const defaultLogger: DependencyLogger = (event, fields) => {
  console.warn(`[stellar-horizon] ${event}`, fields);
};

const wait = (milliseconds: number) => new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

async function fetchWithTimeout(fetchImplementation: FetchImplementation, url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new HorizonDependencyError('timeout'));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      fetchImplementation(url, { signal: controller.signal }),
      timeoutPromise,
    ]);
  } catch (error) {
    if (timedOut || error instanceof HorizonDependencyError) throw new HorizonDependencyError('timeout');
    throw new HorizonDependencyError('network');
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

/** Fetches only the operations required to validate a Stellar checkout payment. */
export function createStellarHorizonVerifier(options: StellarHorizonVerifierOptions = {}) {
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const timeoutMs = options.timeoutMs ?? 4_000;
  const retryDelayMs = options.retryDelayMs ?? 750;
  const logger = options.logger ?? defaultLogger;
  const breaker = createCircuitBreaker({
    maxConcurrent: options.maxConcurrent ?? 4,
    failuresToOpen: options.failuresToOpen ?? 3,
    failureWindowMs: options.failureWindowMs ?? 30_000,
    cooldownMs: options.cooldownMs ?? 30_000,
    now: options.now ?? Date.now,
    logger,
  });

  type HorizonLookup = { found: boolean; operations: unknown[] };

  const loadOperations = async (stellarTxHash: string): Promise<HorizonLookup> => {
    let lastFailure: HorizonDependencyError | undefined;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const response = await fetchWithTimeout(
          fetchImplementation,
          `https://horizon-testnet.stellar.org/transactions/${stellarTxHash}/operations`,
          timeoutMs,
        );

        if (response.status === 408 || response.status === 425 || response.status === 429 || response.status >= 500) {
          lastFailure = new HorizonDependencyError('upstream_status');
          logger('transient_response', { attempt, status: response.status });
        } else if (!response.ok) {
          // A 4xx response is a payment/transaction validation result, not a dependency outage.
          return { found: false, operations: [] };
        } else {
          try {
            const data = await response.json() as { _embedded?: { records?: unknown[] } };
            return { found: true, operations: Array.isArray(data?._embedded?.records) ? data._embedded.records : [] };
          } catch {
            lastFailure = new HorizonDependencyError('invalid_response');
            logger('invalid_response', { attempt });
          }
        }
      } catch (error) {
        lastFailure = error instanceof HorizonDependencyError ? error : new HorizonDependencyError('network');
        logger('request_failed', { attempt, kind: lastFailure.kind });
      }

      if (attempt === 1) await wait(retryDelayMs);
    }
    throw lastFailure ?? new HorizonDependencyError('network');
  };

  return {
    async fetchOperations(stellarTxHash: string): Promise<HorizonLookup> {
      try {
        return await breaker.execute(() => loadOperations(stellarTxHash));
      } catch (error) {
        if (error instanceof DependencyCircuitUnavailableError) {
          throw new PaymentVerificationUnavailableError(error.retryAfterSeconds);
        }
        const snapshot = breaker.snapshot();
        const retryAfterSeconds = snapshot.state === 'open'
          ? Math.max(1, Math.ceil((snapshot.openUntil - (options.now ?? Date.now)()) / 1_000))
          : 3;
        throw new PaymentVerificationUnavailableError(retryAfterSeconds);
      }
    },
    snapshot: breaker.snapshot,
  };
}

export const stellarHorizonVerifier = createStellarHorizonVerifier();
