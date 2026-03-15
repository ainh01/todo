const User = require('../models/User');
const TaskDoc = require('../models/Task');
const axios = require('axios');

async function getTaskDoc(userId) {
  const user = await User.findById(userId).select('currentKey');
  if (!user) return { user: null, doc: null };
  const doc = await TaskDoc.findOne({ userId, key: user.currentKey });
  return { user, doc };
}

async function callGenAI(model, prompt, input, step) {
  const payload = {
    model,
    speed: 'fast',
    messages: [{ role: 'user', content: prompt + input }]
  };

  let response;
  let lastError;
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      response = await axios.post(process.env.GENAI_ORIGIN, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GENAI_APIKEY}`
        },
        timeout: 1200000
      });
      break;
    } catch (error) {
      lastError = error;
    }
  }

  if (!response) {
    const msg = lastError.response?.data?.error || lastError.message;
    throw Object.assign(new Error(`Step ${step} GenAI API error: ${msg}`), { statusCode: 500 });
  }

  return (response.data?.choices?.[0]?.message?.content || '').replace(/\n/g, ' ');
}

exports.createLongTasks = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const requiredEnvVars = [
      'GENAI_MODEL1', 'GENAI_MODEL2', 'GENAI_MODEL3',
      'GENAI_BASEPROMPT1', 'GENAI_BASEPROMPT2', 'GENAI_BASEPROMPT3',
      'GENAI_ORIGIN', 'GENAI_APIKEY'
    ];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      return res.status(500).json({
        success: false,
        error: `Missing environment variables: ${missingVars.join(', ')}`
      });
    }

    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: 'Task document not found'
      });
    }

    // Step 1 — Shorten (conditional: only if title > 500 words)
    let processedTitle = title;
    const titleWordCount = title.trim().split(/\s+/).filter(Boolean).length;

    if (titleWordCount > 500) {
      processedTitle = await callGenAI(
        process.env.GENAI_MODEL1,
        process.env.GENAI_BASEPROMPT1,
        title,
        1
      );
    }

    // Step 2 — Create Logic
    const logic = await callGenAI(
      process.env.GENAI_MODEL2,
      process.env.GENAI_BASEPROMPT2,
      processedTitle,
      2
    );

    // Step 3 — Create Base Task
    const baseTask = await callGenAI(
      process.env.GENAI_MODEL3,
      process.env.GENAI_BASEPROMPT3,
      logic + processedTitle,
      3
    );

    // Step 4 — Parse & Save
    const taskRegex = /fTask:\s*(.*?)\s*fEnd/g;
    const extractedTasks = [];
    let match;

    while ((match = taskRegex.exec(baseTask)) !== null) {
      const taskTitle = match[1].trim().replace(/<!Ex>/g, '\n\n\n\n\n\n\n\n');
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

    const startTaskId = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.task_id)) + 1
      : 1;

    const startSlot = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.slot)) + 1
      : 1;

    const newTasks = extractedTasks.map((taskTitle, index) => ({
      task_id: startTaskId + index,
      title: taskTitle,
      slot: startSlot + index,
      finished: false
    }));

    doc.tasks.push(...newTasks);
    
    try {
      await doc.save();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Database save error: ${error.message}`
      });
    }

    res.status(201).json({
      success: true,
      data: newTasks
    });

  } catch (error) {
    res.status(error.statusCode || 500).json({
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

    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task_id = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.task_id)) + 1
      : 1;

    const slot = doc.tasks.length > 0
      ? Math.max(...doc.tasks.map(t => t.slot)) + 1
      : 1;

    doc.tasks.push({
      task_id,
      title,
      slot,
      finished: false
    });

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

exports.getTasks = async (req, res) => {
  try {
    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const sortedTasks = (doc?.tasks || []).slice().sort((a, b) => a.slot - b.slot);

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
    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = doc?.tasks.find(t => t.task_id === taskId);

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

    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = doc?.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (title !== undefined) task.title = title;

    await doc.save();

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

    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = doc?.tasks.find(t => t.task_id === taskId);

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
      doc.tasks.forEach(t => {
        if (t.slot >= newSlot && t.slot < currentSlot) {
          t.slot += 1;
        }
      });
    } else {
      doc.tasks.forEach(t => {
        if (t.slot > currentSlot && t.slot <= newSlot) {
          t.slot -= 1;
        }
      });
    }

    task.slot = newSlot;
    await doc.save();

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
    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const task = doc?.tasks.find(t => t.task_id === taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    task.finished = !task.finished;
    await doc.save();

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

    const { user, doc } = await getTaskDoc(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const idx = doc?.tasks.findIndex(t => t.task_id === taskId);

    if (idx === -1 || idx === undefined) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    const deletedSlot = doc.tasks[idx].slot;
    doc.tasks.splice(idx, 1);
    doc.tasks.forEach(t => { if (t.slot > deletedSlot) t.slot -= 1; });
    await doc.save();

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
