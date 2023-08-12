const chalk = require('chalk');

module.exports = (err, req, res, next) => {
  let statusCode = 500;
  let message = 'Something went wrong';
  let status = 'error';

  if (process.env.NODE_ENV === 'development')
    console.log(
      chalk.bgRed.white(' GLOBAL ERROR HANDLER : '),
      chalk.red(err.name),
      chalk.bgYellow(err)
    );

  // DUPLICATE KEY ERROR
  if (err.name === 'MongoServerError' && err.code === 11000) {
    status = 'fail';
    const duplicateFields = Object.keys(Object.values(err)[2]);
    message = `${
      duplicateFields.length > 1 ? 'These' : 'This'
    } ${duplicateFields.join(', ')} already exists`;
  }
  // INVALID JSON ERROR
  else if (err.name === 'SyntaxError' && err?.type === 'entity.parse.failed') {
    message = 'Invalid JSON';
    statusCode = 400;
  }
  // VALIDATION ERROR
  else if (err.name === 'ValidationError') {
    status = 'fail';
    const errors = Object.values(err.errors).map((el) => el.message);
    message = `${errors.join('. ')}`;
  }
  // CAST ERROR
  else if (err.name === 'CastError') {
    console.log('Handle instance of cast error');
  } else if (err.name === 'AppError') {
    status = 'fail';
    statusCode = err.statusCode;
    message = err.message;
  }

  message = message.charAt(0).toUpperCase() + message.slice(1);

  return res.status(statusCode).json({
    status,
    message,
  });
};

// VALIDATION ERROR :
// error name : ValidationError

// DUPLICATE KEY ERROR :
// error name : E11000

// CAST ERROR :
// error name : CastError ?
