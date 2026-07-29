/**
 * Event-Based Notification & Alert Dispatcher Framework
 * Prepares RailAlert AI for multi-channel trigger alerts:
 * 1. Push Notification / In-App Alert
 * 2. Message (SMS / WhatsApp)
 * 3. Phone Call (Automated IVR)
 * 4. Alarm Sound
 * 5. Device Vibration
 */

class NotificationService {
  constructor() {
    this.listeners = new Set()
  }

  /**
   * Subscribe to notification events
   * @param {Function} callback 
   * @returns {Function} unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Dispatch trigger event across registered channels
   * @param {Object} eventPayload 
   */
  triggerAlert(eventPayload) {
    const { type, message, trainNo, station, preferences } = eventPayload

    const payload = {
      id: `evt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: type || 'DESTINATION_APPROACH',
      message: message || `Approaching destination station ${station}`,
      trainNo: trainNo || '20608',
      station: station || 'BIDADI',
      channels: {
        inAppNotification: preferences?.enableNotifications ?? true,
        alarmSound: preferences?.alarmSound || 'Default Bell',
        vibration: preferences?.vibration ?? true,
        messageSms: preferences?.smsEnabled ?? false,
        phoneCall: preferences?.phoneCallEnabled ?? false,
      },
    }

    console.log('[NotificationService] Alert triggered:', payload)

    // Execute Browser Vibration API if supported and enabled
    if (payload.channels.vibration && 'vibrate' in navigator) {
      try {
        navigator.vibrate([500, 250, 500])
      } catch {
        /* Ignore vibration errors */
      }
    }

    // Notify subscribers
    this.listeners.forEach((listener) => listener(payload))
    return payload
  }
}

export const notificationService = new NotificationService()
