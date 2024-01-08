import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,
  socket: null,
  user: {},
  currentRoomUserCount: null,

  currentRoom: '',
  createdRoomString: '',

  messages: [],

  peerConnection: null,
  localStream: null, // Device A/V stream
  remoteStream: null, // Peer A/V stream
  videoCallVisible: false,
  inCall: false,
  isAudioOn: true,
  isVideoOn: true,

  whiteboardVisible: false,
  shapes: [],
  lastShapeId: null,

  setLastShapeId: (val) => set((state) => ({ lastShapeId: val })),
  setCurrentRoomUserCount: (val) => set(() => ({ currentRoomUserCount: val })),

  setShapes: (val) =>
    set((state) => {
      return { shapes: [...state.shapes, val] };
    }),

  emptyShapes: () => set(() => ({ shapes: [] })),

  undoShape: () =>
    set((state) => {
      const previousShapeId =
        Number(state.lastShapeId.split('_')[2]) > 0
          ? `shape_${state.lastShapeId.split('_')[1]}_${
              Number(state.lastShapeId.split('_')[2]) - 1
            }`
          : null;

      const filteredShapes = state.shapes.filter(
        (shape) => shape.shapeId !== state.lastShapeId
      );
      return { lastShapeId: previousShapeId, shapes: filteredShapes };
    }),

  removeShape: (shapeId) =>
    set((state) => {
      console.log('REMOVE SHAPE CALLED WITH SHAPEID', shapeId);
      const filteredShapes = state.shapes.filter(
        (shape) => shape.shapeId !== shapeId
      );
      return { shapes: filteredShapes };
    }),

  closePeerConnection: () =>
    set((state) => {
      state.peerConnection?.close();
      return { peerConnection: null };
    }),

  closeLocalStream: () =>
    set((state) => {
      state.localStream?.getTracks().forEach((track) => track.stop());
      return { localStream: null };
    }),

  setIsAudioOn: (val) => set(() => ({ isAudioOn: val })),
  setIsVideoOn: (val) => set(() => ({ isVideoOn: val })),
  setWhiteboardVisible: (val) => set(() => ({ whiteboardVisible: val })),
  setPeerConnection: (val) => set(() => ({ peerConnection: val })),
  setCurrentRoom: (val) => set(() => ({ currentRoom: val })),
  setCreatedRoomString: (val) => set(() => ({ createdRoomString: val })),
  setRemoteStream: (val) =>
    set((state) => {
      return { remoteStream: val };
    }),
  setLocalStream: (val) => set(() => ({ localStream: val })),
  setInCall: (val) => set(() => ({ inCall: val })),
  setVideoCallVisible: (val) => set(() => ({ videoCallVisible: val })),
  setSocket: (value) => set(() => ({ socket: value })),
  setUser: (value) => set(() => ({ user: value })),
  setIsLoggedInLoading: (value) => set(() => ({ isLoggedInLoading: value })),
  setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),

  setMessage: (value) => {
    set((state) => {
      let arr = [...state.messages];
      if (arr.length >= 20) {
        arr = arr.slice(0, 20);
      }
      return { messages: [value, ...arr] };
    });
  },

  emptyMessages: () => set(() => ({ messages: [] })),
}));

export default useStore;
