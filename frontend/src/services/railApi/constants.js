/**
 * RailRadar API Integration Constants & Configuration (Frontend Service Layer)
 */

export const RAIL_API_CONFIG = {
  BASE_URL: import.meta.env.VITE_RAIL_API_BASE_URL || 'https://api.railradar.in/v1',
  API_KEY: import.meta.env.VITE_RAILRADAR_API_KEY || import.meta.env.VITE_RAIL_API_KEY || '',
  DEFAULT_TIMEOUT_MS: 10000,
  
  MAX_REQUESTS_PER_MINUTE: 100,
  
  CACHE_TTL: {
    LOOKUPS: 24 * 60 * 60 * 1000,
    STATIC_TRAIN_DETAILS: 12 * 60 * 60 * 1000,
    TRAIN_ROUTE_GEOMETRY: 24 * 60 * 60 * 1000,
    TRAINS_BETWEEN_STATIONS: 30 * 60 * 1000,
    STATION_STATIC_BOARD: 2 * 60 * 60 * 1000,
    LIVE_TRAIN_STATUS: 60 * 1000,
    STATION_LIVE_BOARD: 90 * 1000,
  },
}

export const ENDPOINTS = {
  TRAIN_DETAILS: (number) => `/trains/${number}`,
  LIVE_TRAIN_STATUS: (number) => `/trains/${number}/live`,
  TRAIN_ROUTE_GEOMETRY: (number) => `/trains/${number}/route`,
  TRAINS_BETWEEN_STATIONS: (from, to) => `/trains/between/${from}/${to}`,

  STATION_TRAIN_BOARD_STATIC: (code) => `/stations/${code}/trains`,
  STATION_LIVE_BOARD: (code) => `/stations/${code}/live`,

  TRAIN_LOOKUP: '/lookup/trains',
  STATION_LOOKUP: '/lookup/stations',

  LEGACY_STATIONS_ALL_KVS: '/legacy/stations/all-kvs',
  LEGACY_TRAINS_ALL_KVS: '/legacy/trains/all-kvs',
  LEGACY_TRAINS_BETWEEN: '/legacy/trains/between',
  LEGACY_SHIPPING_FIND_TRAINS: '/legacy/modules/shipping/find-trains',
  LEGACY_TRAIN_DETAILS: (number) => `/legacy/trains/${number}`,
}
