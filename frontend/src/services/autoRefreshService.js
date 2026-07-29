/**
 * Auto-Refresh Polling Service
 * Background polling manager driving 15-second updates for live journey monitoring.
 */

import { getLiveTrainStatus } from './trainService'

class AutoRefreshService {
  constructor() {
    this.timer = null
    this.activeTrainNo = null
    this.subscribers = new Set()
  }

  start(trainNo) {
    this.stop()
    this.activeTrainNo = trainNo
    
    // Immediate initial poll
    this.poll()

    // 15-second interval timer
    this.timer = setInterval(() => {
      this.poll()
    }, 15000)
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.activeTrainNo = null
  }

  async poll() {
    if (!this.activeTrainNo) return
    const statusData = await getLiveTrainStatus(this.activeTrainNo)
    this.subscribers.forEach((cb) => cb(statusData))
  }

  subscribe(callback) {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }
}

export const autoRefreshService = new AutoRefreshService()
