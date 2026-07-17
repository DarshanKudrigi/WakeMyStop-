const { body, param, query } = require('express-validator');

const allowedAlertTimeliness = ['tooEarly', 'justRight', 'tooLate', 'didNotReceive'];

const createFeedbackValidator = [
  body('journeyId').isMongoId().withMessage('journeyId must be a valid MongoDB ObjectId'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5').toInt(),
  body('missedStop').optional().isBoolean().withMessage('missedStop must be a boolean').toBoolean(),
  body('alertTimeliness').optional().isIn(allowedAlertTimeliness).withMessage(`alertTimeliness must be one of: ${allowedAlertTimeliness.join(', ')}`),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('comments must not exceed 500 characters'),
];

const updateFeedbackValidator = [
  body('journeyId').not().exists().withMessage('journeyId cannot be changed'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('rating must be an integer between 1 and 5').toInt(),
  body('missedStop').optional().isBoolean().withMessage('missedStop must be a boolean').toBoolean(),
  body('alertTimeliness').optional().isIn(allowedAlertTimeliness).withMessage(`alertTimeliness must be one of: ${allowedAlertTimeliness.join(', ')}`),
  body('comments').optional().trim().isLength({ max: 500 }).withMessage('comments must not exceed 500 characters'),
];

const feedbackIdValidator = [param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId')];

const listFeedbackValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
];

module.exports = {
  createFeedbackValidator,
  feedbackIdValidator,
  listFeedbackValidator,
  updateFeedbackValidator,
};
