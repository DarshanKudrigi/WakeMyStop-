const mongoose = require('mongoose');

const { Schema } = mongoose;

const stationSchema = new Schema(
  {
    code: { type: String, required: true, trim: true }, // Station short code for lookups
    name: { type: String, required: true, trim: true }, // Human-friendly station name
  },
  { _id: false }
);

const alertPreferencesSchema = new Schema(
  {
    alertBeforeMinutes: { type: Number, default: 15, min: 0 },
    alertBeforeStations: { type: Number, default: 1, min: 0 },
    channels: { type: [String], default: ['push'] }, // Override channels for this journey
  },
  { _id: false }
);

const liveTrackingSchema = new Schema(
  {
    lastKnownStation: { type: String, default: '' }, // Station code where the train was last seen
    delayMinutes: { type: Number, default: 0 }, // Current delay in minutes
    lastUpdatedAt: { type: Date }, // When tracking info was last updated
    predictedArrivalAt: { type: Date }, // Estimated arrival at destination
  },
  { _id: false }
);

const journeySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Owner of the journey
    trainNumber: { type: String, required: true, trim: true }, // Train identifier used in search and display
    trainName: { type: String, required: true, trim: true }, // Train display name
    sourceStation: { type: stationSchema, required: true },
    destinationStation: { type: stationSchema, required: true },
    journeyDate: { type: Date, required: true }, // Scheduled journey date
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    alertPreferences: alertPreferencesSchema, // Overrides user-level notification preferences when present
    liveTracking: liveTrackingSchema, // Embedded because tracking updates are high-frequency and read with the journey
  },
  {
    timestamps: true,
  }
);

// Indexes
// Optimize queries that fetch a user's upcoming journeys ordered by date
journeySchema.index({ user: 1, journeyDate: 1 });
// Optimize queries that find journeys by train and date
journeySchema.index({ trainNumber: 1, journeyDate: 1 });

module.exports = mongoose.model('Journey', journeySchema);
