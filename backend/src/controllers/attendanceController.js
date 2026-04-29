const Attendance = require('../models/Attendance');
const Settings = require('../models/Settings');

const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// @desc  Check In
// @route POST /api/attendance/checkin
exports.checkIn = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const existing = await Attendance.findOne({ userId: req.user._id, date: today });
    if (existing && existing.checkInTime) {
      return res.status(400).json({ success: false, message: 'Already checked in today' });
    }
    let isInsideGeofence = true;
    const geofence = await Settings.findOne({ key: 'geofence' });
    if (geofence && geofence.value && geofence.value.enabled) {
      const { centerLat, centerLng, radius } = geofence.value;
      const dist = getDistance(lat, lng, centerLat, centerLng);
      isInsideGeofence = dist <= radius;
      if (!isInsideGeofence) {
        return res.status(400).json({
          success: false,
          message: `You are ${Math.round(dist)}m away from office. Must be within ${radius}m to check in.`,
          distance: Math.round(dist)
        });
      }
    }
    const selfieUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const record = await Attendance.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { userId: req.user._id, date: today, checkInTime: new Date(), checkInLat: lat, checkInLng: lng, checkInAddress: address, selfieUrl, isInsideGeofence },
      { upsert: true, new: true }
    );
    res.json({ success: true, attendance: record, message: 'Checked in successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Check Out
// @route POST /api/attendance/checkout
exports.checkOut = async (req, res) => {
  try {
    const { lat, lng, address } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ userId: req.user._id, date: today });
    if (!record || !record.checkInTime) {
      return res.status(400).json({ success: false, message: 'Not checked in yet' });
    }
    if (record.checkOutTime) {
      return res.status(400).json({ success: false, message: 'Already checked out' });
    }
    const now = new Date();
    const workingHours = ((now - record.checkInTime) / (1000 * 60 * 60)).toFixed(2);
    record.checkOutTime = now;
    record.checkOutLat = lat;
    record.checkOutLng = lng;
    record.checkOutAddress = address;
    record.workingHours = parseFloat(workingHours);
    if (parseFloat(workingHours) < 4) record.status = 'half-day';
    await record.save();
    res.json({ success: true, attendance: record, workingHours, message: 'Checked out successfully!' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get own attendance history
// @route GET /api/attendance/my
exports.getMyAttendance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const start = `${y}-${String(m).padStart(2, '0')}-01`;
    const end = `${y}-${String(m).padStart(2, '0')}-31`;
    const records = await Attendance.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get today's status
// @route GET /api/attendance/today
exports.getTodayStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const record = await Attendance.findOne({ userId: req.user._id, date: today });
    res.json({ success: true, today: record || null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Admin: get all attendance for date/user
// @route GET /api/attendance/admin
exports.getAdminAttendance = async (req, res) => {
  try {
    const { date, userId, month, year } = req.query;
    let query = {};
    if (date) query.date = date;
    if (userId) query.userId = userId;
    if (month && year) {
      const m = String(month).padStart(2, '0');
      query.date = { $gte: `${year}-${m}-01`, $lte: `${year}-${m}-31` };
    }
    const records = await Attendance.find(query).populate('userId', 'name email department employeeId').sort({ date: -1, checkInTime: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
