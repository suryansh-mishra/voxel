const roomController = require('../controllers/socketControllers/roomController');
const chalk = require('chalk');

const roomNotFoundMessage = {
  message: {
    title: 'Something went wrong',
    description: 'The room was not correctly found',
  },
};

const getSocketsInRoom = (roomId) => {
  const isValidRoom = Boolean(io.sockets.adapter.rooms?.get(roomId));
  return isValidRoom ? [...io.sockets.adapter.rooms?.get(roomId)] : [];
};

const sendOthersInRoom = (roomId, socket) => {
  const sockets = getSocketsInRoom(roomId);
  if (!sockets) socket.emit('error', roomNotFoundMessage);
  sockets.forEach((socketId) => {
    if (socketId !== socket.id) io.to(socketId).emit('message', data.message);
  });
};

const socketHandler = (io, socket) => {
  if (!io)
    return socket.emit('error', {
      message: 'Socket not connected',
    });
  console.log('Socket Connected', socket.id);

  socket.on('room:create', async () => {
    const room = await roomController.createRoom(socket);
    socket.join(room.roomId);
    console.log(chalk.bgYellow('Created : ', room.roomId));
    io.to(room.roomId).emit('room:created', room);
  });

  socket.on('room:join', async (roomId) => {
    // FIXME : JOINING LOGIC NEEDS TO BE BETTER
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
    const isValidRoom = Boolean(io.sockets.adapter.rooms?.get(roomId));
    if (!isValidRoom) return socket.emit('error', roomNotFoundMessage);
    if (roomId) socket.leave(roomId);
  });

  socket.on('message', async (data) => {
    const roomId = data.roomId;
    sendOthersInRoom(roomId, socket);
  });

  socket.on('whiteboard:shape', async (data) => {
    const roomId = data.roomId;
    sendOthersInRoom(roomId, socket);
  });

  socket.on('whiteboard:undo', async (data) => {
    const roomId = data.roomId;
    sendOthersInRoom(roomId, socket);
  });

  socket.on('whiteboard:clear', async (data) => {
    const roomId = data.roomId;
    sendOthersInRoom(roomId, socket);
  });

  socket.on('call:offer', async (data) => {
    const roomId = data.roomId;
    const offer = data.offer;
    const isValidRoom = Boolean(io.sockets.adapter.rooms?.get(roomId));
    if (!isValidRoom) return socket.emit('error', roomNotFoundMessage);

    const sockets = [...io.sockets.adapter.rooms?.get(roomId)];
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
    console.log('Answer : ', roomId);
    const isValidRoom = Boolean(io.sockets.adapter.rooms?.get(roomId));
    if (!isValidRoom) return socket.emit('error', roomNotFoundMessage);
    const sockets = [...io.sockets.adapter.rooms?.get(roomId)];
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
    const isValidRoom = Boolean(io.sockets.adapter.rooms?.get(roomId));
    if (!isValidRoom) return socket.emit('error', roomNotFoundMessage);
    const sockets = [...io.sockets.adapter.rooms?.get(roomId)];
    const recepient = sockets[0] === socket.id ? sockets[1] : sockets[0];
    socket.to(recepient).emit('call:candidate', {
      candidate: candidate,
    });
    console.log('Candidate ', candidate, '\nto: ', recepient);
  });

  socket.on('call:end', (data) => {
    const roomId = data.roomId;
    const sockets = [...io.sockets.adapter.rooms?.get(roomId)];
    const recepient = sockets[0] === socket.id ? sockets[1] : sockets[0];
    socket.to(recepient).emit('call:end');
  });

  socket.on('disconnect', async () => {
    // socket.emit('room:leave')
    // socket.emit('call:end') if calls, right?

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
