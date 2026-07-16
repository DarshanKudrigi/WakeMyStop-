const express = require('express');

const journeyController = require('../controllers/journeyController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createJourneyValidator,
  idParamValidator,
  listJourneyValidator,
  updateJourneyValidator,
} = require('../validators/journeyValidators');

const router = express.Router();

router.use(protect);

router.post('/', createJourneyValidator, validateRequest, journeyController.createJourney);
router.get('/', listJourneyValidator, validateRequest, journeyController.getJourneys);
router.get('/:id', idParamValidator, validateRequest, journeyController.getJourneyById);
router.patch('/:id', idParamValidator, updateJourneyValidator, validateRequest, journeyController.updateJourney);
router.delete('/:id', idParamValidator, validateRequest, journeyController.deleteJourney);

module.exports = router;
