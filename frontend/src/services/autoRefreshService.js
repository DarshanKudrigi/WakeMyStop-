/**
 * Auto-Refresh Service Proxy
 * Delegated adapter linking reactive components to the smartRefreshEngine.
 * Guarantees zero duplicate schedulers or timers exist across the project.
 */

import { smartRefreshEngine } from './smartRefreshEngine'

class AutoRefreshServiceAdapter {
  start(trainNo) {
    if (!trainNo) return
    smartRefreshEngine.startScheduler(trainNo)
  }

  stop() {
    smartRefreshEngine.stopScheduler()
  }

  async manualRefresh(trainNo) {
    return await smartRefreshEngine.triggerManualRefresh(trainNo)
  }

  subscribe(callback) {
    smartRefreshEngine.listeners.add(callback)
    return () => smartRefreshEngine.listeners.delete(callback)
  }
}

export const autoRefreshService = new AutoRefreshServiceAdapter()
