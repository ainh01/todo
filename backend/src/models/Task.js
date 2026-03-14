const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  task_id:  { type: Number, required: true },
  title:    { type: String, required: true, trim: true },
  slot:     { type: Number, required: true },
  finished: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const tasksDocSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key:    { type: String, required: true },
  tasks:  [taskSchema]
});

tasksDocSchema.index({ userId: 1, key: 1 });

module.exports = mongoose.model('Task', tasksDocSchema);
