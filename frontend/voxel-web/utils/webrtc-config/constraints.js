export const getIceServers = () => {
  const iceServers = [
    { urls: 'stun:stun.relay.metered.ca:80' },
    {
      urls: 'turn:standard.relay.metered.ca:80',
      username: '7fc8c025d4bb0e41c86114b4',
      credential: 'ayA5rzDQn2OFfWVB',
    },
    {
      urls: 'turn:standard.relay.metered.ca:80?transport=tcp',
      username: '7fc8c025d4bb0e41c86114b4',
      credential: 'ayA5rzDQn2OFfWVB',
    },
    {
      urls: 'turn:standard.relay.metered.ca:443',
      username: '7fc8c025d4bb0e41c86114b4',
      credential: 'ayA5rzDQn2OFfWVB',
    },
    {
      urls: 'turn:standard.relay.metered.ca:443?transport=tcp',
      username: '7fc8c025d4bb0e41c86114b4',
      credential: 'ayA5rzDQn2OFfWVB',
    },
  ];

  return { iceServers };
};

export const mediaConstraints = { video: true, audio: true };
