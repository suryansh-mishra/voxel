const User = require('./../models/userModel');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const chalk = require('chalk');
const jwt = require('jsonwebtoken');

const googleOAuthClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'postmessage'
);

const signJWT = (id, email) => {
  const payload = { email, id };
  // const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  const token = jwt.sign(payload, process.env.JWT_SECRET);
  return token;
};

const verifyJWT = () => {
  const { authorization } = req.headers;

  let id = undefined;

  if (!authorization || !authorization.startsWith('Bearer')) {
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'Please Sign up/ Login to use this resource',
      },
    });
  }
  const [_, token] = authorization.split(' ');
  const decoded = jwt.decode(token);
  if (!decoded) {
    console.log('Decode token error');
    return res.status(401).json({
      status: 'fail',
      data: {
        message: 'Please Sign up/ Login to use this resource',
      },
    });
  }
  return { decoded, currentJWT: token };
};

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
      const token = signJWT(user._id, user.email);

      // TODO : For a production ready application change the field for secure cookies appropriately

      const cookieOptions = {
        expires: new Date(
          Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        secure: process.env.NODE_ENV === 'development',
        httpOnly: true,
      };

      return res
        .cookie('authorization', token, cookieOptions)
        .status(200)
        .json({
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
    } else
      user = await User.create({
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        email: userInfo.email,
        profilePic: userInfo.picture,
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
