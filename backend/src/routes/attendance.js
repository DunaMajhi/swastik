const express = require('express');
const router = express.Router();
const { checkIn, checkOut, getMyAttendance, getTodayStatus, getAdminAttendance } = require('../controllers/attendanceController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.post('/checkin', upload.single('selfie'), checkIn);
router.post('/checkout', checkOut);
router.get('/today', getTodayStatus);
router.get('/my', getMyAttendance);
router.get('/admin', adminOnly, getAdminAttendance);

module.exports = router;
