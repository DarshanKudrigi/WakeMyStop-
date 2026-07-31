const { RAIL_API_CONFIG } = require('./constants.js')
const { parseApiError, NetworkError, TimeoutError, UnauthorizedError } = require('./errors.js')
const { railCache } = require('./cache.js')

/**
 * Low-level shared HTTP client for RailRadar REST API
 */
async function rawRailFetch(endpoint, queryParams = {}, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeoutMs = RAIL_API_CONFIG.DEFAULT_TIMEOUT_MS,
    apiKey = RAIL_API_CONFIG.API_KEY,
  } = options

  if (!apiKey) {
    console.error('❌ [RailRadar UPSTREAM] MISSING API KEY! Check backend/.env for RailRadar_api_key')
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

  const maskedKey = apiKey ? `${apiKey.slice(0, 8)}...` : 'MISSING'
  console.log(`📡 [RailRadar UPSTREAM REQUEST]`, {
    timestamp: new Date().toISOString(),
    method,
    url: url.toString(),
    apiKeyPresent: Boolean(apiKey),
    maskedApiKey: maskedKey,
    headers: {
      Authorization: `Bearer ${maskedKey}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
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

    console.log(`📥 [RailRadar UPSTREAM RESPONSE]`, {
      url: url.toString(),
      status: response.status,
      statusText: response.statusText,
      successFlag: jsonBody?.success || jsonBody?.response?.success || false,
      sampleResponse: JSON.stringify(jsonBody).slice(0, 200),
    })

    // Handle non-2xx HTTP status codes
    if (!response.ok) {
      throw parseApiError(response.status, jsonBody)
    }

    // Explicitly check standard response envelope success flag (handles both top-level and nested response envelope)
    const isSuccess = jsonBody && (jsonBody.success === true || jsonBody.response?.success === true || jsonBody.httpStatus === 200)
    if (!jsonBody || !isSuccess) {
      throw parseApiError(response.status || 400, jsonBody)
    }

    // Return inner envelope if wrapped under jsonBody.response
    if (jsonBody.response && typeof jsonBody.response === 'object') {
      return jsonBody.response
    }

    return jsonBody
  } catch (error) {
    clearTimeout(timeoutId)

    console.error(`💥 [RailRadar UPSTREAM ERROR] ${endpoint}:`, error.message)

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
async function executeRailRequest(endpoint, queryParams = {}, options = {}) {
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

module.exports = {
  rawRailFetch,
  executeRailRequest,
}
