const User = require('./../models/userModel');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const chalk = require('chalk');

const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

exports.register = async (req, res) => {
  try {
    console.log(req);
    const { tokens } = await oAuth2Client.getToken(req.body.code);
    console.log(tokens);
    // const user = await User.create(req.body);
  } catch (err) {}
};

exports.login = async (req, res) => {
  try {
    const resp = await axios.post('https://oauth2.googleapis.com/token', {
      code: req.body.data.code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: 'postmessage',
      grant_type: 'authorization_code',
    });
    const accessToken = resp.data.access_token;
    const { data: userInfo } = await axios.get(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
    );
    console.log(userInfo);
    let user;
    user = await User.findOne({ email: userInfo.email });
    if (user) {
      // TODO verify the jwt and send him it
    } else
      user = await User.create({
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        profilePic: userInfo.picture,
        // googleId: userInfo.id,
      });

    res.status(200).json({
      status: 'success',
      data: {
        user,
        jwt: 'none',
      },
    });
  } catch (err) {
    console.log('ERROR : ', err);
  }
};

exports.authenticate = async (req, res, next) => {
  try {
    next();
  } catch (err) {}
};
