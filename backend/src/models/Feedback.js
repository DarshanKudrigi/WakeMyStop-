const mongoose = require('mongoose');

const { Schema } = mongoose;

const feedbackSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Who provided the feedback
    journey: { type: Schema.Types.ObjectId, ref: 'Journey', required: true }, // Which journey the feedback concerns
    rating: { type: Number, required: true, min: 1, max: 5 }, // 1-5 user rating for analytics
    missedStop: { type: Boolean, default: false }, // Key analytics signal: did user miss their stop?
    alertTimeliness: { type: String, enum: ['tooEarly', 'justRight', 'tooLate', 'didNotReceive'] }, // How timely the alert was perceived
    comments: { type: String, trim: true, maxlength: 500 }, // Optional user comments
  },
  { timestamps: true }
);

// Compound unique index to ensure one feedback per user per journey
feedbackSchema.index({ user: 1, journey: 1 }, { unique: true });
// Index to quickly aggregate feedback for a journey
feedbackSchema.index({ journey: 1, rating: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);
