/**
 * RailRadar API Integration Constants & Configuration
 * Standard Reference: RailRadar Developer API Reference Guide v1.0
 */

export const RAIL_API_CONFIG = {
  BASE_URL: process.env.RAIL_API_BASE_URL || 'https://api.railradar.in/v1',
  API_KEY: process.env.RailRadar_api_key || process.env.RAIL_API_KEY || '',
  DEFAULT_TIMEOUT_MS: 10000,
  
  // Rate Limit Safeguards (Free Tier: 100 req/min, 50 daily credit limit)
  MAX_REQUESTS_PER_MINUTE: 100,
  
  // Smart In-Memory Cache TTLs (in milliseconds) to conserve credits
  CACHE_TTL: {
    LOOKUPS: 24 * 60 * 60 * 1000,        // 24 Hours (Static train & station code maps)
    STATIC_TRAIN_DETAILS: 12 * 60 * 60 * 1000, // 12 Hours (Train schedule, running days)
    TRAIN_ROUTE_GEOMETRY: 24 * 60 * 60 * 1000, // 24 Hours (Map geometry shapes)
    TRAINS_BETWEEN_STATIONS: 30 * 60 * 1000,   // 30 Minutes (Train list timetable)
    STATION_STATIC_BOARD: 2 * 60 * 60 * 1000,   // 2 Hours
    LIVE_TRAIN_STATUS: 60 * 1000,               // 60 Seconds (Live train location)
    STATION_LIVE_BOARD: 90 * 1000,              // 90 Seconds (Platform departure board)
  },
}

export const ENDPOINTS = {
  // Trains Module
  TRAIN_DETAILS: (number) => `/trains/${number}`,
  LIVE_TRAIN_STATUS: (number) => `/trains/${number}/live`,
  TRAIN_ROUTE_GEOMETRY: (number) => `/trains/${number}/route`,
  TRAINS_BETWEEN_STATIONS: (from, to) => `/trains/between/${from}/${to}`,

  // Station Board Module
  STATION_TRAIN_BOARD_STATIC: (code) => `/stations/${code}/trains`,
  STATION_LIVE_BOARD: (code) => `/stations/${code}/live`,

  // Lookup Module
  TRAIN_LOOKUP: '/lookup/trains',
  STATION_LOOKUP: '/lookup/stations',

  // Legacy Module
  LEGACY_STATIONS_ALL_KVS: '/legacy/stations/all-kvs',
  LEGACY_TRAINS_ALL_KVS: '/legacy/trains/all-kvs',
  LEGACY_TRAINS_BETWEEN: '/legacy/trains/between',
  LEGACY_SHIPPING_FIND_TRAINS: '/legacy/modules/shipping/find-trains',
  LEGACY_TRAIN_DETAILS: (number) => `/legacy/trains/${number}`,
}
