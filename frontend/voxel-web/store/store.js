import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,

  socket: null,
  user: {},

  isAudioOn: true,
  isMuted: false,

  peerConnection: null,
  currentRoom: '', // Also indicates the user is inCall
  videoCallVisible: false, // Indicates whether or not to show the video
  inCall: false, //  Not really needed, pending removal in near future
  localStream: null, // Device A/V stream
  remoteStream: null, // Peer A/V stream
  createdRoomString: '', // Room string generated so that it is preserved b/w renders from one page to another

  localSendingStream: null,

  setIsAudioOn: (val) => set(() => ({ isAudioOn: val })),
  setIsMuted: (val) => set(() => ({ isMuted: val })),

  setPeerConnection: (val) => set(() => ({ peerConnection: val })),
  setCurrentRoom: (val) => set(() => ({ currentRoom: val })),
  setCreatedRoomString: (val) => set(() => ({ createdRoomString: val })),
  setRemoteStream: (val) => set(() => ({ remoteStream: val })),
  setLocalStream: (val) => set(() => ({ localStream: val })),
  setLocalSendingStream: (val) => set(() => ({ localSendingStream: val })),
  setInCall: (val) => set(() => ({ inCall: val })),
  setVideoCallVisible: (val) => set(() => ({ videoCallVisible: val })),
  setSocket: (value) => set(() => ({ socket: value })),
  setUser: (value) => set(() => ({ user: value })),
  setIsLoggedInLoading: (value) => set(() => ({ isLoggedInLoading: value })),
  setIsLoggedIn: (value) => set((state) => ({ isLoggedIn: value })),
}));

// export const useVideoCallStore = create((set) => ({
//   peerConnections: new Map(),
//   setPeerConnection: (socketId, val) =>
//     set((state) => ({
//       peerConnections: new Map(state.peerConnections).set(socketId, val),
//     })),
//   removePeerConnection: (socketId) =>
//     set((state) => {
//       const pcs = new Map(state.peerConnections);
//       pcs.delete(socketId);
//       return { peerConnections: pcs };
//     }),
// }));

export default useStore;
