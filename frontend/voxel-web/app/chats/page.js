'use client';

import Nav from '@/components/Nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { VscSend } from 'react-icons/vsc';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { endCallHelper } from '@/utils/controls/callControls';
import { endChatHelper } from '@/utils/controls/chatControls';
import { servers, mediaConstraints } from '@/utils/webrtc-config/constraints';

function MessageBox({ variant, content }) {
  return (
    <div
      className={`${
        variant === 'S' ? 'bg-blue-600 self-end' : 'bg-zinc-700'
      } text-white right-0 max-w-xs md:max-w-md py-2 px-3 rounded-lg`}
    >
      <p>{content}</p>
    </div>
  );
}

export default function Chats() {
  const router = useRouter();
  const { toast } = useToast();
  const [joinRoomString, setJoinRoomString] = useState('');
  const joinInputRef = useRef(null);
  const messageInputRef = useRef(null);

  const state = useStore((state) => state);
  const currentRoom = useStore((state) => state.currentRoom);
  const inCall = useStore((state) => state.inCall);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const socket = useStore((state) => state.socket);
  const createdRoomString = useStore((state) => state.createdRoomString);
  const messages = useStore((state) => state.messages);
  const setPeerConnection = useStore((state) => state.setPeerConnection);
  const setLocalStream = useStore((state) => state.setLocalStream);
  const setMessage = useStore((state) => state.setMessage);

  const copyToClipboard = async (e) => {
    if (e) e.preventDefault();
    try {
      await navigator.clipboard.writeText(createdRoomString);
      if (e)
        toast({
          title: 'Copied to clipboard',
          description: 'Ask them to join your voxel chat',
        });
    } catch (err) {
      toast({
        title: 'No clipboard support',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  const endChat = () => {
    endChatHelper(state);
    socket.emit('room:leave', { roomId: currentRoom });
  };

  const joinVoxelChat = () => {
    if (socket && joinRoomString) {
      if (currentRoom) endChat();

      socket.emit('room:join', { roomId: joinRoomString });
    }
  };

  const joinRoomInputHandler = (e) => {
    if (e) setJoinRoomString(e.target.value);
  };

  const createRoom = () => {
    if (socket) {
      if (currentRoom) endChat();

      socket.emit('room:create');
    } else toast({ title: 'Error connecting to servers' });
  };

  const createOffer = async () => {
    const pc = new RTCPeerConnection(servers);
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    setLocalStream(stream);
    if (!stream)
      return toast({
        title: 'Media not available',
        description: 'A/V devices permission not available for call',
      });
    setPeerConnection(pc);
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      pc.addTrack(track, stream);
    });
    const offer = await pc.createOffer();
    if (stream)
      pc.setLocalDescription(offer).then(() => {
        socket.emit('call:offer', { roomId: currentRoom, offer });
      });
  };

  const sendMessage = () => {
    if (!messageInputRef.current.value) return;
    const message = messageInputRef.current.value;
    socket.emit('message', { message, roomId: currentRoom });
    setMessage({ message, variant: 'S' });
    messageInputRef.current.value = '';
  };

  const endCall = () => {
    if (inCall) socket.emit('call:end', { roomId: currentRoom });
    endCallHelper(state);
  };

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn]);

  useEffect(() => {
    if (!socket && isLoggedIn) {
      const socket = new io(`${process.env.NEXT_PUBLIC_SERVER_URI_BASE}`, {
        withCredentials: true,
      });
      if (socket) setSocket(socket);
    }
  }, []);

  return (
    <>
      {isLoggedIn && (
        <div className="flex flex-col h-dvh">
          <Nav />
          <main className="flex flex-col grow md:flex-row justify-center md:mx-12 p-2 md:p-4 gap-4">
            <div className="flex md:w-1/4 flex-col gap-2 col-span-1">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Have a Chat</CardTitle>
                  <CardDescription>
                    Creating a new chat takes a fluke!
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    className={`my-2 mt-0 ${createdRoomString ? 'hidden' : ''}`}
                    value={joinRoomString ? joinRoomString : currentRoom}
                    ref={joinInputRef}
                    onChange={joinRoomInputHandler}
                  ></Input>
                  <Input
                    className={`my-2 mt-0 ${
                      !createdRoomString ? 'hidden' : ''
                    }`}
                    readOnly
                    value={createdRoomString}
                  ></Input>
                  <Button
                    className="mt-2 w-full"
                    disabled={currentRoom}
                    onClick={joinVoxelChat}
                  >
                    Join
                  </Button>
                  <div className="flex gap-1 my-2 flex-col">
                    <Button
                      className="w-full"
                      disabled={currentRoom}
                      onClick={createRoom}
                    >
                      Create
                    </Button>
                    <Button
                      className={`w-full ${createdRoomString ? '' : 'hidden'}`}
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                    <Button
                      className={`${currentRoom && !inCall ? '' : 'hidden'}`}
                      onClick={createOffer}
                    >
                      Call
                    </Button>
                    <Button
                      className={`${currentRoom && inCall ? '' : 'hidden'}`}
                      onClick={endCall}
                    >
                      End Call
                    </Button>
                    <Button
                      className={`${currentRoom ? '' : 'hidden'}`}
                      onClick={endChat}
                    >
                      End Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="p-4 grow h-56 md:w-3/4 md:items-stretch relative md:h-full flex flex-col ">
              <div className="flex absolute top-0 z-10 left-0 w-full bg-transparent backdrop-blur-md py-3 justify-center mb-2 rounded-t-lg">
                <h2 className="text-lg font-semibold">Live Chat</h2>
              </div>
              {currentRoom ? (
                <div className="flex flex-col-reverse grow py-2 gap-1 relative z-0 text-sm mt-8 overflow-y-scroll overflow-x-hidden">
                  {messages.map((message, index) => {
                    return (
                      <MessageBox
                        variant={message.variant}
                        content={message.message}
                        key={index}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="grid h-full w-full text-2xl text-zinc-500 font-bold place-items-center">
                  Create A Chat First!
                </div>
              )}
              {currentRoom && (
                <div className="flex w-full mt-2">
                  <Input
                    placeholder="Send a message!"
                    ref={messageInputRef}
                  ></Input>
                  <Button
                    variant="custom"
                    type="icon"
                    className="text-md mx-1 rounded-md"
                    onClick={sendMessage}
                  >
                    <VscSend />
                  </Button>
                </div>
              )}
            </Card>
          </main>
        </div>
      )}
    </>
  );
}
