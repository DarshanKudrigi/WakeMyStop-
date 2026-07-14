const bcrypt = require('bcrypt');

const { bcryptSaltRounds } = require('../config/env');

const hashPassword = async (password) => bcrypt.hash(password, bcryptSaltRounds);

const comparePassword = async (password, passwordHash) => bcrypt.compare(password, passwordHash);

module.exports = {
  hashPassword,
  comparePassword,
};