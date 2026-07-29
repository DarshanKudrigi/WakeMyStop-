/**
 * Base API Service Layer
 * Abstracts HTTP client and backend integration.
 * Supports switching between Mock Data, Backend Proxy, and Direct Railway APIs.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export async function apiRequest(endpoint, options = {}) {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.warn(`[apiService] Request failed for ${endpoint}, falling back to mock driver:`, error.message)
    return null
  }
}
