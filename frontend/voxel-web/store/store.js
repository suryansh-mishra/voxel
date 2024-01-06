import { create } from 'zustand';

const useStore = create((set) => ({
  isLoggedInLoading: true,
  isLoggedIn: false,
  socket: null,
  user: {},

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

  setShapes: (val) =>
    set((state) => {
      let shapeId = '';
      if (state.lastShapeId)
        shapeId = `shape_${state.lastShapeId.split('_')[1]}_${
          Number(state.lastShapeId.split('_')[2]) + 1
        }`;
      else shapeId = `shape_${String(Date.now()).slice(5)}_0`;
      val.shapeId = shapeId;
      return { lastShapeId: shapeId, shapes: [...state.shapes, val] };
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
      const filteredShapes = state.shapes.filter(
        (shape) => shape.shapeId !== shapeId
      );
      return { shapes: filteredShapes };
    }),

  setIsAudioOn: (val) => set(() => ({ isAudioOn: val })),
  setIsVideoOn: (val) => set(() => ({ isVideoOn: val })),
  setWhiteboardVisible: (val) => set(() => ({ whiteboardVisible: val })),
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
