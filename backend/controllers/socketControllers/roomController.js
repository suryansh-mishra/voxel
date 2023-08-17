// TODO: ADD THE ROOM CREATION AND JOINING FUNCTIONALITY HERE
// - CREATE UUID BASED ROOMS
// - TAKE THE USER AND BIND HIM WITH THE ROOM
// - TAKE OTHER NECESSARY STEPS

const { v4: uuid } = require('uuid');
const Room = require('../../models/roomModel');
const ShortUniqueId = require('short-unique-id');
const User = require('../../models/userModel');
const uid = new ShortUniqueId({ length: 10 });

exports.createRoom = async (socket) => {
  const roomId = socket.firstName.trim() + "'s-voxel" + uid();
  console.log('UUID : ', roomId);
  const room = await Room.create({
    roomId,
    participants: [socket.userId],
    roomAdmin: socket.userId,
  });
  if (socket.currentRoom) {
    // Remove the user's current room and end room
    // if the room is active because of him
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
};
