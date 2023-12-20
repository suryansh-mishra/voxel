const express = require('express');
const chalk = require('chalk');
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const server = require('http').Server(app);

// TODO : CHANGE THIS FOR PRODUCTION APPROPRIATELY

// REMOVING THE COMPLEXITY FOR VIDEO CONFERENCE (MESH TOPOLOGY) RESORTING TO SIMPLE P2P (2 PEOPLE CALL)

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

const roomController = require('./controllers/socketControllers/roomController');
const User = require('./models/userModel');
const { SocketAddress } = require('net'); //TODO : CHECK USE ??

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
  if (!token) return;
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
  console.log('Socket Connected', socket.id);

  socket.on('room:create', async () => {
    const room = await roomController.createRoom(socket);
    socket.join(room.roomId);
    console.log(chalk.bgYellow('Created : ', room.roomId));
    io.to(room.roomId).emit('room:created', room);
  });

  socket.on('room:join', async (roomId) => {
    let resp;
    try {
      resp = await roomController.joinRoom(socket, roomId);
    } catch (err) {
      console.log(err);
    }
    if (resp?.status in ['fail', 'error']) {
      socket.emit('error', resp);
      return;
    }
    socket.join(resp.message.data.roomId);
    io.to(resp.message.data.roomId).emit('room:joined', resp);
  });

  socket.on('room:leave', async (data) => {
    const roomId = data.roomId;
    if (roomId) socket.leave(roomId);
  });

  socket.on('message', async (data) => {
    const roomId = data.roomId;
    sockets = [...io.sockets.adapter.rooms.get(roomId)];
    sockets.forEach((socketId) => {
      if (socketId !== socket.id) io.to(socketId).emit('message', data.message);
    });
  });

  socket.on('call:offer', async (data) => {
    const roomId = data.roomId;
    const offer = data.offer;
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });

    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    if (sockets.length < 2)
      return socket.emit('error', {
        message: {
          title: 'Waiting for members',
          description: 'Not enough members for chat. Waiting for members.',
        },
      });
    else if (sockets.length > 2)
      return socket.emit('error', {
        message: {
          title: 'Too many members',
          description: 'Cannot make a call, as more than 2 people in room',
        },
      });

    const recepient = sockets[0] === socket.id ? sockets[1] : sockets[0];
    socket.to(recepient).emit('call:incoming', {
      status: 'success',
      message: {
        data: {
          offer: offer,
        },
      },
    });
  });

  socket.on('call:answer', async (data) => {
    const answer = data.answer;
    const roomId = data.roomId;
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    const caller = sockets[0] === socket.id ? sockets[1] : sockets[0];
    socket.to(caller).emit('call:answered', {
      status: 'success',
      message: {
        data: {
          answer: answer,
        },
      },
    });
  });

  socket.on('call:candidate', (data) => {
    const candidate = data.candidate;
    const roomId = data.roomId;
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    const recepient = sockets[0] === socket.id ? sockets[1] : sockets[0];
    socket.to(recepient).emit('call:candidate', {
      candidate: candidate,
    });
  });

  socket.on('call:end', async () => {
    io.to(socket.roomId).emit('call:end');
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
  console.log(chalk.bgRedBright('Exiting because of unhandled exception'));
  process.exit(1);
});
