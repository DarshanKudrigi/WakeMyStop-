/**
 * In-Memory Caching & In-Flight Request Deduplication Layer
 * Ensures strict rate-limit awareness and efficient usage of daily API credits.
 */

class RequestCacheManager {
  constructor() {
    this.cache = new Map()
    this.pendingPromises = new Map()
  }

  /**
   * Generates a deterministic cache key for an endpoint and query parameters
   */
  createKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&')
    return sortedParams ? `${endpoint}?${sortedParams}` : endpoint
  }

  /**
   * Retrieves valid cached payload if not expired
   */
  get(key) {
    const record = this.cache.get(key)
    if (!record) return null

    if (Date.now() > record.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return record.data
  }

  /**
   * Stores payload in cache with specified TTL
   */
  set(key, data, ttlMs) {
    if (!ttlMs || ttlMs <= 0) return
    const expiresAt = Date.now() + ttlMs
    this.cache.set(key, { data, expiresAt })
  }

  /**
   * Clears a specific key or entire cache
   */
  clear(key = null) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  /**
   * Wraps an async fetch call with in-memory TTL caching and request deduplication.
   * If a identical request is currently in-flight, returns the shared pending promise.
   */
  async executeWithCache(cacheKey, ttlMs, fetchFn, bypassCache = false) {
    // 1. Check existing cached data unless bypassed
    if (!bypassCache) {
      const cached = this.get(cacheKey)
      if (cached) {
        return cached
      }
    }

    // 2. Request Deduplication: Check if exact same request is already in-flight
    if (this.pendingPromises.has(cacheKey)) {
      return this.pendingPromises.get(cacheKey)
    }

    // 3. Launch request and track in pending promises
    const requestPromise = (async () => {
      try {
        const result = await fetchFn()
        if (result && (result.success || result.httpStatus === 200) && ttlMs > 0) {
          this.set(cacheKey, result, ttlMs)
        }
        return result
      } finally {
        this.pendingPromises.delete(cacheKey)
      }
    })()

    this.pendingPromises.set(cacheKey, requestPromise)
    return requestPromise
  }
}

const railCache = new RequestCacheManager()

module.exports = {
  RequestCacheManager,
  railCache,
}
