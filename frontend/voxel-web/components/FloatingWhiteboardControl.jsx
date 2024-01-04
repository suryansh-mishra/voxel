'use client';

import useStore from '@/store/store';
import { Button } from './ui/button';
import { PiPresentationBold } from 'react-icons/pi';
export default function FloatingChatControl() {
  const currentRoom = useStore((state) => state.currentRoom);
  const whiteboardVisible = useStore((state) => state.whiteboardVisible);
  const setWhiteboardVisible = useStore((state) => state.setWhiteboardVisible);

  const toggleWhiteboard = () => setWhiteboardVisible(!whiteboardVisible);

  return (
    currentRoom &&
    !whiteboardVisible && (
      <div className="bg-accent-light-bright text-white p-1 fixed overflow-hidden bottom-0 left-0 ml-10 mb-24 z-[90] rounded-2xl">
        <Button variant="custom" size="icon" onClick={toggleWhiteboard}>
          <PiPresentationBold className="text-lg" />
        </Button>
      </div>
    )
  );
}
