const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Lead = require('../models/Lead');
const Location = require('../models/Location');

// @desc  Get all employees
// @route GET /api/users
exports.getAllEmployees = async (req, res) => {
  try {
    const { search, department, isActive } = req.query;
    let query = { role: 'employee' };
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (department) query.department = department;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get single employee with stats
// @route GET /api/users/:id
exports.getEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const [todayAttendance, monthlyLeads, totalLeads] = await Promise.all([
      Attendance.findOne({ userId: req.params.id, date: today }),
      Lead.countDocuments({ assignedTo: req.params.id, createdAt: { $gte: new Date(`${thisMonth}-01`) } }),
      Lead.countDocuments({ assignedTo: req.params.id }),
    ]);
    res.json({ success: true, user, stats: { todayAttendance, monthlyLeads, totalLeads } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update employee
// @route PUT /api/users/:id
exports.updateEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, employeeId, target, isActive, role, address } = req.body;
    const updates = { name, email, phone, department, employeeId, target, isActive, role, address };
    if (req.file) updates.profilePhoto = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Toggle employee active status
// @route PUT /api/users/:id/toggle-status
exports.toggleStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Employee not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `Employee ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Admin Dashboard stats
// @route GET /api/users/dashboard-stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = new Date().toISOString().slice(0, 7);
    const [totalEmployees, activeToday, totalLeads, closedLeads, monthlyRevenue] = await Promise.all([
      User.countDocuments({ role: 'employee', isActive: true }),
      Attendance.countDocuments({ date: today, checkInTime: { $exists: true } }),
      Lead.countDocuments({}),
      Lead.countDocuments({ status: 'closed-won' }),
      Lead.aggregate([
        { $match: { status: 'closed-won', createdAt: { $gte: new Date(`${thisMonth}-01`) } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);
    const revenue = monthlyRevenue[0]?.total || 0;
    res.json({ success: true, stats: { totalEmployees, activeToday, totalLeads, closedLeads, revenue } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
