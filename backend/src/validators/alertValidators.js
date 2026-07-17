const { body, param, query } = require('express-validator');

const allowedAlertTypes = ['pre-arrival', 'delay-anomaly', 'arrived', 'custom'];
const allowedAlertStatus = ['pending', 'processed'];

const createAlertValidator = [
  body('journeyId').isMongoId().withMessage('journeyId must be a valid MongoDB ObjectId'),
  body('type').isIn(allowedAlertTypes).withMessage(`type must be one of: ${allowedAlertTypes.join(', ')}`),
  body('message').optional().trim().isString().withMessage('message must be a string'),
  body('triggeredAt').optional().isISO8601().withMessage('triggeredAt must be a valid date').toDate(),
  body('status').optional().isIn(allowedAlertStatus).withMessage(`status must be one of: ${allowedAlertStatus.join(', ')}`),
  body('metadata').optional(),
];

const updateAlertValidator = [
  body('journeyId').not().exists().withMessage('journeyId cannot be changed'),
  body('type').optional().isIn(allowedAlertTypes).withMessage(`type must be one of: ${allowedAlertTypes.join(', ')}`),
  body('message').optional().trim().isString().withMessage('message must be a string'),
  body('triggeredAt').optional().isISO8601().withMessage('triggeredAt must be a valid date').toDate(),
  body('status').optional().isIn(allowedAlertStatus).withMessage(`status must be one of: ${allowedAlertStatus.join(', ')}`),
  body('metadata').optional(),
];

const alertIdValidator = [param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId')];

const listAlertValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
  query('status').optional().isIn(allowedAlertStatus).withMessage(`status must be one of: ${allowedAlertStatus.join(', ')}`),
  query('type').optional().isIn(allowedAlertTypes).withMessage(`type must be one of: ${allowedAlertTypes.join(', ')}`),
];

module.exports = {
  alertIdValidator,
  createAlertValidator,
  listAlertValidator,
  updateAlertValidator,
};
