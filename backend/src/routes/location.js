const express = require('express');
const router = express.Router();
const { updateLocation, getLiveLocations, getRouteHistory } = require('../controllers/locationController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.post('/update', updateLocation);
router.get('/live', adminOnly, getLiveLocations);
router.get('/history/:userId', adminOnly, getRouteHistory);

module.exports = router;
