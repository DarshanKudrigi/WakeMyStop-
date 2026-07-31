const { executeRailRequest } = require('./client.js')
const { ENDPOINTS, RAIL_API_CONFIG } = require('./constants.js')
const { sanitizeTrainNumber, sanitizeStationCode, sanitizeDate } = require('./helpers.js')

/**
 * Service Module 1: Trains API Wrapper Functions
 */

async function getTrainDetails(trainNumber, options = {}) {
  const number = sanitizeTrainNumber(trainNumber)
  const haltsOnly = options.haltsOnly !== undefined ? Boolean(options.haltsOnly) : true

  return executeRailRequest(
    ENDPOINTS.TRAIN_DETAILS(number),
    { haltsOnly },
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.STATIC_TRAIN_DETAILS,
      bypassCache: options.bypassCache,
    }
  )
}

async function getLiveTrainStatus(trainNumber, options = {}) {
  const number = sanitizeTrainNumber(trainNumber)
  const queryParams = {}

  if (options.date) queryParams.date = sanitizeDate(options.date)
  if (options.haltsOnly !== undefined) queryParams.haltsOnly = Boolean(options.haltsOnly)
  if (options.geometry !== undefined) queryParams.geometry = Boolean(options.geometry)
  if (options.format) queryParams.format = options.format
  if (options.includeCoordinates !== undefined) queryParams.includeCoordinates = Boolean(options.includeCoordinates)

  return executeRailRequest(
    ENDPOINTS.LIVE_TRAIN_STATUS(number),
    queryParams,
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.LIVE_TRAIN_STATUS,
      bypassCache: options.bypassCache,
    }
  )
}

async function getTrainRouteGeometry(trainNumber, options = {}) {
  const number = sanitizeTrainNumber(trainNumber)
  const queryParams = {
    format: options.format || 'geojson',
    stops: options.stops !== undefined ? Boolean(options.stops) : true,
  }

  return executeRailRequest(
    ENDPOINTS.TRAIN_ROUTE_GEOMETRY(number),
    queryParams,
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.TRAIN_ROUTE_GEOMETRY,
      bypassCache: options.bypassCache,
    }
  )
}

async function getTrainsBetweenStations(fromStation, toStation, options = {}) {
  const from = sanitizeStationCode(fromStation)
  const to = sanitizeStationCode(toStation)

  const queryParams = {}
  if (options.date) queryParams.date = sanitizeDate(options.date)
  if (options.live !== undefined) queryParams.live = Boolean(options.live)
  if (options.byCity !== undefined) queryParams.byCity = Boolean(options.byCity)
  if (options.type) queryParams.type = options.type
  if (options.category) queryParams.category = options.category

  return executeRailRequest(
    ENDPOINTS.TRAINS_BETWEEN_STATIONS(from, to),
    queryParams,
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.TRAINS_BETWEEN_STATIONS,
      bypassCache: options.bypassCache,
    }
  )
}

module.exports = {
  getTrainDetails,
  getLiveTrainStatus,
  getTrainRouteGeometry,
  getTrainsBetweenStations,
}
