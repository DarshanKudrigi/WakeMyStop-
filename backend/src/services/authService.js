const AppError = require('../utils/AppError');
const User = require('../models/User');
const { comparePassword, hashPassword } = require('../utils/password');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/auth',
});

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const createTokens = (userId) => {
  const payload = { userId: String(userId) };

  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

const registerUser = async ({ name, email, password, phone }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    name,
    email: normalizedEmail,
    passwordHash,
    phone: phone || '',
  });

  const tokens = createTokens(user._id);

  return {
    user,
    ...tokens,
  };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError('Invalid credentials', 401);
  }

  const tokens = createTokens(user._id);

  return {
    user,
    ...tokens,
  };
};

const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError('Refresh token missing', 401);
  }

  const decoded = verifyRefreshToken(refreshToken);
  const user = await User.findById(decoded.userId);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const tokens = createTokens(user._id);

  return {
    user,
    ...tokens,
  };
};

module.exports = {
  cookieOptions,
  createTokens,
  loginUser,
  refreshAccessToken,
  registerUser,
  sanitizeUser,
};