const AppError = require('../utils/AppError');
const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.userId).select('-passwordHash');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    req.user = user;
    return next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired', 401));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid access token', 401));
    }

    return next(error);
  }
};

module.exports = protect;