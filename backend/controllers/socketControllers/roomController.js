// TODO: ADD THE ROOM CREATION AND JOINING FUNCTIONALITY HERE

const Room = require('../../models/roomModel');
const ShortUniqueId = require('short-unique-id');
const User = require('../../models/userModel');
const AppError = require('../../utils/appError');
const uid = new ShortUniqueId({ length: 10 });
const mongoose = require('mongoose');

exports.createRoom = async (socket) => {
  try {
    const roomId = socket.firstName.trim() + "'s-voxel" + uid();

    const room = await Room.create({
      roomId,
      participants: [socket.userId],
      roomAdmin: socket.userId,
    });
    if (socket.currentRoom) {
      const previousRoom = await Room.findById(socket.currentRoom);
      if (previousRoom.roomAdmin === socket.userId) {
        // END THE MEETING?
        // todo : Handle the logic to end the meeting when all users leave the room
      }

      const user = await User.findByIdAndUpdate(socket.userId, {
        currentRoom: roomId,
      });
      if (user) socket.currentRoom = user.currentRoom;
    }

    return room;
  } catch (err) {
    new AppError(err, err.name || 'ROOM_CREAT_ERR');
  }
};

exports.joinRoom = async (socket, roomId) => {
  let room;

  try {
    room = await Room.findOne({ roomId: roomId.roomId });
  } catch (err) {
    console.log('Error', err);
    return {
      status: 'error',
      message: {
        title: 'Something went wrong',
        description: err.message,
      },
    };
  }
  if (!room)
    return {
      status: 'fail',
      message: {
        title: 'Chat not found',
        description: 'Sorry but this chat does not exist',
      },
    };

  room.participants.push(socket.userId);

  try {
    room = await room.save();
  } catch (err) {
    console.log('Error', err);
    return {
      status: 'error',
      message: { title: 'Something went wrong', description: err.message },
    };
  }
  try {
    const user = await User.findByIdAndUpdate(socket.userId, {
      currentRoom: roomId.roomId,
    });
  } catch (err) {
    console.log('Error', err);
    return {
      status: 'error',
      message: { title: 'Something went wrong', description: err.message },
    };
  }

  return {
    status: 'success',
    message: {
      title: 'Room Joined',
      description: 'Successfully joined the room',
      data: room,
    },
  };
};
