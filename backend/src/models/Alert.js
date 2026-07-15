const mongoose = require('mongoose');

const { Schema } = mongoose;

const alertSchema = new Schema(
  {
    journey: { type: Schema.Types.ObjectId, ref: 'Journey', required: true }, // Link to the journey that generated this alert
    type: {
      type: String,
      enum: ['pre-arrival', 'delay-anomaly', 'arrived', 'custom'],
      required: true,
    },
    message: { type: String, trim: true }, // Human-readable alert message
    triggeredAt: { type: Date, default: Date.now }, // When the alert was generated
    status: { type: String, enum: ['pending', 'processed'], default: 'pending' },
    metadata: { type: Schema.Types.Mixed }, // Flexible payload for variable alert data (not schema-validated)
  },
  {
    timestamps: true,
  }
);

// Indexes
// Optimize lookups of alerts for a journey ordered by trigger time
alertSchema.index({ journey: 1, triggeredAt: -1 });
// Optimize finding pending alerts for processing
alertSchema.index({ status: 1, triggeredAt: 1 });

module.exports = mongoose.model('Alert', alertSchema);
