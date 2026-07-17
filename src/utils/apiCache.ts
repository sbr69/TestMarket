type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  pending?: Promise<unknown>;
};

const responseCache = new Map<string, CacheEntry>();
const MAX_ENTRIES = 100;

function trimCache() {
  const now = Date.now();
  for (const [key, entry] of responseCache) {
    if (entry.expiresAt <= now && !entry.pending) responseCache.delete(key);
  }
  while (responseCache.size > MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (!oldestKey) break;
    responseCache.delete(oldestKey);
  }
}

/**
 * Deduplicates concurrent public GETs (including React Strict Mode's development
 * re-run) and keeps a deliberately short in-memory cache. Authenticated data is
 * never stored here.
 */
export async function fetchPublicJson<T>(url: string, ttlMs = 30_000): Promise<T> {
  const now = Date.now();
  const entry = responseCache.get(url);
  if (entry?.value !== undefined && entry.expiresAt > now) return entry.value as T;
  if (entry?.pending) return entry.pending as Promise<T>;

  const pending = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`Request failed with ${response.status}`);
      return response.json() as Promise<T>;
    })
    .then((value) => {
      responseCache.set(url, { value, expiresAt: Date.now() + ttlMs });
      trimCache();
      return value;
    })
    .catch((error) => {
      responseCache.delete(url);
      throw error;
    });

  responseCache.set(url, { pending, expiresAt: now + ttlMs });
  return pending as Promise<T>;
}

export function invalidatePublicCache(urlPrefix: string) {
  for (const key of responseCache.keys()) {
    if (key.startsWith(urlPrefix)) responseCache.delete(key);
  }
}
