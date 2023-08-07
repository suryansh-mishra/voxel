const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const userModel = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name field should not be empty'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name field should not be empty'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email field should not be empty'],
    validate: validator.isEmail,
    unique: [true, 'This user already exists'],
  },
  currentRoom: {
    type: String,
    required: false,
  },
  profilePic: {
    type: String,
    required: false,
  },
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastSeen: {
    type: Date,
    default: Date.now(),
  },
  // userName : , AT LATER STAGE
});

const User = new mongoose.model('User', userModel);
module.exports = User;

// Can later add functionality for mobile number verification
