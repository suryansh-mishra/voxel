'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/store';
import VideoBox from './ui/videobox';
import { BsCaretDown } from 'react-icons/bs';

export default function ChatScreen() {
  const { toast } = useToast();
  const videoRef = useRef(null);
  const localStream = useStore((state) => state.localStream);
  const setLocalStream = useStore((state) => state.setLocalStream);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);

  const mediaConstraints = { video: true, audio: true };
  useEffect(() => {
    const fn = async () => {
      try {
        const ls = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        const pc = new RTCPeerConnection();
        if (ls) setLocalStream(ls);
      } catch (err) {
        console.log(err);
        toast({
          variant: 'destructive',
          description: 'Something went wrong',
          title: 'AT CHAT SCREEN LOCAL STREAM',
        });
      }
    };
    fn();
  }, [videoRef]);

  useEffect(() => {
    if (videoRef && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, videoRef]);

  return (
    <div className="flex flex-col items-center justify-center h-[97dvh] absolute top-5 left-0 mx-5 backdrop-blur-xl rounded-xl">
      <header className="flex px-4 w-full items-center justify-between">
        <h1 className="py-2 font-semibold">room admin's rooms</h1>

        <button
          className="text-sm p-1.5 flex items-center justify-center dark:bg-zinc-800 dark:hover:bg-zinc-600 bg-zinc-200 hover:bg-zinc-300 rounded-full aspect-square"
          onClick={() => setVideoCallVisible(false)}
        >
          <BsCaretDown />
        </button>
      </header>

      {/* VIDEO GRID */}
      <div className="h-[90dvh] w-full flex flex-wrap overflow-hidden justify-around outline-2   border-spacing-2 px-2 rounded-lg">
        <VideoBox videoRef={videoRef} />
      </div>
      {/* END OF VIDEO GRID */}

      <div className="fixed left-0 bottom-0 mb-8 flex justify-around w-full items-center">
        {/* TODO : IMPLEMENT THE MUTE ETC FUNC IN LATER HALF */}
        {/* <Button>Leave</Button>
        <Button>Mute</Button>
        <Button>Video cut</Button> */}
      </div>
    </div>
  );
}
