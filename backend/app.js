const express = require('express');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const errorController = require('./controllers/globalErrorController');
const cookieParser = require('cookie-parser');

// The CORS setup allows both for development and prodcution builds
// WEB_CLIENT refers to frontend deployment

app.use(
  cors({
    origin: ['http://localhost:3000', process.env.WEB_CLIENT],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'dev') app.use(morgan('dev'));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/v1/users', userRoutes);

// TODO : FURTHER --ADMIN FUNCTIONALITY CAN BE GIVEN ON ROOMS ROUTE ETC
// app.use('/api/v1/rooms', roomRoutes);

app.use(errorController);

module.exports = app;
