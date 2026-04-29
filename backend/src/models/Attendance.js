const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  checkInLat: { type: Number },
  checkInLng: { type: Number },
  checkOutLat: { type: Number },
  checkOutLng: { type: Number },
  checkInAddress: { type: String },
  checkOutAddress: { type: String },
  selfieUrl: { type: String },
  status: { type: String, enum: ['present', 'absent', 'half-day', 'leave'], default: 'present' },
  workingHours: { type: Number, default: 0 }, // computed on checkout
  notes: { type: String },
  isInsideGeofence: { type: Boolean, default: true },
}, { timestamps: true });

// Ensure one attendance record per user per day
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
