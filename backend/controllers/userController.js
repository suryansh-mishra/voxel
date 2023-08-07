const User = require('./userModel');

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
  } catch (err) {}
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.find(req.userId);
  } catch (err) {}
};
