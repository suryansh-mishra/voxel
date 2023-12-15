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

import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import useStore from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useMemo } from 'react';
import { useVideoCallStore } from '@/store/store';
import { PiSteps } from 'react-icons/pi';

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

  const peerConnections = useVideoCallStore((state) => state.peerConnections);
  const setPeerConnection = useVideoCallStore(
    (state) => state.setPeerConnections
  );
  const removePeerConnection = useVideoCallStore(
    (state) => state.removePeerConnection
  );

  const inCall = useStore((state) => state.inCall);
  const isLoggedIn = useStore((state) => state.isLoggedIn);
  const socket = useStore((state) => state.socket);
  const localStream = useStore((state) => state.localStream);
  const createdRoomString = useStore((state) => state.createdRoomString);
  const setCreatedRoomString = useStore((state) => state.setCreatedRoomString);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  const videoCallVisible = useStore((state) => state.videoCallVisible);
  const setLocalSendingStream = useStore(
    (state) => state.setLocalSendingStream
  );
  const setInCall = useStore((state) => state.setInCall);
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

  // const createOffer = () => {
  //   localPeerConnObj
  //     .createOffer()
  //     .then((offer) => {
  //       localPeerConnObj.setLocalDescription(offer);
  //       socket.emit('offer', {
  //         offer,
  //         roomId: currentRoom,
  //       });
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //     });
  // };

  const createAnswer = () => {};

  const servers = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
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

  const endCall = () => {
    // TODO : Need to remove the backend entry of active room from it
    // Gotta take care I don't allow rooms which are inactive to be joined on the backend
    // Why doesn't this stop ?

    const tracks = localStream?.getTracks();
    tracks?.forEach(async (track) => {
      track.stop();
    });
    setVideoCallVisible(false);
    setLocalSendingStream(null);
    // localPeerConnObj.close();
    // setLocalPeerConnObj(null);
    setCurrentRoom(null);
    setCreatedRoomString('');
  };

  const endChat = () => {
    setCurrentRoom(null);
    setCreatedRoomString('');
    setVideoCallVisible(false);
  };

  const showVideoCall = (e) => {
    setVideoCallVisible(true);
  };
  const createVoxelRoom = async () => {
    if (socket) {
      console.log('Room creation');
      socket.emit('create_room');
    } else {
      toast({
        title: 'Error connecting to servers',
      });
    }
  };
  const createVoxelCall = async () => {
    if (socket) {
      console.log('Call creation');
      socket.emit('create_call');
    } else {
      console.log(`Local stream available  : ${Boolean(localStream)}`);
      toast({
        title: 'Error connecting to servers',
      });
    }
  };

  // const initRTCPeerConnections = (socketCounts, socketPairs) => {
  //   socketPairs.forEach(async (el) => {
  //     if (el.at(0) === socket.id) {
  //       const pc = new RTCPeerConnection(servers);
  //       setPeerConnection(el[1], pc);
  //       const offer = await pc.createOffer();
  //       await pc.setLocalDescription(offer);
  //       socket.emit('offer', { socketId: el[1], offer: offer });
  //     }
  //   });
  // };

  const joinVoxelCall = () => {
    if (socket && joinRoomString) {
      socket.emit('join', { roomId: joinRoomString });

      // 'mesh',
      //   (data) => {
      //     initRTCPeerConnections();
      //     // createRTCOffer();
      //     console.log(data.socketPairs);
      //     alert('mesh received');
      //   };
    }
  };

  const joinRoomInputHandler = (e) => {
    if (e) setJoinRoomString(e.target.value);
  };

  const clearPreviousRoom = () => {
    setCurrentRoom('');
    setLocalSendingStream(null);
    setCreatedRoomString('');
    setJoinRoomString('');
  };

  useEffect(() => {
    if (!isLoggedIn) router.push('/');
  }, [isLoggedIn]);

  useEffect(() => {
    if (socket) {
      socket.on('room_created', async (data) => {
        clearPreviousRoom();
        setCurrentRoom(data.roomId);
        setCreatedRoomString(data.roomId);
        // GET LOCAL MEDIA STREAM
        toast({
          title: 'Voxel room created',
          description:
            'Ask them to join your voxel chat by copying the room id',
        });

        if (!localStream) {
          let ls;
          try {
            ls = await navigator.mediaDevices.getUserMedia(mediaConstraints);
          } catch (err) {
            console.log(err);
            alert('Something went wrong with accessing A/V devices');
          }
          if (ls) {
            setLocalStream(ls);
            setLocalSendingStream(ls);
            setVideoCallVisible(true);
            // alert('Sending a signal');
            // socket.emit('signal', data.roomId);
          } else
            toast({
              title: 'No video/audio media device found',
              variant: 'destructive',
            });
        } else {
          setLocalSendingStream(localStream);
          setVideoCallVisible(true);
        }
      });

      socket.on('joined', (data) => {
        setCurrentRoom(data.message.data.roomId);
        toast({
          title: data.message.title,
          description: data.message.description,
        });
        socket.emit('signal', data.message.data.roomId);
      });

      socket.on('mesh', (data) => {
        console.log(data);
        alert('mesh received');
        // data?.message?.data?.socketPairs?.forEach((pair) => {
        //   // FORM THE MESH PAIRS IN RTC
        //   initRTCPeerConnections(
        //     data?.message?.data?.socketCounts,
        //     data?.message?.data?.socketPairs
        //   );
        // });

        console.log(
          'SUCCESSFULLY REACHED THIS POINT, PROCEED TO MAKE MESH WORK!!!'
        );
      });

      socket.on('offer', async (data) => {
        if (data.message.data.offer) {
          const pc = new RTCPeerConnection();
          setPeerConnection(data.message.data.socketId, pc);
          await pc.setRemoteDescription(
            new RTCSessionDescription(data.message.data.offer)
          );

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('answer', {
            socketId: data.message.data.socketId,
            answer,
          });
        }
      });

      socket.on('answer', async (data) => {
        if (data.message.data.answer) {
        }
      });

      socket.on('error', (data) => {
        console.log('error', data);
        alert(`ERROR :  ${data.message.title}`);
        toast({
          title: data.message.title,
          description: data.message.description,
          variant: 'destructive',
        });
      });
    }
  }, [socket]);

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
                    readOnly
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
        </>
      )}
    </>
  );
}
