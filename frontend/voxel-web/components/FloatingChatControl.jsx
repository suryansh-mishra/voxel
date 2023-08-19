'use client';

import useStore from '@/store/store';
import { TbMaximize } from 'react-icons/tb';
import { Button } from './ui/button';
import { PiPhoneDisconnectFill } from 'react-icons/pi';
import { BsFillMicMuteFill } from 'react-icons/bs';

export default function FloatingChatControl() {
  const videoCallVisible = useStore((state) => state.videoCallVisible);
  const currentRoom = useStore((state) => state.currentRoom);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  // const disconnect // Separate call handling functionality to utils

  const maximizeVideoCall = (e) => {
    e.preventDefault();
    setVideoCallVisible(true);
  };

  return (
    <>
      {!videoCallVisible && currentRoom && (
        <div className="bg-accent-light-bright text-white p-1 fixed overflow-hidden bottom-0 left-0 ml-10 mb-10 rounded-2xl">
          <Button variant="custom" size="icon" onClick={maximizeVideoCall}>
            <TbMaximize className="text-lg" />
          </Button>
          <Button variant="custom" size="icon">
            <PiPhoneDisconnectFill className="text-lg" />
          </Button>
          <Button variant="custom" size="icon">
            <BsFillMicMuteFill className="text-lg" />
          </Button>
        </div>
      )}
    </>
  );
}
