const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const errorController = require('./controllers/globalErrorController');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const helmet = require('helmet');

app.use(compression());
app.use(helmet());
// const RateLimit = require("express-rate-limit");
// const limiter = RateLimit({
//   windowMs: 1 * 60 * 1000, // 1 minute
//   max: 20,
// });
// Apply rate limiter to all requests
// app.use(limiter);

app.use(
  cors({
    origin: [process.env.WEB_CLIENT],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/v1/users', userRoutes);
// app.use('/api/v1/rooms', roomRoutes);

app.use(errorController);

module.exports = app;
