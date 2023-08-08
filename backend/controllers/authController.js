const User = require('./../models/userModel');

exports.register = async (req, res) => {
  try {
    console.log(req);
    // const user = await User.create(req.body);
  } catch (err) {}
};

exports.login = async (req, res) => {
  try {
  } catch (err) {}
};

exports.authenticate = async (req, res, next) => {
  try {
    next();
  } catch (err) {}
};
