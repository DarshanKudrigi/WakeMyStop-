import executeRailRequest from './client.js'
import { ENDPOINTS, RAIL_API_CONFIG } from './constants.js'
import { sanitizeStationCode } from './helpers.js'

/**
 * Service Module 2: Station Board API Wrapper Functions
 */

/**
 * 3.1 Station Train Board (Static)
 * Lists all trains that stop at a station along with their scheduled arrival/departure times.
 *
 * @param {string} stationCode - Station code (e.g. "MYS", "INDB")
 * @param {object} [options]
 * @param {boolean} [options.includeIntermediate=false] - Include pass-through (non-halting) trains
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').StationBoardData>>}
 */
export async function getStationTrainBoard(stationCode, options = {}) {
  const code = sanitizeStationCode(stationCode)
  const queryParams = {
    includeIntermediate: options.includeIntermediate !== undefined ? Boolean(options.includeIntermediate) : false,
  }

  return executeRailRequest(
    ENDPOINTS.STATION_TRAIN_BOARD_STATIC(code),
    queryParams,
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.STATION_STATIC_BOARD,
      bypassCache: options.bypassCache,
    }
  )
}

/**
 * 3.2 Station Live Board
 * A live arrival/departure display board for a station (platform screen simulation).
 *
 * @param {string} stationCode - Station code
 * @param {object} [options]
 * @param {2|4|6|8} [options.hours=4] - Hours ahead to look for trains
 * @param {boolean} [options.includeIntermediate=false] - Include pass-through trains
 * @param {boolean} [options.bypassCache=false]
 * @returns {Promise<import('./types').RailApiEnvelope<import('./types').StationLiveBoardData>>}
 */
export async function getStationLiveBoard(stationCode, options = {}) {
  const code = sanitizeStationCode(stationCode)
  const queryParams = {
    hours: options.hours || 4,
    includeIntermediate: options.includeIntermediate !== undefined ? Boolean(options.includeIntermediate) : false,
  }

  return executeRailRequest(
    ENDPOINTS.STATION_LIVE_BOARD(code),
    queryParams,
    {
      ttlMs: RAIL_API_CONFIG.CACHE_TTL.STATION_LIVE_BOARD,
      bypassCache: options.bypassCache,
    }
  )
}
