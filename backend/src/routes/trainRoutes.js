const express = require('express')
const router = express.Router()
const trainController = require('../controllers/trainController')

router.get('/between', trainController.getTrainsBetween)
router.get('/:trainNo/live', trainController.getLiveTrainStatus)
router.get('/:trainNo', trainController.getTrainDetails)

module.exports = router
