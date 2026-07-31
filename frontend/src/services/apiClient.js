/**
 * Centralized Reusable API Client Layer
 * Handles authentication, timeout control, response envelope normalization,
 * development request logging, and configurable USE_MOCK_DATA toggling.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true'
const IS_DEV = import.meta.env.DEV

/**
 * Standardized Response Normalization Envelope Factory
 */
export function createResponseEnvelope(success, data, error = null, options = {}) {
  return {
    success: Boolean(success),
    httpStatus: options.httpStatus || (success ? 200 : 400),
    data: data || null,
    error: error ? String(error) : null,
    isMock: Boolean(options.isMock),
    responseTimeMs: options.responseTimeMs || 0,
  }
}

/**
 * Development Request Logger
 */
function logApiRequest(method, endpoint, durationMs, status, isMock, error = null) {
  if (!IS_DEV) return
  const modeTag = isMock ? '%c[API Client MOCK]' : '%c[API Client LIVE]'
  const modeStyle = isMock ? 'color: #3b82f6; font-weight: bold;' : 'color: #10b981; font-weight: bold;'

  if (error) {
    console.groupCollapsed(`${modeTag} ❌ ${method} ${endpoint} (${durationMs}ms) - Status: ${status}`, modeStyle)
    console.error('Error Details:', error)
    console.groupEnd()
  } else {
    console.log(`${modeTag} 🟢 ${method} ${endpoint} (${durationMs}ms) - Status: ${status}`, modeStyle)
  }
}

/**
 * Main Centralized API Client Function
 */
export async function executeApiClient(endpoint, options = {}) {
  const startTime = performance.now()
  const {
    method = 'GET',
    headers = {},
    body = null,
    timeoutMs = 10000,
    mockFallbackData = null,
  } = options

  // 1. EXPLICIT MOCK MODE SHORT-CIRCUIT (Only active if VITE_USE_MOCK_DATA=true)
  if (USE_MOCK_DATA) {
    const durationMs = Math.round(performance.now() - startTime)
    logApiRequest(method, endpoint, durationMs, 200, true)

    return createResponseEnvelope(true, mockFallbackData || [], null, {
      httpStatus: 200,
      isMock: true,
      responseTimeMs: durationMs,
    })
  }

  // 2. LIVE HTTP REQUEST WITH TIMEOUT CONTROL
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    })

    clearTimeout(timer)
    const durationMs = Math.round(performance.now() - startTime)

    let jsonBody = null
    try {
      jsonBody = await response.json()
    } catch {
      jsonBody = null
    }

    if (!response.ok) {
      const errMessage = jsonBody?.message || `HTTP ${response.status} ${response.statusText}`
      logApiRequest(method, endpoint, durationMs, response.status, false, errMessage)
      return createResponseEnvelope(false, null, errMessage, {
        httpStatus: response.status,
        isMock: false,
        responseTimeMs: durationMs,
      })
    }

    const payloadData = jsonBody?.data !== undefined ? jsonBody.data : jsonBody
    logApiRequest(method, endpoint, durationMs, response.status, false)

    return createResponseEnvelope(true, payloadData, null, {
      httpStatus: response.status,
      isMock: false,
      responseTimeMs: durationMs,
    })
  } catch (err) {
    clearTimeout(timer)
    const durationMs = Math.round(performance.now() - startTime)
    let errorMessage = err.message

    if (err.name === 'AbortError') {
      errorMessage = `Request timed out after ${timeoutMs}ms`
    } else if (err instanceof TypeError && err.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to reach backend server'
    }

    logApiRequest(method, endpoint, durationMs, 0, false, errorMessage)

    // Return explicit error envelope without mock data fallback
    return createResponseEnvelope(false, null, errorMessage, {
      httpStatus: 500,
      isMock: false,
      responseTimeMs: durationMs,
    })
  }
}
