const express = require('express');

const userController = require('../controllers/userController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { updateMeValidator } = require('../validators/userValidators');

const router = express.Router();

router.patch('/me', protect, updateMeValidator, validateRequest, userController.updateMe);

module.exports = router;
