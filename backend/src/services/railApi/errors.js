/**
 * Centralized Custom Error Classes for RailRadar API
 * Encapsulates standard response envelope error shape and HTTP status codes.
 */

export class RailApiError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} status - HTTP Status code (400, 401, 404, 429, 503, etc.)
   * @param {string} code - Machine-readable error code (e.g. VALIDATION_ERROR, NOT_FOUND)
   * @param {object} [meta] - Request metadata (traceId, timestamp, source, executionTime)
   * @param {string} [details] - Additional diagnostic details
   */
  constructor(message, status = 500, code = 'API_ERROR', meta = null, details = null) {
    super(message)
    this.name = 'RailApiError'
    this.status = status
    this.code = code
    this.meta = meta || {
      traceId: null,
      timestamp: new Date().toISOString(),
      executionTime: 0,
      source: 'client_handler',
    }
    this.details = details
  }

  toJSON() {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details || undefined,
      },
      meta: this.meta,
      status: this.status,
    }
  }
}

export class ValidationError extends RailApiError {
  constructor(message = 'Invalid request parameters', details = null, meta = null) {
    super(message, 400, 'VALIDATION_ERROR', meta, details)
    this.name = 'ValidationError'
  }
}

export class UnauthorizedError extends RailApiError {
  constructor(message = 'Unauthorized — missing or invalid Authorization Bearer API token', meta = null) {
    super(message, 401, 'UNAUTHORIZED', meta)
    this.name = 'UnauthorizedError'
  }
}

export class NotFoundError extends RailApiError {
  constructor(message = 'Resource not found (train, station, or journey date does not exist)', meta = null) {
    super(message, 404, 'NOT_FOUND', meta)
    this.name = 'NotFoundError'
  }
}

export class RateLimitExceededError extends RailApiError {
  constructor(message = 'Rate limit exceeded — too many requests to RailRadar API', meta = null) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', meta)
    this.name = 'RateLimitExceededError'
  }
}

export class ServiceUnavailableError extends RailApiError {
  constructor(message = 'Upstream railway service unavailable (NTES data source down)', meta = null) {
    super(message, 503, 'SERVICE_UNAVAILABLE', meta)
    this.name = 'ServiceUnavailableError'
  }
}

export class NetworkError extends RailApiError {
  constructor(message = 'Network connection failed while reaching RailRadar API server', meta = null) {
    super(message, 0, 'NETWORK_FAILURE', meta)
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends RailApiError {
  constructor(message = 'RailRadar API request timed out', meta = null) {
    super(message, 408, 'REQUEST_TIMEOUT', meta)
    this.name = 'TimeoutError'
  }
}

/**
 * Factory helper to parse response error body or status code into appropriate RailApiError instance
 */
export function parseApiError(responseStatus, responseBody = null) {
  const errorObj = responseBody?.error || {}
  const metaObj = responseBody?.meta || null
  const code = errorObj.code || 'UNKNOWN_ERROR'
  const message = errorObj.message || `HTTP ${responseStatus} Error`
  const details = errorObj.details || null

  switch (responseStatus) {
    case 400:
      return new ValidationError(message, details, metaObj)
    case 401:
      return new UnauthorizedError(message, metaObj)
    case 404:
      return new NotFoundError(message, metaObj)
    case 429:
      return new RateLimitExceededError(message, metaObj)
    case 503:
      return new ServiceUnavailableError(message, metaObj)
    default:
      return new RailApiError(message, responseStatus, code, metaObj, details)
  }
}
