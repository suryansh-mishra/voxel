import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,
  messages: [],
  socket: null,
  user: {},

  isAudioOn: true,
  isVideoOn: true,

  peerConnection: null,
  currentRoom: '', // Also indicates the user is inCall
  videoCallVisible: false, // Indicates whether or not to show the video
  inCall: false, //  Not really needed, pending removal in near future
  localStream: null, // Device A/V stream
  remoteStream: null, // Peer A/V stream
  createdRoomString: '', // Room string generated so that it is preserved b/w renders from one page to another

  setIsAudioOn: (val) => set(() => ({ isAudioOn: val })),
  setIsVideoOn: (val) => set(() => ({ isVideoOn: val })),

  setPeerConnection: (val) => set(() => ({ peerConnection: val })),
  setCurrentRoom: (val) => set(() => ({ currentRoom: val })),
  setCreatedRoomString: (val) => set(() => ({ createdRoomString: val })),
  setRemoteStream: (val) => set(() => ({ remoteStream: val })),
  setLocalStream: (val) => set(() => ({ localStream: val })),
  setInCall: (val) => set(() => ({ inCall: val })),
  setVideoCallVisible: (val) => set(() => ({ videoCallVisible: val })),
  setSocket: (value) => set(() => ({ socket: value })),
  setUser: (value) => set(() => ({ user: value })),
  setIsLoggedInLoading: (value) => set(() => ({ isLoggedInLoading: value })),
  setIsLoggedIn: (value) => set((state) => ({ isLoggedIn: value })),

  setMessages: (value) => {
    set((state) => {
      let arr = [...state.messages];
      if (arr.length >= 20) {
        arr = arr.slice(0, 20);
      }
      return { messages: [value, ...arr] };
    });
  },
}));

export default useStore;
