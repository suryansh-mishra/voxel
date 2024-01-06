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
  const peerConnection = useStore((state) => state.peerConnection);
  const currentRoom = useStore((state) => state.currentRoom);
  const inCall = useStore((state) => state.inCall);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const socket = useStore((state) => state.socket);
  const createdRoomString = useStore((state) => state.createdRoomString);
  const messages = useStore((state) => state.messages);
  const setInCall = useStore((state) => state.setInCall);
  const setRemoteStream = useStore((state) => state.setRemoteStream);
  const setCreatedRoomString = useStore((state) => state.setCreatedRoomString);
  const setPeerConnection = useStore((state) => state.setPeerConnection);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  const setLocalStream = useStore((state) => state.setLocalStream);
  const setCurrentRoom = useStore((state) => state.setCurrentRoom);
  const setShapes = useStore((state) => state.setShapes);
  const removeShape = useStore((state) => state.removeShape);
  const emptyShapes = useStore((state) => state.emptyShapes);

  const setMessage = useStore((state) => state.setMessage);

  // CHECK AND INITIATE SOCKET CONNECTION IF NOT PRESENT
  useEffect(() => {
    if (!socket && isLoggedIn) {
      console.log('Creating socket conn from chats page');
      const socket = new io(`${process.env.NEXT_PUBLIC_SERVER_URI_BASE}`, {
        withCredentials: true,
      });
      if (socket) setSocket(socket);
    }
  }, [socket]);

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

  const servers = {
    iceServers: [{ urls: ['stun:stun1.l.google.com:19302'] }],
  };

  const mediaConstraints = { video: true, audio: true };

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
        console.log(
          'PC : ',
          peerConnection,
          '\n\n\nUpdated yet? ',
          state.peerConnection
        );
      });
  };

  // const createAnswer = async (offer) => {
  //   const pc = new RTCPeerConnection();
  //   const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
  //   setLocalStream(stream);
  //   const tracks = stream.getTracks();
  //   tracks.forEach((track) => {
  //     pc.addTrack(track, stream);
  //   });
  //   const remoteStream = (pc.ontrack = (event) => {
  //     event.streams[0].getTracks((track) => {});
  //   });
  //   setPeerConnection(pc);
  // };

  const endCall = () => endCallHelper(state);

  const endChat = () => {
    endChatHelper(state);
    socket.emit('room:leave', { roomId: currentRoom });
  };

  const createRoom = () => {
    if (socket) socket.emit('room:create');
    else toast({ title: 'Error connecting to servers' });
  };

  const joinVoxelChat = () => {
    if (socket && joinRoomString)
      socket.emit('room:join', { roomId: joinRoomString });
  };

  const joinRoomInputHandler = (e) => {
    if (e) setJoinRoomString(e.target.value);
  };

  const sendMessage = () => {
    if (!socket) return toast({ title: 'Server connection not established' });
    if (!messageInputRef.current.value) return;
    const message = messageInputRef.current.value;
    socket.emit('message', { message, roomId: currentRoom });
    setMessage({ message, variant: 'S' });
    messageInputRef.current.value = '';
  };

  const clearPreviousRoom = () => {
    setCurrentRoom('');
    setCreatedRoomString('');
    setJoinRoomString('');
  };

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket) {
      socket.on('room:created', async (data) => {
        clearPreviousRoom();
        setCurrentRoom(data.roomId);
        setCreatedRoomString(data.roomId);
        toast({
          title: 'Voxel room created',
          description: 'Invite your friends. Share Room Id!',
        });
      });

      socket.on('room:joined', (data) => {
        setCurrentRoom(data.message.data.roomId);
        toast({
          title: data.message.title,
        });
      });

      socket.on('whiteboard:shape', (data) => {
        setShapes(data);
      });

      socket.on('whiteboard:undo', (data) => removeShape(data.shapeId));

      socket.on('whiteboard:clear', emptyShapes);

      socket.on('error', (data) => {
        toast({
          title: data.message.title,
          description: data.message.description,
          variant: 'destructive',
        });
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket && currentRoom && peerConnection) {
      if (!peerConnection?.ontrack)
        peerConnection.ontrack = (event) => {
          if (event) {
            const newStream = new MediaStream();
            event.streams[0].getTracks().forEach((track) => {
              newStream.addTrack(track);
            });
            setRemoteStream(newStream);
          }
        };

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('call:candidate', {
            roomId: currentRoom,
            candidate: event.candidate,
          });
        }
      };

      socket.on('call:answered', async (data) => {
        const answer = data.message.data.answer;
        const answerDescription = new RTCSessionDescription(answer);
        peerConnection.setRemoteDescription(answerDescription);
        toast({ title: 'Call connected' });
        setInCall(true);
        setVideoCallVisible(true);
      });

      socket.on('call:candidate', (data) => {
        const candidate = new RTCIceCandidate(data.candidate);
        peerConnection
          .addIceCandidate(candidate)
          .then(() => {
            console.log(
              'Successfully added ICE Candidates by getting from socket'
            );
          })
          .catch((error) => {
            toast({ title: 'Issues in call establishment' });
            console.error('Error adding ICE candidate:', error);
          });
      });
    }
  }, [socket, currentRoom, peerConnection]);

  const handleIncomingCall = async (data) => {
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    if (!stream)
      return toast({
        title: 'Media not available',
        description: 'A/V devices permission not available for call',
      });

    setLocalStream(stream);
    const pc = new RTCPeerConnection();
    setPeerConnection(pc);
    const offer = data.message.data.offer;
    const offerDescription = new RTCSessionDescription(offer);
    await pc.setRemoteDescription(offerDescription);
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
      pc.addTrack(track, stream);
    });
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    setVideoCallVisible(true);
    socket.emit('call:answer', {
      roomId: currentRoom,
      answer,
    });
    setInCall(true);
  };

  useEffect(() => {
    if (socket && currentRoom) {
      socket.on('call:incoming', handleIncomingCall);
      socket.on('message', (data) => {
        setMessage({ message: data, variant: 'R' });
      });
    }
  }, [socket, currentRoom]);

  const handleDeclinedCall = (resp) => {
    toast({ title: resp.message.title });
    endCall();
  };
  useEffect(() => {
    if (socket && peerConnection) {
      socket.on('call:end', endCall);
      socket.on('call:declined', handleDeclinedCall);
    }
  }, [socket, peerConnection]);

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
