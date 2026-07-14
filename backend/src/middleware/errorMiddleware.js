const AppError = require('../utils/AppError');

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const errors = error.errors || [];

  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate resource',
      errors: [{ message: 'Email already exists' }],
    });
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

module.exports = {
  errorHandler,
  notFoundHandler,
};