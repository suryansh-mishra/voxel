const jwt = require('jsonwebtoken');
const AppError = require('./appError');

module.exports = (token) => {
  if (!token) return { error: true };
  try {
    const decoded = jwt.decode(token);
    if (!decoded) {
      return { error: true, message: 'Invalid token' };
    }
    return { id: decoded.id, email: decoded.email };
  } catch (err) {
    return { type: 'APP_ERROR', error: new AppError() };
  }
};
