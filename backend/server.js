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

const socketToRooms = {};

const roomController = require('./controllers/socketControllers/roomController');
const User = require('./models/userModel');
const { SocketAddress } = require('net');

io.use(async (socket, next) => {
  console.log('Socket middleware used');
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
  const user = await User.findById(decoded.id);
  if (decoded.id && user) {
    socket.userId = decoded.id;
    socket.userEmail = user.email;
    socket.firstName = user.firstName;
    next();
  } else next(new Error('Authentication error'));
});

io.on('connection', (socket) => {
  // TODO COMPLETE THIS AFTER SETUP;
  console.log('Socket Connected', socket.id);

  socket.on('create', async () => {
    const room = await roomController.createRoom(socket);
    console.log(room);
    // room.roomId is the roomId that I use
    socket.leave(socket.id);
    socket.join(room.roomId);
    socketToRooms[socket.id] = room.roomId;
    console.log(io.sockets.adapter.rooms);
    console.log(chalk.bgYellow('Created and joined the room ', room.roomId));
    io.to(room.roomId).emit('room_created', room);
  });

  // TEMPLATING
  // socket.on('offer', async () {});
  // socket.on('answer', async () {})

  socket.on('signal', async (roomId) => {
    // PERMUTE
    // A, B, C, D, E => [A, B], [A, C], [A, D], [A, E], [B, C], [B, D], [B, E], [C, D], [C, E], [D, E]
    const sockets = [...io.sockets.adapter.rooms];

    if (sockets.length < 2)
      return socket.emit('error', {
        message: {
          title: 'Waiting for members',
          description: 'Not enough members for chat. Waiting for members.',
        },
      });

    const socketPairs = [];

    for (i = 0; i < sockets.length - 1; i++)
      for (j = i + 1; j < sockets.length; j++)
        socketPairs.push([sockets[i], sockets[j]]);

    console.log(socketPairs);
    io.to(roomId).emit('mesh', {
      message: 'Connect in pairs',
      data: socketPairs,
    });
  });

  socket.on('join', async (roomId) => {
    // roomId : { roomId : 'String' }
    let resp;
    try {
      resp = await roomController.joinRoom(socket, roomId);
    } catch (err) {
      console.log(err);
    }
    if (resp?.status in ['fail', 'error']) {
      socket.emit('error', resp);
      console.log('Error in joining the room ', room.message);
      return;
    }
    console.log(io.sockets.adapter.rooms);
    console.log('Joined the room ', resp.message.data.roomId);
    socket.leave(socket.id);
    socket.join(resp.message.data.roomId);
    socketToRooms[socket.id] = resp.message.data.roomId;
    io.to(resp.message.data.roomId).emit('joined', resp);
  });

  socket.on('disconnect', async () => {
    // TODO : HANDLE THE DISCONNECTION
    console.log(
      chalk.bgRed(
        'Disconnected :',
        socket.id,
        'with first name',
        socket.firstName
      )
    );
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

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
  console.log('Exiting because of unhandled exception');
  process.exit(1);
});
