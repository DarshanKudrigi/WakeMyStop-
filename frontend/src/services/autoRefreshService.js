/**
 * Auto-Refresh Polling Service
 * Background polling manager driving 15-second updates for live journey monitoring.
 */

import { getLiveTrainStatus } from './trainService'

export const POLLING_INTERVAL_MS = 15000

class AutoRefreshService {
  constructor() {
    this.timer = null
    this.activeTrainNo = null
    this.subscribers = new Set()
  }

  start(trainNo) {
    if (!trainNo) return
    if (this.activeTrainNo === String(trainNo) && this.timer !== null) {
      return
    }

    this.stop()
    this.activeTrainNo = String(trainNo)
    
    console.log(`[AutoRefreshService] 🟢 Started ${POLLING_INTERVAL_MS / 1000}s polling for train: ${this.activeTrainNo}`)

    // Initial poll
    this.poll()

    // Single interval timer
    this.timer = setInterval(() => {
      this.poll()
    }, POLLING_INTERVAL_MS)
  }

  stop() {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
      console.log(`[AutoRefreshService] 🔴 Stopped polling for train: ${this.activeTrainNo}`)
    }
    this.activeTrainNo = null
  }

  /**
   * Resets the polling timer after a manual refresh so the next auto-poll occurs
   * exactly POLLING_INTERVAL_MS (15s) AFTER the manual refresh.
   */
  async manualRefresh() {
    if (!this.activeTrainNo) return null
    
    // 1. Execute immediate poll
    const statusData = await this.poll()

    // 2. Reset 15s interval timer from this point forward
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = setInterval(() => {
        this.poll()
      }, POLLING_INTERVAL_MS)
      console.log(`[AutoRefreshService] 🔄 Manual refresh executed. Timer reset for next poll in ${POLLING_INTERVAL_MS / 1000}s`)
    }

    return statusData
  }

  async poll() {
    if (!this.activeTrainNo) return null
    try {
      const statusData = await getLiveTrainStatus(this.activeTrainNo)
      this.subscribers.forEach((cb) => cb(statusData))
      return statusData
    } catch (err) {
      console.warn(`[AutoRefreshService] Poll failed for train ${this.activeTrainNo}:`, err.message)
      return null
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
}

export const autoRefreshService = new AutoRefreshService()
