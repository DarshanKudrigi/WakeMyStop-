const { body, param, query } = require('express-validator');

const allowedStatus = ['scheduled', 'active', 'completed', 'cancelled'];
const allowedChannels = ['push', 'email', 'sms', 'whatsapp'];

const stationValidators = (prefix) => [
  body(`${prefix}.code`).trim().notEmpty().withMessage(`${prefix}.code is required`),
  body(`${prefix}.name`).trim().notEmpty().withMessage(`${prefix}.name is required`),
];

const alertPreferenceValidators = () => [
  body('alertPreferences')
    .optional()
    .isObject()
    .withMessage('alertPreferences must be an object'),
  body('alertPreferences.alertBeforeMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('alertBeforeMinutes must be a non-negative integer')
    .toInt(),
  body('alertPreferences.alertBeforeStations')
    .optional()
    .isInt({ min: 0 })
    .withMessage('alertBeforeStations must be a non-negative integer')
    .toInt(),
  body('alertPreferences.channels')
    .optional()
    .isArray({ min: 1 })
    .withMessage('channels must be a non-empty array')
    .custom((value) => value.every((channel) => allowedChannels.includes(channel)))
    .withMessage(`channels must only include: ${allowedChannels.join(', ')}`),
];

const createJourneyValidator = [
  body('trainNumber').trim().notEmpty().withMessage('trainNumber is required'),
  body('trainName').trim().notEmpty().withMessage('trainName is required'),
  ...stationValidators('sourceStation'),
  ...stationValidators('destinationStation'),
  body('journeyDate').isISO8601().withMessage('journeyDate must be a valid date').toDate(),
  body('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  ...alertPreferenceValidators(),
];

const updateJourneyValidator = [
  body('trainNumber').optional().trim().notEmpty().withMessage('trainNumber cannot be empty'),
  body('trainName').optional().trim().notEmpty().withMessage('trainName cannot be empty'),
  body('sourceStation').optional().isObject().withMessage('sourceStation must be an object'),
  body('sourceStation.code').optional().trim().notEmpty().withMessage('sourceStation.code cannot be empty'),
  body('sourceStation.name').optional().trim().notEmpty().withMessage('sourceStation.name cannot be empty'),
  body('destinationStation').optional().isObject().withMessage('destinationStation must be an object'),
  body('destinationStation.code').optional().trim().notEmpty().withMessage('destinationStation.code cannot be empty'),
  body('destinationStation.name').optional().trim().notEmpty().withMessage('destinationStation.name cannot be empty'),
  body('journeyDate').optional().isISO8601().withMessage('journeyDate must be a valid date').toDate(),
  body('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  ...alertPreferenceValidators(),
];

const listJourneyValidator = [
  query('status').optional().isIn(allowedStatus).withMessage(`status must be one of: ${allowedStatus.join(', ')}`),
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer').toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('limit must be between 1 and 100')
    .toInt(),
];

const idParamValidator = [param('id').isMongoId().withMessage('id must be a valid MongoDB ObjectId')];

module.exports = {
  createJourneyValidator,
  idParamValidator,
  listJourneyValidator,
  updateJourneyValidator,
};
