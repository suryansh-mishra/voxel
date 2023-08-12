const express = require('express');
const app = express();
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const errorController = require('./controllers/globalErrorController');

app.use(cors());
app.use(express.json({ limit: '10kb' }));

// app.use('/api/v1/auth', auth)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use(errorController);

module.exports = app;
