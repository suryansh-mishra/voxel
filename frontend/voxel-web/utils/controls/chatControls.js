import { endCallHelper } from './callControls';

export const endChatHelper = (state) => {
  endCallHelper(state);
  state.emptyShapes();
  state.setWhiteboardVisible(false);
  state.setCurrentRoom('');
  state.setCreatedRoomString('');
  state.emptyMessages();
};
