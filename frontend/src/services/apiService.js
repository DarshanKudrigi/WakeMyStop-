/**
 * Base API Service Adapter
 * Delegates requests to the centralized apiClient layer.
 */

import { executeApiClient } from './apiClient'

export async function apiRequest(endpoint, options = {}) {
  return await executeApiClient(endpoint, options)
}
