const { getTrainsBetweenStations, getTrainDetails: fetchTrainDetails, getLiveTrainStatus: fetchLiveStatus } = require('../services/railApi/trainsService.js')

/**
 * Controller 1: Get Trains Between Stations
 * GET /api/trains/between?from=MYS&to=SBC&date=2026-07-29
 */
exports.getTrainsBetween = async (req, res, next) => {
  try {
    const { from, to, date, category } = req.query
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        message: 'Source (from) and Destination (to) station codes are required.',
      })
    }

    console.log(`[Train Search BACKEND PROXY] 🛰️ Forwarding request to RailRadar API: from=${from}, to=${to}, date=${date || 'N/A'}`)

    const response = await getTrainsBetweenStations(from, to, { date, category })

    res.status(200).json(response)
  } catch (error) {
    console.error('❌ Controller Error in getTrainsBetween:', error.message)
    next(error)
  }
}

/**
 * Controller 2: Get Train Details
 * GET /api/trains/:trainNo
 */
exports.getTrainDetails = async (req, res, next) => {
  try {
    const { trainNo } = req.params
    if (!trainNo) {
      return res.status(400).json({
        success: false,
        message: 'Train number parameter is required.',
      })
    }

    console.log(`[Train Details BACKEND PROXY] 🛰️ Fetching details for train: ${trainNo}`)

    const response = await fetchTrainDetails(trainNo)

    res.status(200).json(response)
  } catch (error) {
    console.error('❌ Controller Error in getTrainDetails:', error.message)
    next(error)
  }
}

/**
 * Controller 3: Get Live Train Status
 * GET /api/trains/:trainNo/live
 */
exports.getLiveTrainStatus = async (req, res, next) => {
  try {
    const { trainNo } = req.params
    const { date } = req.query

    if (!trainNo) {
      return res.status(400).json({
        success: false,
        message: 'Train number parameter is required.',
      })
    }

    const response = await fetchLiveStatus(trainNo, { date })

    res.status(200).json(response)
  } catch (error) {
    console.error('❌ Controller Error in getLiveTrainStatus:', error.message)
    next(error)
  }
}
