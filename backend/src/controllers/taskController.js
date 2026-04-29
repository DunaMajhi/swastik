const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, assignedBy: req.user._id });
    await task.populate(['assignedTo', 'assignedBy'], 'name email');
    res.status(201).json({ success: true, task });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getTasks = async (req, res) => {
  try {
    const query = req.user.role === 'employee' ? { assignedTo: req.user._id } : {};
    if (req.query.status) query.status = req.query.status;
    const tasks = await Task.find(query).populate('assignedTo assignedBy', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, tasks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    if (req.body.status === 'completed') req.body.completedAt = new Date();
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('assignedTo assignedBy', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, task });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
