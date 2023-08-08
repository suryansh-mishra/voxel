const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');

app.use(express.json({ limit: '10kb' }));

// app.use('/api/v1/auth', auth)
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/rooms', roomRoutes);

module.exports = app;
