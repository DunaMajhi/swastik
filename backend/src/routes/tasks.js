const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getTasks).post(adminOnly, createTask);
router.route('/:id').put(updateTask).delete(adminOnly, deleteTask);

module.exports = router;
