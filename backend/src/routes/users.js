const express = require('express');
const router = express.Router();
const { getAllEmployees, getEmployee, updateEmployee, toggleStatus, getDashboardStats } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.get('/dashboard-stats', adminOnly, getDashboardStats);
router.get('/', adminOnly, getAllEmployees);
router.get('/:id', adminOnly, getEmployee);
router.put('/:id', adminOnly, upload.single('profilePhoto'), updateEmployee);
router.put('/:id/toggle-status', adminOnly, toggleStatus);

module.exports = router;
