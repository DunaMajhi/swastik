const Location = require('../models/Location');
const Attendance = require('../models/Attendance');

// @desc  Update location (called every 30s)
// @route POST /api/location/update
exports.updateLocation = async (req, res) => {
  try {
    const { lat, lng, accuracy, speed, heading } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Only track if checked in
    const attendance = await Attendance.findOne({ userId: req.user._id, date: today, checkInTime: { $exists: true }, checkOutTime: null });
    if (!attendance) {
      return res.json({ success: false, message: 'Not checked in — location not tracked' });
    }

    const loc = await Location.create({
      userId: req.user._id,
      lat, lng, accuracy, speed, heading,
      sessionDate: today,
      timestamp: new Date()
    });

    // Emit to admin via socket (attached to req by server.js)
    if (req.io) {
      req.io.to('admins').emit('location:update', {
        userId: req.user._id,
        name: req.user.name,
        lat, lng,
        timestamp: loc.timestamp
      });
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all employees latest location (Admin)
// @route GET /api/location/live
exports.getLiveLocations = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const latest = await Location.aggregate([
      { $match: { sessionDate: today } },
      { $sort: { timestamp: -1 } },
      { $group: { _id: '$userId', lat: { $first: '$lat' }, lng: { $first: '$lng' }, timestamp: { $first: '$timestamp' } } }
    ]);
    const populated = await Location.populate(latest, { path: '_id', model: 'User', select: 'name email department profilePhoto' });
    res.json({ success: true, locations: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get route history for employee
// @route GET /api/location/history/:userId
exports.getRouteHistory = async (req, res) => {
  try {
    const { date } = req.query;
    const sessionDate = date || new Date().toISOString().split('T')[0];
    const points = await Location.find({ userId: req.params.userId, sessionDate }).sort({ timestamp: 1 });
    res.json({ success: true, points });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
