'use client';

import { useEffect, useRef } from 'react';
import useStore from '@/store/store';
import VideoBox from './ui/videobox';
import { BsCaretDown } from 'react-icons/bs';
import { Button } from './ui/button';
import { PiPhoneDisconnectFill } from 'react-icons/pi';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';
import { IoMdMic, IoMdMicOff } from 'react-icons/io';
import {
  endCallHelper,
  toggleAudio,
  toggleVideo,
} from '@/utils/controls/callControls';

export default function ChatScreen() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const isAudioOn = useStore((state) => state.isAudioOn);
  const isVideoOn = useStore((state) => state.isVideoOn);

  const state = useStore((state) => state);
  const socket = useStore((state) => state.socket);
  const currentRoom = useStore((state) => state.currentRoom);

  const localStream = useStore((state) => state.localStream);
  const remoteStream = useStore((state) => state.remoteStream);
  const videoCallVisible = useStore((state) => state.videoCallVisible);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);

  const setIsAudioOn = useStore((state) => state.setIsAudioOn);
  const setIsVideoOn = useStore((state) => state.setIsVideoOn);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }

    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [
    localStream,
    remoteVideoRef,
    remoteStream,
    localVideoRef,
    videoCallVisible,
  ]);
  const toggleAudioStream = () => {
    setIsAudioOn(!isAudioOn);
    toggleAudio(localStream);
  };
  const toggleVideoStream = () => {
    setIsVideoOn(!isVideoOn);
    toggleVideo(localStream);
  };

  const endCall = () => {
    socket.emit('call:end', currentRoom);
    endCallHelper(state);
  };

  return (
    <>
      {videoCallVisible && (
        <div className="flex flex-col z-40 items-center fixed justify-center h-[95dvh] w-full top-5 left-0 backdrop-blur-xl rounded-xl">
          <header className="flex px-4 w-full items-center justify-between">
            <h1 className="py-2 font-semibold">Voxel Call</h1>

            <button
              className="text-sm p-1.5 flex items-center justify-center dark:bg-zinc-800 dark:hover:bg-zinc-600 bg-zinc-200 hover:bg-zinc-300 rounded-full aspect-square"
              onClick={() => setVideoCallVisible(false)}
            >
              <BsCaretDown />
            </button>
          </header>

          {/* VIDEO GRID */}

          <div className="h-[90dvh] w-full relative overflow-hidden outline-2 border-spacing-2 px-2 rounded-lg">
            <VideoBox videoRef={localVideoRef} variant={'mini'} muted={true} />
            <VideoBox videoRef={remoteVideoRef} variant={'fullscreen'} />
          </div>
          {/* END OF VIDEO GRID */}

          <div className="fixed z-30 bottom-0 gap-8 mb-8 flex justify-around items-center text-zinc-200">
            <Button
              variant="custom"
              size="icon"
              onClick={toggleAudioStream}
              className="bg-zinc-700 hover:bg-zinc-900"
            >
              {isAudioOn ? (
                <IoMdMic className="text-lg" />
              ) : (
                <IoMdMicOff className="text-lg" />
              )}
            </Button>
            <Button
              variant="custom"
              size="icon"
              className="bg-red-500 hover:bg-red-700"
              onClick={endCall}
            >
              <PiPhoneDisconnectFill className="text-lg" />
            </Button>
            <Button
              variant="custom"
              size="icon"
              onClick={toggleVideoStream}
              className="bg-zinc-700 hover:bg-zinc-900"
            >
              {isVideoOn ? (
                <FaVideoSlash className="text-lg" />
              ) : (
                <FaVideo className="text-lg" />
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
