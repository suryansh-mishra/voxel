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
