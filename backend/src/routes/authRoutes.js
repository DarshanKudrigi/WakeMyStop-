const express = require('express');

const authController = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { loginValidator, registerValidator } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', registerValidator, validateRequest, authController.register);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/refresh', authController.refresh);    
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);

module.exports = router;