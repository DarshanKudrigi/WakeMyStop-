const { body, param, query } = require('express-validator');

const allowedChannels = ['push', 'email', 'sms', 'whatsapp'];
const allowedStatus = ['pending', 'sent', 'failed', 'delivered'];

const createNotificationValidator = [
  body('alertId').isMongoId().withMessage('alertId must be a valid MongoDB ObjectId'),
  body('channel').isIn(allowedChannels).withMessage(`channel must be one of: ${allowedChannels.join(', ')}`),
  body('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  body('content').optional().trim().isString().withMessage('content must be a string'),
  body('providerResponse').optional(),
  body('retryCount').optional().isInt({ min: 0 }).withMessage('retryCount must be a non-negative integer').toInt(),
  body('sentAt').optional().isISO8601().withMessage('sentAt must be a valid date').toDate(),
];

const updateNotificationValidator = [
  body('alertId').not().exists().withMessage('alertId cannot be changed'),
  body('channel').optional().isIn(allowedChannels).withMessage(`channel must be one of: ${allowedChannels.join(', ')}`),
  body('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  body('content').optional().trim().isString().withMessage('content must be a string'),
  body('providerResponse').optional(),
  body('retryCount').optional().isInt({ min: 0 }).withMessage('retryCount must be a non-negative integer').toInt(),
  body('sentAt').optional().isISO8601().withMessage('sentAt must be a valid date').toDate(),
];

const notificationIdValidator = [param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId')];

const listNotificationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100').toInt(),
  query('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  query('channel').optional().isIn(allowedChannels).withMessage(`channel must be one of: ${allowedChannels.join(', ')}`),
];

module.exports = {
  createNotificationValidator,
  listNotificationValidator,
  notificationIdValidator,
  updateNotificationValidator,
};
