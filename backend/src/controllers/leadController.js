const Lead = require('../models/Lead');

// @desc  Create lead
// @route POST /api/leads
exports.createLead = async (req, res) => {
  try {
    const { clientName, clientPhone, clientEmail, clientAddress, product, amount, status, priority, notes, source, visitLat, visitLng, followUpDate } = req.body;
    const visitPhoto = req.file ? `/uploads/${req.file.filename}` : null;
    const lead = await Lead.create({
      clientName, clientPhone, clientEmail, clientAddress, product,
      amount: amount || 0, status: status || 'new', priority: priority || 'medium',
      notes, source, visitLat, visitLng, visitPhoto, followUpDate,
      assignedTo: req.user.role === 'employee' ? req.user._id : req.body.assignedTo,
      assignedBy: req.user._id,
      visitDate: new Date()
    });
    await lead.populate('assignedTo', 'name email');
    res.status(201).json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get all leads (admin) or own leads (employee)
// @route GET /api/leads
exports.getLeads = async (req, res) => {
  try {
    const { status, assignedTo, search, page = 1, limit = 20 } = req.query;
    let query = {};
    if (req.user.role === 'employee') query.assignedTo = req.user._id;
    else if (assignedTo) query.assignedTo = assignedTo;
    if (status) query.status = status;
    if (search) query.$or = [{ clientName: { $regex: search, $options: 'i' } }, { product: { $regex: search, $options: 'i' } }];
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).populate('assignedTo', 'name email').populate('assignedBy', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(query)
    ]);
    res.json({ success: true, leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Update lead
// @route PUT /api/leads/:id
exports.updateLead = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.file) updates.visitPhoto = `/uploads/${req.file.filename}`;
    if (updates.status === 'closed-won' || updates.status === 'closed-lost') updates.closedAt = new Date();
    const lead = await Lead.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('assignedTo', 'name email');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, lead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Delete lead (admin only)
// @route DELETE /api/leads/:id
exports.deleteLead = async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc  Get sales analytics
// @route GET /api/leads/analytics
exports.getAnalytics = async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = month || new Date().getMonth() + 1;
    const y = year || new Date().getFullYear();
    const startDate = new Date(`${y}-${String(m).padStart(2, '0')}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [statusBreakdown, topEmployees, dailySales, totalRevenue] = await Promise.all([
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$amount' } } }]),
      Lead.aggregate([
        { $match: { status: 'closed-won', createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: '$assignedTo', revenue: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } }, { $limit: 5 },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: '$user' }
      ]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, revenue: { $sum: '$amount' } } },
        { $sort: { _id: 1 } }
      ]),
      Lead.aggregate([
        { $match: { status: 'closed-won', createdAt: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    res.json({ success: true, analytics: { statusBreakdown, topEmployees, dailySales, totalRevenue: totalRevenue[0]?.total || 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
