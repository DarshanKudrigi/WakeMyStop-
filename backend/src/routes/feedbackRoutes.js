const express = require('express');

const feedbackController = require('../controllers/feedbackController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createFeedbackValidator,
  feedbackIdValidator,
  listFeedbackValidator,
  updateFeedbackValidator,
} = require('../validators/feedbackValidators');

const router = express.Router();

router.use(protect);

router.post('/', createFeedbackValidator, validateRequest, feedbackController.createFeedback);
router.get('/', listFeedbackValidator, validateRequest, feedbackController.getFeedbacks);
router.get('/:id', feedbackIdValidator, validateRequest, feedbackController.getFeedbackById);
router.patch('/:id', feedbackIdValidator, updateFeedbackValidator, validateRequest, feedbackController.updateFeedback);
router.delete('/:id', feedbackIdValidator, validateRequest, feedbackController.deleteFeedback);

module.exports = router;
