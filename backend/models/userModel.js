const mongoose = require('mongoose');
const validator = require('validator');
const { Schema } = mongoose;
const AppError = require('../utils/appError.js');

const userModel = new Schema({
  firstName: {
    type: String,
    required: [true, 'First name should not be empty'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name should not be empty'],
    trim: true,
  },
  // nickName : {
  //   type: String,
  //   required: [true, 'Nickname should not be empty'],
  //   trim  : true,
  // },
  XP: {
    type: Number,
    default: 100,
  },
  email: {
    type: String,
    required: [true, 'Email should not be empty'],
    validate: {
      validator: validator.isEmail,
      message: 'Invalid email format',
    },
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
});

exports.userModel = userModel;
const User = new mongoose.model('User', userModel);
module.exports = User;

// Can later add functionality for mobile number verification
