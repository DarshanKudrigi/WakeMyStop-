import executeRailRequest from './client.js'
import { ENDPOINTS, RAIL_API_CONFIG } from './constants.js'
import { sanitizeTrainNumber, sanitizeStationCode, sanitizeDate } from './helpers.js'

/**
 * Service Module 1: Trains API Wrapper Functions
 */

/**
 * 2.1 Get Train Details
 * Returns static schedule, running days, total halts, and full station timetable.
 *
 * @param {string|number} trainNumber - 5-digit train number
 * @param {object} [options]
 * @param {boolean} [options.haltsOnly=true] - Return only halting stops, skipping pass-throughs
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').TrainDetailsData>>}
 */
export async function getTrainDetails(trainNumber, options = {}) {
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

/**
 * 2.2 Get Live Train Status
 * Returns real-time train position, overall delay, segment progress, exceptions, and live station delay schedule.
 *
 * @param {string|number} trainNumber - 5-digit train number
 * @param {object} [options]
 * @param {string} [options.date] - Journey start date (YYYY-MM-DD). Omit to auto-detect.
 * @param {boolean} [options.haltsOnly=true] - Filter route to halting stops only
 * @param {boolean} [options.geometry=false] - Include map-ready route geometry
 * @param {'polyline'|'geojson'|'coordinates'} [options.format='polyline'] - Geometry format
 * @param {boolean} [options.includeCoordinates=false] - Include lat/lng for each station in route array
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').LiveTrainStatusData>>}
 */
export async function getLiveTrainStatus(trainNumber, options = {}) {
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

/**
 * 2.3 Get Train Route Geometry
 * Returns physical shape of a train's route for map rendering (GeoJSON, Polyline, or coordinates array).
 *
 * @param {string|number} trainNumber - 5-digit train number
 * @param {object} [options]
 * @param {'geojson'|'polyline'|'coordinates'} [options.format='geojson'] - Response format
 * @param {boolean} [options.stops=true] - Include station stop coordinates
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').RouteGeometryData>>}
 */
export async function getTrainRouteGeometry(trainNumber, options = {}) {
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

/**
 * 2.4 Get Trains Between Stations
 * Finds every train travelling between two given stations with optional date, live status, and type filtering.
 *
 * @param {string} fromStation - Source station code (e.g. "MYS", "UJN")
 * @param {string} toStation - Destination station code (e.g. "SBC", "INDB")
 * @param {object} [options]
 * @param {string} [options.date] - Filter by date train is at "from" station (YYYY-MM-DD)
 * @param {boolean} [options.live=false] - Enrich each train with live status at "from" station
 * @param {boolean} [options.byCity=false] - Expand search to all stations in city
 * @param {string} [options.type] - Filter by train type (e.g. "vande-bharat", "express")
 * @param {string} [options.category] - Filter by category (e.g. "Premium", "Express")
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').TrainsBetweenData>>}
 */
export async function getTrainsBetweenStations(fromStation, toStation, options = {}) {
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
