const mongoose = require('mongoose');
const { Schema } = mongoose;

const roomModel = new Schema({
  roomId: { type: String, unique: true, required: true },
  participants: {
    type: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    max: 4,
  },
  activeParticipantsCount: {
    type: Number,
    default: 1,
  },
  roomAdmin: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Ongoing', 'Ended'], default: 'Ongoing' },
});

const Room = new mongoose.model('Room', roomModel);

module.exports = Room;
