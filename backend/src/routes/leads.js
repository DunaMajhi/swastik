const express = require('express');
const router = express.Router();
const { createLead, getLeads, updateLead, deleteLead, getAnalytics } = require('../controllers/leadController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/analytics', adminOnly, getAnalytics);
router.route('/').get(getLeads).post(upload.single('visitPhoto'), createLead);
router.route('/:id').put(upload.single('visitPhoto'), updateLead).delete(adminOnly, deleteLead);

module.exports = router;
