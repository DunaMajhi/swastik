const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  clientName: { type: String, required: true, trim: true },
  clientPhone: { type: String, trim: true },
  clientEmail: { type: String, trim: true },
  clientAddress: { type: String },
  product: { type: String, trim: true },
  amount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'proposal', 'closed-won', 'closed-lost'],
    default: 'new'
  },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  notes: { type: String },
  visitDate: { type: Date },
  visitLat: { type: Number },
  visitLng: { type: Number },
  visitPhoto: { type: String },
  followUpDate: { type: Date },
  source: { type: String, enum: ['cold-call', 'referral', 'walk-in', 'online', 'other'], default: 'other' },
  closedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);
