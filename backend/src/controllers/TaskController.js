const User = require('../models/User');

exports.createTask = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const user = await User.findById(req.userId);

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

    user.tasks.push({
      task_id,
      title,
      slot,
      finished: false
    });

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

exports.getTasks = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

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

exports.getTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = user.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { title } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = user.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (title !== undefined) task.title = title;

    await user.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.moveTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const { target_slot } = req.body;

    if (target_slot === undefined || target_slot < 1) {
      return res.status(400).json({
        success: false,
        error: 'Valid target_slot is required (>= 1)'
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = user.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const currentSlot = task.slot;
    const newSlot = parseInt(target_slot);

    if (currentSlot === newSlot) {
      return res.status(200).json({
        success: true,
        data: task,
        message: 'Task already in target slot'
      });
    }

    if (newSlot < currentSlot) {
      user.tasks.forEach(t => {
        if (t.slot >= newSlot && t.slot < currentSlot) {
          t.slot += 1;
        }
      });
    } else {
      user.tasks.forEach(t => {
        if (t.slot > currentSlot && t.slot <= newSlot) {
          t.slot -= 1;
        }
      });
    }

    task.slot = newSlot;
    await user.save();

    res.status(200).json({
      success: true,
      data: task,
      message: 'Task moved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.finishTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = user.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    task.finished = !task.finished;
    await user.save();

    res.status(200).json({
      success: true,
      data: task,
      message: task.finished ? 'Task marked as finished' : 'Task marked as unfinished'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const taskIndex = user.tasks.findIndex(t => t.task_id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const deletedSlot = user.tasks[taskIndex].slot;
    user.tasks.splice(taskIndex, 1);

    user.tasks.forEach(t => {
      if (t.slot > deletedSlot) {
        t.slot -= 1;
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};