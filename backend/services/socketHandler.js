const roomController = require('../controllers/socketControllers/roomController');
const chalk = require('chalk');

const socketHandler = (io, socket) => {
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
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });
    if (roomId) socket.leave(roomId);
  });

  socket.on('message', async (data) => {
    const roomId = data.roomId;
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    sockets.forEach((socketId) => {
      if (socketId !== socket.id) io.to(socketId).emit('message', data.message);
    });
  });

  socket.on('whiteboard:shape', async (data) => {
    const roomId = data.roomId;
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    sockets.forEach((socketId) => {
      if (socketId !== socket.id)
        io.to(socketId).emit('whiteboard:shape', data.shape);
    });
  });

  socket.on('whiteboard:undo', async (data) => {
    const roomId = data.roomId;
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    sockets.forEach((socketId) => {
      if (socketId !== socket.id)
        io.to(socketId).emit('whiteboard:undo', data.shapeId);
    });
  });

  socket.on('whiteboard:clear', async (data) => {
    const roomId = data.roomId;
    const isValidRoom = Boolean(io.sockets.adapter.rooms.get(roomId));
    if (!isValidRoom)
      return socket.emit('error', {
        message: {
          title: 'Something went wrong',
          description: 'The room was not correctly found',
        },
      });
    const sockets = [...io.sockets.adapter.rooms.get(roomId)];
    sockets.forEach((socketId) => {
      if (socketId !== socket.id) io.to(socketId).emit('whiteboard:clear');
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
      return socket.emit('call:declined', {
        message: {
          title: 'Not enough members in chat',
        },
      });
    else if (sockets.length > 2)
      return socket.emit('call:declined', {
        message: {
          title: 'Too many members in chat',
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
    // TODO : UPDATE IN ROOM CONTROLLER

    console.log(
      chalk.bgRed(
        'Disconnected :',
        socket.id,
        'with first name',
        socket.firstName
      )
    );
  });
};

module.exports = socketHandler;
