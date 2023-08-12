const User = require('./../models/userModel');

exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.find(req.userId);
  } catch (err) {}
};
