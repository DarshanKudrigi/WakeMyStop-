const { body } = require('express-validator');

const updateMeValidator = [
  body('phone')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number is invalid'),
  body('notificationPreferences')
    .optional()
    .isObject()
    .withMessage('notificationPreferences must be an object'),
  body('notificationPreferences.push').optional().isBoolean().withMessage('push must be a boolean').toBoolean(),
  body('notificationPreferences.email').optional().isBoolean().withMessage('email must be a boolean').toBoolean(),
  body('notificationPreferences.sms').optional().isBoolean().withMessage('sms must be a boolean').toBoolean(),
  body('notificationPreferences.whatsapp')
    .optional()
    .isBoolean()
    .withMessage('whatsapp must be a boolean')
    .toBoolean(),
  body('notificationPreferences.alertBeforeMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('alertBeforeMinutes must be a non-negative integer')
    .toInt(),
  body('notificationPreferences.alertBeforeStations')
    .optional()
    .isInt({ min: 0 })
    .withMessage('alertBeforeStations must be a non-negative integer')
    .toInt(),
];

module.exports = {
  updateMeValidator,
};
