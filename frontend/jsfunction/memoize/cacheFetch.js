const cache = new Map();

/**
 * Fetches and caches an asynchronous value.
 *
 * Features:
 * - Returns cached values until TTL expires.
 * - Deduplicates concurrent requests for the same key.
 * - Does not cache rejected promises.
 *
 * @template T
 * @param {string} key
 * @param {() => Promise<T>} loader
 * @param {number} ttlMs
 * @returns {Promise<T>}
 */
async function cachedFetch(key, loader, ttlMs) {
  if (typeof key !== "string" || key.length === 0) {
    throw new TypeError("key must be a non-empty string");
  }

  if (typeof loader !== "function") {
    throw new TypeError("loader must be a function");
  }

  if (!Number.isFinite(ttlMs) || ttlMs < 0) {
    throw new RangeError("ttlMs must be a non-negative number");
  }

  const now = Date.now();
  const cached = cache.get(key);

  if (cached) {
    // Return either the cached resolved value or the shared pending promise.
    if (cached.expiresAt > now) {
      return cached.promise;
    }

    cache.delete(key);
  }

  // Store the promise immediately so concurrent callers share one request.
  const promise = Promise.resolve().then(loader);

  const entry = {
    promise,
    expiresAt: now + ttlMs,
  };

  cache.set(key, entry);

  try {
    return await promise;
  } catch (error) {
    // Only remove this entry if it has not already been replaced.
    if (cache.get(key) === entry) {
      cache.delete(key);
    }

    throw error;
  }
}


// Alternative TTL
const cache = new Map();

async function cachedFetch(key, loader, ttlMs) {
  const now = Date.now();
  const cached = cache.get(key);

  if (cached && (cached.pending || cached.expiresAt > now)) {
    return cached.promise;
  }

  const entry = {
    pending: true,
    expiresAt: Infinity,
    promise: null,
  };

  entry.promise = Promise.resolve()
    .then(loader)
    .then((value) => {
      entry.pending = false;
      entry.expiresAt = Date.now() + ttlMs;
      return value;
    })
    .catch((error) => {
      if (cache.get(key) === entry) {
        cache.delete(key);
      }

      throw error;
    });

  cache.set(key, entry);

  return entry.promise;
}