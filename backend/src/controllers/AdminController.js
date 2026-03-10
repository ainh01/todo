const User = require('../models/User');

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

    const sortedTasks = user.tasks.sort((a, b) => a.slot - b.slot);

    res.status(200).json({
      success: true,
      count: sortedTasks.length,
      data: sortedTasks
    });
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
    const { title } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email parameter is required'
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task_id = user.tasks.length > 0
      ? Math.max(...user.tasks.map(t => t.task_id)) + 1
      : 1;

    const slot = user.tasks.length > 0
      ? Math.max(...user.tasks.map(t => t.slot)) + 1
      : 1;

    const newTask = {
      task_id,
      title,
      slot,
      finished: false
    };

    user.tasks.push(newTask);
    await user.save();

    res.status(201).json({
      success: true,
      data: user.tasks[user.tasks.length - 1]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
