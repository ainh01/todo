const User = require('../models/User');
const Key  = require('../models/Key');
const Task = require('../models/Task');

exports.getSets = async (req, res) => {
  try {
    const keys = await Key.find({ userId: req.userId });
    const result = await Promise.all(keys.map(async k => {
      const doc = await Task.findOne({ userId: req.userId, key: k.key }).select('tasks');
      return { key: k.key, taskCount: doc?.tasks?.length || 0 };
    }));
    res.status(200).json({ success: true, data: result });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

exports.createOrSwitchSet = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'key is required' });

    const exists = await Key.findOne({ userId: req.userId, key });
    if (!exists) {
      await Key.create({ userId: req.userId, key });
      await Task.create({ userId: req.userId, key, tasks: [] });
    }
    await User.findByIdAndUpdate(req.userId, { currentKey: key });
    res.status(200).json({ success: true, data: { currentKey: key } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

exports.deleteSet = async (req, res) => {
  try {
    const { key } = req.body;
    if (!key) return res.status(400).json({ success: false, error: 'key is required' });

    await Key.deleteOne({ userId: req.userId, key });
    await Task.deleteOne({ userId: req.userId, key });

    const user = await User.findById(req.userId);
    let newKey = user.currentKey;

    if (user.currentKey === key) {
      const remaining = await Key.findOne({ userId: req.userId });
      if (remaining) {
        newKey = remaining.key;
      } else {
        await Key.create({ userId: req.userId, key: 'Default' });
        await Task.create({ userId: req.userId, key: 'Default', tasks: [] });
        newKey = 'Default';
      }
      await User.findByIdAndUpdate(req.userId, { currentKey: newKey });
    }

    res.status(200).json({ success: true, data: { currentKey: newKey } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};
