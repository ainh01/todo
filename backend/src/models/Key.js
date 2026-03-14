const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  key:    { type: String, required: true }
});

keySchema.index({ userId: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Key', keySchema);
