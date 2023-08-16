const User = require('./../models/userModel');

exports.edit = async (req, res, next) => {
  console.log('AT EDIT ROUTE');
  try {
    const { firstName, lastName, nickName } = req.body;
    const newUserInfo = {};
    if (firstName) newUserInfo.firstName = firstName;
    if (lastName) newUserInfo.lastName = lastName;
    const user = await User.findByIdAndUpdate({ _id: req.user }, newUserInfo, {
      returnDocument: 'after',
    });
    res.status(200).json({
      status: 'success',
      data: {
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePic: user.picture,
        },
      },
    });
  } catch (err) {}
};
