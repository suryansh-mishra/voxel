const express = require('express');
const app = require('./app');

const server = require('http').Server(app);
const io = require('socket.io')(server);

// Set the socket.io instance on the app
app.set('sockets', io);

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const port = process.env.PORT || 49152;

server.listen(port, () => {
  console.log(`\nServer is listening on ${port}`);
});
