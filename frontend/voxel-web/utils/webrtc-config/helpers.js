export const handleIncomingTracks = (remoteStreamSetter) => async (event) => {
  const [rStream] = event.streams;
  console.log('Remote tracks received', event.streams);
  console.log('Remote tracks ', event.streams[0].getTracks());
  remoteStreamSetter(rStream);
};

export const handleGeneratedIceCandidates = (state) => (event) => {
  if (event.candidate)
    state.socket.emit('call:candidate', {
      roomId: state.currentRoom,
      candidate: event.candidate,
    });
};
