/**
 * Journey Cache Layer
 * In-memory & localStorage backed 5-minute cache for RailRadar API responses.
 * Treats every Railway API request as valuable and eliminates redundant dispatches.
 */

const CACHE_TTL_MS = 5 * 60 * 1000 // 5 Minutes
const STORAGE_CACHE_KEY_PREFIX = 'railalert_journey_cache_'

class JourneyCacheManager {
  constructor() {
    this.memoryCache = new Map()
  }

  /**
   * Constructs cache key for train and request type
   */
  createKey(trainNo, type = 'details') {
    return `${String(trainNo).trim()}_${type}`
  }

  /**
   * Retrieves valid cached response if not expired (< 5 minutes old)
   */
  get(trainNo, type = 'details') {
    if (!trainNo) return null
    const key = this.createKey(trainNo, type)

    // 1. Check in-memory cache first
    let record = this.memoryCache.get(key)

    // 2. Fallback to localStorage cache
    if (!record) {
      try {
        const raw = localStorage.getItem(`${STORAGE_CACHE_KEY_PREFIX}${key}`)
        if (raw) {
          record = JSON.parse(raw)
          this.memoryCache.set(key, record)
        }
      } catch (err) {
        console.warn('[JourneyCache] Failed to read localStorage:', err.message)
      }
    }

    if (!record) return null

    // Check expiry timestamp
    const now = Date.now()
    if (now > record.expiresAt) {
      this.delete(trainNo, type)
      return null
    }

    return {
      responseData: record.responseData,
      cachedAt: record.cachedAt,
      expiresAt: record.expiresAt,
      isValid: true,
    }
  }

  /**
   * Stores complete API response in cache with 5-minute TTL
   */
  set(trainNo, responseData, type = 'details', ttlMs = CACHE_TTL_MS) {
    if (!trainNo || !responseData) return
    const key = this.createKey(trainNo, type)
    const now = Date.now()
    const expiresAt = now + ttlMs

    const record = {
      trainNo: String(trainNo).trim(),
      type,
      responseData,
      cachedAt: now,
      expiresAt,
    }

    // Save in memory
    this.memoryCache.set(key, record)

    // Save in localStorage for persistence across tab reloads
    try {
      localStorage.setItem(`${STORAGE_CACHE_KEY_PREFIX}${key}`, JSON.stringify(record))
    } catch (err) {
      console.warn('[JourneyCache] Failed to write localStorage:', err.message)
    }

    console.log(`[JourneyCache] ⚡ Cached ${type} for train ${trainNo} (Expires in ${ttlMs / 1000}s)`)
  }

  /**
   * Removes cache entry for a specific train
   */
  delete(trainNo, type = 'details') {
    if (!trainNo) return
    const key = this.createKey(trainNo, type)
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(`${STORAGE_CACHE_KEY_PREFIX}${key}`)
    } catch (err) {
      // Ignore storage errors
    }
  }

  /**
   * Clears entire journey cache
   */
  clearAll() {
    this.memoryCache.clear()
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith(STORAGE_CACHE_KEY_PREFIX)) {
          localStorage.removeItem(k)
        }
      })
    } catch (err) {
      // Ignore storage errors
    }
  }
}

export const journeyCache = new JourneyCacheManager()
