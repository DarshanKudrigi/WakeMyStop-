import { RAIL_API_CONFIG } from './constants.js'
import { parseApiError, NetworkError, TimeoutError, UnauthorizedError } from './errors.js'
import { railCache } from './cache.js'

/**
 * Low-level shared HTTP client for RailRadar REST API
 */
export async function rawRailFetch(endpoint, queryParams = {}, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeoutMs = RAIL_API_CONFIG.DEFAULT_TIMEOUT_MS,
    apiKey = RAIL_API_CONFIG.API_KEY,
  } = options

  if (!apiKey) {
    throw new UnauthorizedError(
      'RailRadar API Key is missing. Ensure RailRadar_api_key or RAIL_API_KEY is configured in .env'
    )
  }

  // Construct full URL with query parameters
  const url = new URL(`${RAIL_API_CONFIG.BASE_URL}${endpoint}`)
  Object.keys(queryParams).forEach((key) => {
    const val = queryParams[key]
    if (val !== undefined && val !== null && val !== '') {
      url.searchParams.append(key, String(val))
    }
  })

  // Timeout control
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const defaultHeaders = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...headers,
  }

  try {
    const response = await fetch(url.toString(), {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    let jsonBody = null
    try {
      jsonBody = await response.json()
    } catch {
      jsonBody = null
    }

    // Handle non-2xx HTTP status codes
    if (!response.ok) {
      throw parseApiError(response.status, jsonBody)
    }

    // Explicitly check standard response envelope success flag
    if (!jsonBody || jsonBody.success !== true) {
      throw parseApiError(response.status || 400, jsonBody)
    }

    return jsonBody
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request to ${endpoint} timed out after ${timeoutMs}ms`)
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError(`Failed to connect to RailRadar API at ${endpoint}`)
    }

    throw error
  }
}

/**
 * Public wrapper client executing request with caching & deduplication
 */
export async function executeRailRequest(endpoint, queryParams = {}, options = {}) {
  const { ttlMs = 0, bypassCache = false, ...fetchOptions } = options
  const cacheKey = railCache.createKey(endpoint, queryParams)

  if (ttlMs > 0 && fetchOptions.method !== 'POST' && fetchOptions.method !== 'DELETE') {
    return railCache.executeWithCache(
      cacheKey,
      ttlMs,
      () => rawRailFetch(endpoint, queryParams, fetchOptions),
      bypassCache
    )
  }

  return rawRailFetch(endpoint, queryParams, fetchOptions)
}

export default executeRailRequest
