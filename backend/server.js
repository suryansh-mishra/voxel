const express = require('express');
const chalk = require('chalk');
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const server = require('http').Server(app);
const io = require('socket.io')(server, {
  cors: {
    origin: ['localhost:3000', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const decodeJWT = require('./utils/decodeJWT');

app.set('sockets', io);

dotenv.config({ path: `${__dirname}/config.env` });

const DB = process.env.DATABASE_LOCAL.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {})
  .then(() => console.log(chalk.bgBlueBright(`DB connection successful`)))
  .catch((err) => {
    console.log(chalk.red('Database Connection Error'));
    if (process.env.NODE_ENV === 'dev') console.log(err);
  });

/////////////////////////////////////////////////

// const { Console } = require('console');
/* // get fs module for creating write streams */
// const fs = require('fs');

/** // make a new logger */
// const myLogger = new Console({
//   stdout: fs.createWriteStream('normalStdout.txt'),
//   stderr: fs.createWriteStream('errStdErr.txt'),
// });
////////////////////////

io.use((socket, next) => {
  const cookies = socket.handshake?.headers?.cookie;
  let token;
  cookies.split(';').forEach((element) => {
    element = element.trim();
    if (element.startsWith('jwt=')) {
      token = element.substring(4);
      return;
    }
  });
  const decoded = decodeJWT(token);
  if (decoded.id) {
    socket.userId = decoded.id;
    socket.userEmail = decoded.email;
    next();
  } else next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
  // TODO COMPLETE THIS AFTER SETUP;
  console.log('Connected');
  socket.on('create', () => {
    // const room = roomController.createRoom(socket.userId);
    console.log(room);
    socket.emit('room_created', room);
  });
});

const port = process.env.PORT || 49152;
server.listen(port, () => {
  console.log(
    chalk.whiteBright.bold.bgGreen(
      `\n\n\n\n⫸  Server is listening on ${port}   `
    )
  );
});
