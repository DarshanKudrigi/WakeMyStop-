/**
 * Frontend Request Cache & Deduplication Layer
 */

class RequestCacheManager {
  constructor() {
    this.cache = new Map()
    this.pendingPromises = new Map()
  }

  createKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map((k) => `${k}=${params[k]}`)
      .join('&')
    return sortedParams ? `${endpoint}?${sortedParams}` : endpoint
  }

  get(key) {
    const record = this.cache.get(key)
    if (!record) return null

    if (Date.now() > record.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return record.data
  }

  set(key, data, ttlMs) {
    if (!ttlMs || ttlMs <= 0) return
    const expiresAt = Date.now() + ttlMs
    this.cache.set(key, { data, expiresAt })
  }

  clear(key = null) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  async executeWithCache(cacheKey, ttlMs, fetchFn, bypassCache = false) {
    if (!bypassCache) {
      const cached = this.get(cacheKey)
      if (cached) return cached
    }

    if (this.pendingPromises.has(cacheKey)) {
      return this.pendingPromises.get(cacheKey)
    }

    const requestPromise = (async () => {
      try {
        const result = await fetchFn()
        if (result && result.success && ttlMs > 0) {
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

export const railCache = new RequestCacheManager()
