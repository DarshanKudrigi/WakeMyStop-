const mongoose = require('mongoose');

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    alert: { type: Schema.Types.ObjectId, ref: 'Alert', required: true }, // Reference to originating alert
    channel: { type: String, enum: ['push', 'email', 'sms', 'whatsapp'], required: true }, // Delivery channel
    status: { type: String, enum: ['pending', 'sent', 'failed', 'delivered'], default: 'pending' },
    content: { type: String, trim: true }, // Payload sent to the provider/user (stringified or brief text)
    providerResponse: { type: Schema.Types.Mixed }, // Provider response kept for diagnostics; schema-free for flexibility
    retryCount: { type: Number, default: 0 }, // Number of delivery attempts
    sentAt: { type: Date }, // When the notification was actually sent
  },
  { timestamps: true }
);

// Indexes
// Fast retrieval of notifications for a given alert (history and UI)
notificationSchema.index({ alert: 1, createdAt: -1 });
// Fast retrieval of pending notifications for processing workers
notificationSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
