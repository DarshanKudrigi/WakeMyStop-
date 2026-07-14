const jwt = require('jsonwebtoken');

const { accessSecret, refreshSecret, accessExpiry, refreshExpiry } = require('../config/env');

const signAccessToken = (payload) => jwt.sign(payload, accessSecret, { expiresIn: accessExpiry });

const signRefreshToken = (payload) => jwt.sign(payload, refreshSecret, { expiresIn: refreshExpiry });

const verifyAccessToken = (token) => jwt.verify(token, accessSecret);

const verifyRefreshToken = (token) => jwt.verify(token, refreshSecret);

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};