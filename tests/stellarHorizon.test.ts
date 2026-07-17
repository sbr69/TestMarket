import assert from 'node:assert/strict';
import test from 'node:test';
import { createStellarHorizonVerifier, PaymentVerificationUnavailableError } from '../server/stellarHorizon';

const hash = 'a'.repeat(64);
const silentLogger = () => undefined;

test('retries transient Horizon failures, opens the circuit, and recovers through a half-open probe', async () => {
  let now = 0;
  let healthy = false;
  let calls = 0;
  const verifier = createStellarHorizonVerifier({
    now: () => now,
    retryDelayMs: 0,
    logger: silentLogger,
    fetchImplementation: async () => {
      calls += 1;
      return healthy
        ? new Response(JSON.stringify({ _embedded: { records: [] } }), { status: 200 })
        : new Response('', { status: 503 });
    },
  });

  for (let index = 0; index < 3; index += 1) {
    await assert.rejects(() => verifier.fetchOperations(hash), PaymentVerificationUnavailableError);
  }
  assert.equal(calls, 6, 'each failed verification should receive one transient retry');
  assert.equal(verifier.snapshot().state, 'open');

  await assert.rejects(() => verifier.fetchOperations(hash), PaymentVerificationUnavailableError);
  assert.equal(calls, 6, 'an open circuit must fast-fail without another Horizon request');

  healthy = true;
  now = 30_001;
  await assert.deepEqual(await verifier.fetchOperations(hash), { found: true, operations: [] });
  assert.equal(verifier.snapshot().state, 'closed');
});

test('does not trip the circuit for a transaction-not-found response', async () => {
  const verifier = createStellarHorizonVerifier({
    retryDelayMs: 0,
    logger: silentLogger,
    fetchImplementation: async () => new Response('', { status: 404 }),
  });

  await assert.deepEqual(await verifier.fetchOperations(hash), { found: false, operations: [] });
  assert.equal(verifier.snapshot().state, 'closed');
});

test('retries an upstream rate limit as a temporary dependency failure', async () => {
  let calls = 0;
  const verifier = createStellarHorizonVerifier({
    retryDelayMs: 0,
    logger: silentLogger,
    fetchImplementation: async () => {
      calls += 1;
      return new Response('', { status: 429 });
    },
  });

  await assert.rejects(() => verifier.fetchOperations(hash), PaymentVerificationUnavailableError);
  assert.equal(calls, 2);
  assert.equal(verifier.snapshot().state, 'closed');
});

test('times out stalled Horizon calls and rejects requests above the dependency concurrency limit', async () => {
  const pendingResolvers: Array<(response: Response) => void> = [];
  const saturatedVerifier = createStellarHorizonVerifier({
    timeoutMs: 1_000,
    retryDelayMs: 0,
    logger: silentLogger,
    fetchImplementation: async () => new Promise<Response>((resolve) => { pendingResolvers.push(resolve); }),
  });
  const pending = Array.from({ length: 4 }, () => saturatedVerifier.fetchOperations(hash));
  while (pendingResolvers.length < 4) await new Promise<void>((resolve) => setImmediate(resolve));
  await assert.rejects(
    () => saturatedVerifier.fetchOperations(hash),
    (error: unknown) => error instanceof PaymentVerificationUnavailableError && error.retryAfterSeconds === 30,
  );
  pendingResolvers.forEach((resolve) => resolve(new Response(JSON.stringify({ _embedded: { records: [] } }), { status: 200 })));
  await Promise.all(pending);

  const timeoutVerifier = createStellarHorizonVerifier({
    timeoutMs: 1,
    retryDelayMs: 0,
    logger: silentLogger,
    fetchImplementation: async (_input, init) => new Promise<Response>((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }),
  });
  await assert.rejects(() => timeoutVerifier.fetchOperations(hash), PaymentVerificationUnavailableError);
});
