const AppError = require('../utils/AppError');
const {
  cookieOptions,
  loginUser,
  refreshAccessToken,
  registerUser,
  sanitizeUser,
} = require('../services/authService');

const setRefreshCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const clearRefreshCookie = (res) => {
  res.clearCookie('refreshToken', cookieOptions());
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const { user, accessToken, refreshToken } = await registerUser({
      name,
      email,
      password,
      phone,
    });

    setRefreshCookie(res, refreshToken);

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await loginUser({ email, password });

    setRefreshCookie(res, refreshToken);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    const { user, accessToken, refreshToken: nextRefreshToken } = await refreshAccessToken(refreshToken);

    setRefreshCookie(res, nextRefreshToken);

    return res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        user: sanitizeUser(user),
        accessToken,
      },
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Refresh token expired', 401));
    }

    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid refresh token', 401));
    }

    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    clearRefreshCookie(res);

    return res.status(200).json({
      success: true,
      message: 'Logout successful',
      data: {},
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current user fetched',
      data: {
        user: sanitizeUser(req.user),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  logout,
  me,
  refresh,
  register,
};