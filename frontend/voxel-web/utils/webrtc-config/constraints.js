export const servers = {
  iceServers: [
    { urls: ['stun:stun1.l.google.com:19302'] },
    {
      url: 'turn:numb.viagenie.ca',
      credential: 'muazkh',
      username: 'webrtc@live.com',
    },
  ],
};

export const mediaConstraints = { video: true, audio: true };
