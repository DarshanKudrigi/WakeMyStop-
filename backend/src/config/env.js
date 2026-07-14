const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  mongoUri: process.env.MONGO_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  accessSecret: process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET,
  refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS || 10),
};

if (!env.mongoUri) {
  throw new Error('MONGO_URI is required');
}

if (!env.accessSecret) {
  throw new Error('JWT_ACCESS_SECRET or JWT_SECRET is required');
}

if (!env.refreshSecret) {
  throw new Error('JWT_REFRESH_SECRET or JWT_SECRET is required');
}

module.exports = env;