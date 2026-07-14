const mongoose = require('mongoose');

const { mongoUri } = require('./env');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
  } catch (error) {
    throw error;
  }
};

module.exports = connectDB;  