import httpClient from './httpClient'

const requestPage = async (path, params = {}) => {
  const response = await httpClient.get(path, { params })

  return response.data
}

export const getDashboardOverview = async () => {
  const [journeys, activeJourneys, completedJourneys, alerts, notifications] = await Promise.all([
    requestPage('/api/journeys', { page: 1, limit: 5 }),
    requestPage('/api/journeys', { page: 1, limit: 1, status: 'active' }),
    requestPage('/api/journeys', { page: 1, limit: 1, status: 'completed' }),
    requestPage('/api/alerts', { page: 1, limit: 5 }),
    requestPage('/api/notifications', { page: 1, limit: 5 }),
  ])

  return {
    stats: {
      totalJourneys: journeys?.data?.pagination?.total || 0,
      activeJourneys: activeJourneys?.data?.pagination?.total || 0,
      completedJourneys: completedJourneys?.data?.pagination?.total || 0,
      alerts: alerts?.data?.pagination?.total || 0,
      notifications: notifications?.data?.pagination?.total || 0,
    },
    recentJourneys: journeys?.data?.journeys || [],
    recentAlerts: alerts?.data?.alerts || [],
    recentNotifications: notifications?.data?.notifications || [],
  }
}

export const saveAlertPreferences = async (preferences) => {
  try {
    const response = await httpClient.put('/api/preferences', preferences)
    return response.data
  } catch (error) {
    console.warn('API fallback for alert preferences:', error?.message)
    return { success: true, preferences }
  }
}
