/**
 * Higher-Level Train & Station Service
 * Handles search, details, and live status queries using API service abstraction.
 */

import { mockTrains } from '../data/trainsData'
import { apiRequest } from './apiService'

export async function searchTrains(fromStation, toStation, date) {
  const serverResult = await apiRequest(`/trains/between?from=${fromStation}&to=${toStation}&date=${date}`)
  if (serverResult && serverResult.data) {
    return serverResult.data
  }
  // Fallback to local mock data
  return mockTrains
}

export async function getTrainDetails(trainNo) {
  const serverResult = await apiRequest(`/trains/${trainNo}`)
  if (serverResult && serverResult.data) {
    return serverResult.data
  }
  // Fallback to local mock train search
  return mockTrains.find((t) => t.trainNo === String(trainNo)) || mockTrains[0]
}

export async function getLiveTrainStatus(trainNo) {
  const serverResult = await apiRequest(`/trains/${trainNo}/live-status`)
  if (serverResult && serverResult.data) {
    return serverResult.data
  }
  // Fallback mock live status payload
  const train = mockTrains.find((t) => t.trainNo === String(trainNo)) || mockTrains[0]
  return {
    trainNo: train.trainNo,
    trainName: train.trainName,
    currentStation: 'BIDADI',
    nextStation: 'HEJJALA',
    delayMinutes: train.delayMinutes || 8,
    status: train.status || 'Running On Time',
    lastUpdated: new Date().toISOString(),
  }
}
