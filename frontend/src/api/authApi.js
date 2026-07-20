import axios from 'axios'

import { getToken, removeToken } from '../utils/auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

const buildFriendlyError = (error) => {
  if (!error.response) {
    return 'Network error. Please check your connection and try again.'
  }

  const message = error.response.data?.message

  if (error.response.status === 401) {
    return message || 'Session expired. Please log in again.'
  }

  if (error.response.status === 409) {
    return message || 'A record already exists with the provided details.'
  }

  return message || 'Something went wrong. Please try again.'
}

const throwFriendlyError = (error) => {
  throw new Error(buildFriendlyError(error), { cause: error })
}

api.interceptors.request.use((config) => {
  const token = getToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const login = async (payload) => {
  try {
    const response = await api.post('/api/auth/login', payload)

    return response.data
  } catch (error) {
    throwFriendlyError(error)
  }
}

export const register = async (payload) => {
  try {
    const response = await api.post('/api/auth/register', payload)

    return response.data
  } catch (error) {
    throwFriendlyError(error)
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/api/auth/logout')

    removeToken()

    return response.data
  } catch (error) {
    removeToken()
    throwFriendlyError(error)
  }
}

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me')

    return response.data
  } catch (error) {
    if (error.response?.status === 401) {
      removeToken()
      throw new Error('Session expired. Please log in again.', { cause: error })
    }

    throwFriendlyError(error)
  }
}
