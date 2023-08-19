'use client';

import ChatScreen from '@/components/ChatScreen';
import Nav from '@/components/Nav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';

function SkeletonChats() {
  return (
    <div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
    </div>
  );
}

export default function Chats() {
  const router = useRouter();

  const { toast } = useToast();

  const [joinRoomString, setJoinRoomString] = useState('');
  const joinInputRef = useRef(null);

  const currentRoom = useStore((state) => state.currentRoom);
  const localPeerConnObj = useStore((state) => state.localPeerConnObj);
  const remotePeerConnObj = useStore((state) => state.remotePeerConnObj);
  const setLocalPeerConnObj = useStore((state) => state.setLocalPeerConnObj);
  const setRemotePeerConnObj = useStore((state) => state.setRemotePeerConnObj);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const socket = useStore((state) => state.socket);
  const localStream = useStore((state) => state.localStream);
  const createdRoomString = useStore((state) => state.createdRoomString);
  const setCreatedRoomString = useStore((state) => state.setCreatedRoomString);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  const videoCallVisible = useStore((state) => state.videoCallVisible);
  const setLocalStream = useStore((state) => state.setLocalStream);
  const setCurrentRoom = useStore((state) => state.setCurrentRoom);

  // TODO : IMPLEMENT ERROR FLOW B/W BACKEND AND FRONTEND FOR ROOMS ETC

  const copyToClipboard = async (e) => {
    if (e) e.preventDefault();
    try {
      await navigator.clipboard.writeText(createdRoomString);
      if (e)
        toast({
          title: 'Copied to clipboard',
          description: 'Ask them to join your voxel call',
        });
    } catch (err) {
      toast({
        title: 'No clipboard support',
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
      });
    }
  };
  const mediaConstraints = { video: true, audio: true };

  const createOffer = () => {};

  const createAnswer = () => {};

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
          'stun:stun.l.google.com:19302',
          'stun:stun3.l.google.com:19302',
          'stun:stun4.l.google.com:19302',
          'stun:stun.services.mozilla.com',
        ],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  const handleConnection = (e) => {
    alert('At handle conn');
  };
  const handleConnectionChange = (e) => {
    alert('At handle conn change');
  };

  const createRTCPeerConnection = () => {
    const lpc = new RTCPeerConnection(servers);
    lpc.addEventListener('icecandidate', handleConnection);
    lpc.addEventListener('iceconnectionstatechange', handleConnectionChange);
    setLocalPeerConnObj(lpc);
    // lpc.addStream(localStream);
  };

  const endCall = () => {
    // TODO : Need to remove the backend entry of active room from it
    // Gotta take care I don't allow rooms which are inactive to be joined on the backend

    const tracks = localStream?.getTracks();
    tracks?.forEach((element) => {
      element?.stop();
    });
    setCreatedRoomString('');
    setLocalStream(null);
  };

  const goToChat = (e) => {
    setVideoCallVisible(true);
  };

  const createVoxelCall = async () => {
    if (socket) {
      socket.emit('create');
      socket.on('room_created', async (data) => {
        console.log(data);
        setCurrentRoom(data.roomId);
        setCreatedRoomString(data.roomId);
        toast({
          title: 'Voxel call created',
          description:
            'Ask them to join your voxel call by copying the room id',
        });

        let ls;
        try {
          ls = await navigator.mediaDevices.getUserMedia(mediaConstraints);
        } catch (err) {
          console.log(err);
        }
        if (ls) setLocalStream(ls);
        else
          toast({
            title: 'No video/audio media device found',
            variant: 'destructive',
          });

        setVideoCallVisible(true);
        createRTCPeerConnection();
      });
    }
  };

  const joinVoxelCall = () => {
    if (socket && joinRoomString) {
      socket.emit('join', { roomId: joinRoomString });
      socket.on('joined', (data) => {
        alert('Joined', data);
        setCurrentRoom(data.roomId);
        toast({
          title: 'Room joined',
          description: 'Move to the chat',
        });
      });
      socket.on('error', (data) => {
        if (data) {
          toast({
            title: 'Invalid Room Id',
            description: 'Please try with a valid room',
            variant: 'destructive',
          });
        }
      });
    } else {
      toast({
        title: 'Enter Room Id',
        description: 'Please enter Room Id to join the voxel call',
        variant: 'destructive',
      });
    }
  };

  const joinRoomInputHandler = (e) => {
    if (e) setJoinRoomString(e.target.value);
  };

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn]);

  return (
    <>
      {isLoggedIn && (
        <>
          <Nav />
          <main className="flex flex-col md:flex-row justify-center md:mx-12 p-2 md:p-4 gap-4">
            <div className="flex md:min-w-fit flex-col gap-2 col-span-1">
              <Card className={''}>
                <CardHeader className="pb-4">
                  <CardTitle>Join a chat</CardTitle>
                  <CardDescription>
                    Please enter the link and press join
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    className="my-2 mt-0"
                    ref={joinInputRef}
                    onChange={joinRoomInputHandler}
                  ></Input>
                  <Button className="mt-2 w-full" onClick={joinVoxelCall}>
                    Join
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle>Create a new chat</CardTitle>
                  <CardDescription>
                    Creating a new chat takes a fluke
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Input
                    className="my-2 mt-0 w-full"
                    value={createdRoomString}
                  ></Input>
                  <div className="flex gap-1 my-2 flex-col">
                    <Button className=" w-full" onClick={createVoxelCall}>
                      Create
                    </Button>
                    <Button
                      className={`w-full ${createdRoomString ? '' : 'hidden'}`}
                      onClick={copyToClipboard}
                    >
                      Copy
                    </Button>
                    <Button
                      className={`w-full ${createdRoomString ? '' : 'hidden'}`}
                      onClick={endCall}
                    >
                      End Call
                    </Button>
                    <Button
                      className={`w-full hover:bg-accent-light-bright active:opacity-90 dark:bg-cyan-100 hover:dark:bg-cyan-200 duration-200 ${
                        createdRoomString ? '' : 'hidden'
                      }`}
                      onClick={goToChat}
                    >
                      Go To Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="grow w-full p-4 flex flex-col">
              <SkeletonChats />
              {/* TODO : Add no previous chats available or loading */}
              {/* <div className="grid place-items-center h-full">
          <h2 className="text-xl font-bold">No Previous Chats Available</h2>
        </div> */}
            </Card>
          </main>
          {videoCallVisible && <ChatScreen />}
        </>
      )}
    </>
  );
}
