const TOKEN_KEY = 'railalert_token'

const decodeTokenPayload = (token) => {
  try {
    const payload = token.split('.')[1]
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(normalized)

    return JSON.parse(json)
  } catch {
    return null
  }
}

export const saveToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = () => localStorage.getItem(TOKEN_KEY)

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const isAuthenticated = () => {
  const token = getToken()

  if (!token) {
    return false
  }

  const payload = decodeTokenPayload(token)

  if (!payload?.exp) {
    return false
  }

  return payload.exp * 1000 > Date.now()
}

export const getTokenExpiryMessage = () => {
  const token = getToken()

  if (!token) {
    return 'No active session found.'
  }

  const payload = decodeTokenPayload(token)

  if (!payload?.exp) {
    return 'Session is invalid. Please log in again.'
  }

  return payload.exp * 1000 > Date.now()
    ? 'Session is active.'
    : 'Session expired. Please log in again.'
}
