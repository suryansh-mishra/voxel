export const toggleAudio = (stream) => {
  if (stream) {
    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};

export const toggleVideo = (stream) => {
  if (stream) {
    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
    });
  }
};

export const endCallHelper = (state) => {
  state.peerConnection?.close();
  const tracks = state.localStream?.getTracks();
  tracks?.forEach(async (track) => {
    track.stop();
  });
  state.setLocalStream(null);
  state.setIsAudioOn(true);
  state.setIsVideoOn(true);
  state.setVideoCallVisible(false);
  state.setPeerConnection(null);
  state.setRemoteStream(null);
  state.setInCall(false);
};
