const User = require('../models/User');
const Key  = require('../models/Key');
const Task = require('../models/Task');

exports.getUserTasks = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const taskDocs = await Task.find({ userId: user._id });
    const data = {};
    for (const doc of taskDocs) {
      data[doc.key] = doc.tasks.slice().sort((a, b) => a.slot - b.slot);
    }
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.createUserTask = async (req, res) => {
  try {
    const { email } = req.params;
    const { title, key } = req.body;

    if (!title || !key) {
      return res.status(400).json({
        success: false,
        error: 'title and key are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const doc = await Task.findOne({ userId: user._id, key });
    if (!doc) {
      return res.status(400).json({
        success: false,
        error: `Set "${key}" does not exist for this user`
      });
    }

    const task_id = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.task_id)) + 1
      : 1;

    const slot = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.slot)) + 1
      : 1;

    doc.tasks.push({ task_id, title, slot, finished: false });
    await doc.save();

    res.status(201).json({
      success: true,
      data: doc.tasks[doc.tasks.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
