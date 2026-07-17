const express = require('express');

const notificationController = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { createNotificationValidator, listNotificationValidator, notificationIdValidator, updateNotificationValidator } = require('../validators/notificationValidators');

const router = express.Router();

router.use(protect);

router.post('/', createNotificationValidator, validateRequest, notificationController.createNotification);
router.get('/', listNotificationValidator, validateRequest, notificationController.getNotifications);
router.get('/:id', notificationIdValidator, validateRequest, notificationController.getNotificationById);
router.patch('/:id', notificationIdValidator, updateNotificationValidator, validateRequest, notificationController.updateNotification);
router.delete('/:id', notificationIdValidator, validateRequest, notificationController.deleteNotification);

module.exports = router;
