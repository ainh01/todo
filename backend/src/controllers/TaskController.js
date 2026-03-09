const User = require('../models/User');
const axios = require('axios');

exports.createLongTasks = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    // Validate environment variables
    const requiredEnvVars = ['GENAI_MODEL', 'GENAI_TOKENLIMIT', 'GENAI_BASEPROMPT', 'GENAI_ORIGIN', 'GENAI_APIKEY'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Construct GenAI API request
    const genAIPayload = {
      model: process.env.GENAI_MODEL,
      max_tokens: parseInt(process.env.GENAI_TOKENLIMIT),
      thinking: {   
        type: "enabled",   
        budget_tokens: parseInt(process.env.GENAI_TOKENLIMIT)   
      },
      messages: [{   
        role: "user",   
        content: process.env.GENAI_BASEPROMPT + title   
      }],
      output_config: { effort: "max" }
    };

    const genAIStart = Date.now();
    let genAIResponse;
    try {
      genAIResponse = await axios.post(process.env.GENAI_ORIGIN, genAIPayload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GENAI_APIKEY}`
        },
        timeout: 120000 // 120 second timeout
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `GenAI API error: ${error.response?.data?.error || error.message}`
      });
    }

    // Parse GenAI response to extract tasks
    const rawData = genAIResponse.data;
    const responseContent = rawData?.choices?.[0]?.message?.content || '';

    const taskRegex = /fTask:\s*(.*?)\s*fEnd/g;
    const extractedTasks = [];
    let match;

    while ((match = taskRegex.exec(responseContent)) !== null) {
      const taskTitle = match[1].trim();
      if (taskTitle) {
        extractedTasks.push(taskTitle);
      }
    }

    if (extractedTasks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid tasks found in GenAI response'
      });
    }

    // Create task objects following existing schema
    const startTaskId = user.tasks.length > 0
      ? Math.max(...user.tasks.map(t => t.task_id)) + 1
      : 1;

    const startSlot = user.tasks.length > 0
      ? Math.max(...user.tasks.map(t => t.slot)) + 1
      : 1;

    const newTasks = extractedTasks.reverse().map((taskTitle, index) => ({
      task_id: startTaskId + index,
      title: taskTitle,
      slot: startSlot + index,
      finished: false
    }));

    // Save all tasks to user's task array
    user.tasks.push(...newTasks);
    
    try {
      await user.save();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Database save error: ${error.message}`
      });
    }

    // Return response matching existing POST /api/tasks format
    res.status(201).json({
      success: true,
      data: newTasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

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

    const user = await User.findOneAndUpdate(
      { _id: req.userId, 'tasks.task_id': taskId },
      { $pull: { tasks: { task_id: taskId } } },
      { new: false }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const deletedSlot = user.tasks.find(t => t.task_id === taskId)?.slot;

    if (deletedSlot !== undefined) {
      await User.updateOne(
        { _id: req.userId, 'tasks.slot': { $gt: deletedSlot } },
        { $inc: { 'tasks.$[elem].slot': -1 } },
        { arrayFilters: [{ 'elem.slot': { $gt: deletedSlot } }] }
      );
    }

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
