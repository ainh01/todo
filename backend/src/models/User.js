const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
  },
  pass: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  currentKey: {
    type: String,
    default: 'Default'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.pre('save', async function () {
  if (!this.isModified('pass')) return;

  const salt = await bcrypt.genSalt(10);
  this.pass = await bcrypt.hash(this.pass, salt);
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.pass);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.pass;
  return obj;
};

module.exports = mongoose.model('User', userSchema);