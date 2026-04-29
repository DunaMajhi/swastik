const express = require('express');
const router = express.Router();
const { getSetting, setSetting, getAllSettings } = require('../controllers/settingsController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllSettings);
router.get('/:key', getSetting);
router.post('/', adminOnly, setSetting);

module.exports = router;
