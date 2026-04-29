const Settings = require('../models/Settings');

exports.getSetting = async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    res.json({ success: true, value: setting?.value || null });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.setSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Settings.findOneAndUpdate({ key }, { key, value, updatedBy: req.user._id }, { upsert: true, new: true });
    res.json({ success: true, setting });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    const map = {};
    settings.forEach(s => { map[s.key] = s.value; });
    res.json({ success: true, settings: map });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
