const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  accuracy: { type: Number },
  speed: { type: Number },
  heading: { type: Number },
  timestamp: { type: Date, default: Date.now },
  sessionDate: { type: String }, // YYYY-MM-DD for grouping
}, { timestamps: false });

locationSchema.index({ userId: 1, timestamp: -1 });
locationSchema.index({ sessionDate: 1, userId: 1 });

module.exports = mongoose.model('Location', locationSchema);
