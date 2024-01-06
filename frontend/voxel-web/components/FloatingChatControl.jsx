'use client';

import useStore from '@/store/store';
import { TbMaximize } from 'react-icons/tb';
import { Button } from './ui/button';
import { PiPhoneDisconnectFill } from 'react-icons/pi';
import { IoMdMicOff, IoMdMic } from 'react-icons/io';
import { toggleAudio, toggleVideo } from '@/utils/controls/callControls';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';

export default function FloatingChatControl() {
  const videoCallVisible = useStore((state) => state.videoCallVisible);
  const setIsAudioOn = useStore((state) => state.setIsAudioOn);
  const isVideoOn = useStore((state) => state.isVideoOn);
  const setIsVideoOn = useStore((state) => state.setIsVideoOn);
  const localStream = useStore((state) => state.localStream);
  const inCall = useStore((state) => state.inCall);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  const isAudioOn = useStore((state) => state.isAudioOn);

  const toggleAudioStream = () => {
    setIsAudioOn(!isAudioOn);
    toggleAudio(localStream);
  };
  const toggleVideoStream = () => {
    setIsVideoOn(!isVideoOn);
    toggleVideo(localStream);
  };

  const maximizeVideoCall = (e) => {
    e.preventDefault();
    setVideoCallVisible(true);
  };

  return (
    <>
      {inCall && !videoCallVisible && (
        <div className="bg-accent-light-bright text-white p-1 fixed overflow-hidden bottom-0 left-0 ml-10 mb-10 rounded-2xl">
          <Button variant="custom" size="icon" onClick={maximizeVideoCall}>
            <TbMaximize className="text-lg" />
          </Button>
          <Button variant="custom" size="icon">
            <PiPhoneDisconnectFill className="text-lg" />
          </Button>
          <Button variant="custom" size="icon" onClick={toggleAudioStream}>
            {isAudioOn ? (
              <IoMdMic className="text-lg" />
            ) : (
              <IoMdMicOff className="text-lg" />
            )}
          </Button>
          <Button variant="custom" size="icon" onClick={toggleVideoStream}>
            {isVideoOn ? (
              <FaVideoSlash className="text-lg" />
            ) : (
              <FaVideo className="text-lg" />
            )}
          </Button>
        </div>
      )}
    </>
  );
}
