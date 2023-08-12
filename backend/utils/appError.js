class AppError extends Error {
  constructor(message, name = 'AppError', statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}

module.exports = AppError;
