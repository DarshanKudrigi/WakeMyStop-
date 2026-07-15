const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 200,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 20,
    },
    notificationPreferences: {
      // User's preferred channels for receiving alerts
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      // How many minutes before an event the user wants to be alerted
      alertBeforeMinutes: { type: Number, default: 15, min: 0 },
      // How many intermediate stations before the destination to alert
      alertBeforeStations: { type: Number, default: 1, min: 0 },
    },
    fcmTokens: {
      // Push tokens for browser/mobile push notifications
      type: [String],
      default: [],
      // tokens are appended/removed frequently; avoid heavy indexing by default
    },
  },
  {
    timestamps: true,
  }
);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id;
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
    return returnedObject;
  },
});

module.exports = mongoose.model('User', userSchema);