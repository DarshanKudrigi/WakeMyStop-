const express = require('express');

const alertController = require('../controllers/alertController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { alertIdValidator, createAlertValidator, listAlertValidator, updateAlertValidator } = require('../validators/alertValidators');

const router = express.Router();

router.use(protect);

router.post('/', createAlertValidator, validateRequest, alertController.createAlert);
router.get('/', listAlertValidator, validateRequest, alertController.getAlerts);
router.get('/:id', alertIdValidator, validateRequest, alertController.getAlertById);
router.patch('/:id', alertIdValidator, updateAlertValidator, validateRequest, alertController.updateAlert);
router.delete('/:id', alertIdValidator, validateRequest, alertController.deleteAlert);

module.exports = router;
