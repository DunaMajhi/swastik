const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['admin', 'employee'], default: 'employee' },
  phone: { type: String, trim: true },
  department: { type: String, trim: true },
  profilePhoto: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  employeeId: { type: String, unique: true, sparse: true },
  joiningDate: { type: Date, default: Date.now },
  address: { type: String },
  target: { type: Number, default: 0 }, // monthly sales target in ₹
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
