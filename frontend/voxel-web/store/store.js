import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,

  socket: null,
  user: {},

  currentRoom: '', // Also indicates the user is inCall
  videoCallVisible: false, // Indicates whether or not to show the video
  inCall: false, //  Not really needed, pending removal in near future
  localStream: null, // Device A/V stream
  remoteStream: null, // Peer A/V stream
  createdRoomString: '', // Room string generated so that it is preserved b/w renders from one page to another

  localPeerConnObj: null,
  remotePeerConnObj: null,

  setLocalPeerConnObj: (val) => set(() => ({ localPeerConnection: val })),
  setRemotePeerConnObj: (val) => set(() => ({ remotePeerConnection: val })),
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
}));

export default useStore;
