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

  localSendingStream: null,

  // LPC - Local Peer Connection & RPC - Remote Peer Connection

  // LPCs: new Map(),
  // RPCs: new Map(),

  // setLocalPeerConnObject: (socketId, val) =>
  //   set((state) => {
  //     localPeerConnObjects: new Map(state.localPeerConnObjects).set(
  //       socketId,
  //       val
  //     );
  //   }),
  // unsetLocalPeerConnObject: (socketId) =>
  //   set((state) => {
  //     localPeerConnObjects: new Map(state.localPeerConnObjects).delete(
  //       socketId
  //     );
  //   }),
  // setRemotePeerConnObject: (socketId, val) =>
  //   set((state) => {
  //     remotePeerConnObjects: new Map(state.localPeerConnObjects).set(
  //       socketId,
  //       val
  //     );
  //   }),
  // unsetRemotePeerConnObject: (socketId) =>
  //   set((state) => {
  //     remotePeerConnObjects: new Map(state.localPeerConnObjects).delete(
  //       socketId
  //     );
  //   }),

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

export const useVideoCallStore = create((set) => ({
  peerConnections: new Map(),
  setPeerConnection: (socketId, val) =>
    set((state) => ({
      peerConnections: new Map(state.peerConnections).set(socketId, val),
    })),
  removePeerConnection: (socketId) =>
    set((state) => {
      const pcs = new Map(state.peerConnections);
      pcs.delete(socketId);
      return { peerConnections: pcs };
    }),
}));

// const useVideoCallStore = create((set) => ({
//   peerConnections: {},
//   setPeerConnection: (socketId, val) =>
//     set((state) => ({
//       peerConnections: { ...state.peerConnections, [socketId]: val },
//     })),
//   removePeerConnection: (socketId) =>
//     set((state) => {
//       const pcObject = { ...state.peerConnections };
//       delete pcObject[socketId];
//       return {
//         peerConnections: { ...pcObject },
//       };
//     }),
// }));

export default useStore;
