'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import DarkModeToggle from './dark.mode.toggle';
import NavListItem from './NavListItem';
import NavListButton from './NavListButton';
import { BiMenuAltRight } from 'react-icons/bi';
import axios from 'axios';
import useStore from '@/store/store';
import { useToast } from '@/components/ui/use-toast';
import { endChatHelper } from '@/utils/controls/chatControls';
import { endCallHelper } from '@/utils/controls/callControls';
import { mediaConstraints } from '@/utils/webrtc-config/constraints';

export default function Nav() {
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const { toast } = useToast();

  const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);
  const setUser = useStore((state) => state.setUser);
  const state = useStore((state) => state);
  const socket = useStore((state) => state.socket);
  const shapes = useStore((state) => state.shapes);
  const setMessage = useStore((state) => state.setMessage);
  const setShapes = useStore((state) => state.setShapes);
  const removeShape = useStore((state) => state.removeShape);
  const peerConnection = useStore((state) => state.peerConnection);
  const setPeerConnection = useStore((state) => state.setPeerConnection);
  const setLocalStream = useStore((state) => state.setLocalStream);
  const setInCall = useStore((state) => state.setInCall);
  const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
  const setCreatedRoomString = useStore((state) => state.setCreatedRoomString);
  const currentRoom = useStore((state) => state.currentRoom);
  const setCurrentRoom = useStore((state) => state.setCurrentRoom);
  const setRemoteStream = useStore((state) => state.setRemoteStream);
  const emptyMessages = useStore((state) => state.emptyMessages);
  const emptyShapes = useStore((state) => state.emptyShapes);
  const setCurrentRoomUserCount = useStore(
    (state) => state.setCurrentRoomUserCount
  );
  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const handleLogout = async () => {
    await axios.post(`${process.env.NEXT_PUBLIC_SERVER}/users/logout`);
    setUser({});
    setIsLoggedIn(false);
    endChatHelper(state);
  };

  // BEST PLACE TO DEFINE SOCKET EVENT & HANDLERS, SINCE IT STAYS
  // THROUGHOUT THE APPLICATION

  const handleEndedCall = () => {
    console.log('Ended call was handled');
    endCallHelper(state);
  };

  const handleDeclinedCall = (resp) => {
    toast({ title: resp.message.title });
    endCall();
  };

  const handleIncomingCall = async (data) => {
    console.log('Incoming Call detected.');
    const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
    if (!stream)
      return toast({
        title: 'Media not available',
        description: 'A/V devices permission not available for call',
      });

    setLocalStream(stream);
    const pc = new RTCPeerConnection();
    const offer = data.message.data.offer;
    const offerDescription = new RTCSessionDescription(offer);
    await pc.setRemoteDescription(offerDescription);
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });
    const answer = await pc.createAnswer();
    if (answer) {
      await pc.setLocalDescription(answer);
      socket.emit('call:answer', {
        roomId: currentRoom,
        answer,
      });
      setPeerConnection(pc);
      setInCall(true);
      setVideoCallVisible(true); // Note : Move video call visible to when ICE connected ?
    }
  };

  const handleAnsweredCall = useCallback(
    (data) => {
      const answer = data.message.data.answer;
      const answerDescription = new RTCSessionDescription(answer);
      peerConnection.setRemoteDescription(answerDescription);
      toast({ title: 'Call answered.' });
      setInCall(true);
      setVideoCallVisible(true); // Note : Move video call visible to when ICE connected ?
    },
    [peerConnection]
  );

  const handleIceCandidates = useCallback(
    (data) => {
      const candidate = new RTCIceCandidate(data.candidate);
      peerConnection
        .addIceCandidate(candidate)
        .then(() => {
          console.log('ICE candidates were added successfully.');
        })
        .catch((error) => {
          toast({ title: 'WebRTC - ICE Issues in call establishment' });
          console.error('Error adding ICE candidate:', error);
        });
    },
    [peerConnection]
  );

  const handleRoomJoined = (data) => {
    emptyShapes();
    emptyMessages();
    setCurrentRoom(data.message.data.roomId);
    toast({
      title: data.message.title,
    });
  };

  const handleRoomCreation = (data) => {
    emptyShapes();
    emptyMessages();
    setCurrentRoom(data.roomId);
    setCreatedRoomString(data.roomId);
    toast({
      title: 'Voxel room created',
      description: 'Invite your friends. Share Room Id!',
    });
  };

  useEffect(() => {
    if (socket) {
      socket.on('room:created', handleRoomCreation);
      socket.on('room:joined', handleRoomJoined);
      socket.on('room:usercount', setCurrentRoomUserCount);

      socket.on('whiteboard:shape', (data) => setShapes(data));
      socket.on('whiteboard:undo', (shapeId) => removeShape(shapeId));
      socket.on('whiteboard:clear', emptyShapes);

      socket.on('error', (data) => {
        toast({
          title: data.message.title,
          description: data.message.description,
          variant: 'destructive',
        });
      });

      return () => {
        socket.off('room:created');
        socket.off('room:joined');
        socket.off('whiteboard:shape');
        socket.off('whiteboard:undo');
        socket.off('whiteboard:clear');
        socket.off('error');
      };
    }
  }, [socket, shapes]);

  useEffect(() => {
    if (currentRoom) {
      socket.on('call:incoming', handleIncomingCall);
      socket.on('message', (data) => {
        setMessage({ message: data, variant: 'R' });
      });

      return () => {
        socket.off('call:incoming', handleIncomingCall);
        socket.off('message');
      };
    }
  }, [currentRoom]);
  const handleIncomingTracks = async (event) => {
    const [rStream] = event.streams;
    console.log('Remote track received as ', rStream);
    setRemoteStream(rStream);
  };
  const handleGeneratedIceCandidates = (event) => {
    if (event.candidate)
      socket.emit('call:candidate', {
        roomId: currentRoom,
        candidate: event.candidate,
      });
  };

  useEffect(() => {
    if (peerConnection) {
      peerConnection.addEventListener('track', handleIncomingTracks);
      // console.log('PEER CONNECTION ON TRACK AND ICE CANDIDATE USE EFFECT RAN');
      // peerConnection.ontrack = (event) => {
      //   if (event) {
      //     console.log('Remote tracks received.');
      //     const newStream = new MediaStream();
      //     event.streams[0].getTracks().forEach((track) => {
      //       newStream.addTrack(track);
      //     });
      //     setRemoteStream(newStream);
      //   }
      // };

      peerConnection.addEventListener(
        'icecandidate',
        handleGeneratedIceCandidates
      );
      return () => {
        peerConnection.removeEventListener('track', handleIncomingTracks);
        peerConnection.removeEventListener(
          'icecandidate',
          handleGeneratedIceCandidates
        );
      };
    }
  }, [peerConnection]);

  useEffect(() => {
    console.log(
      'PEER CONNECTION ICE CONNECTION STATE CHANGED : ',
      peerConnection?.iceConnectionState
    );
  }, [peerConnection?.iceConnectionState]);

  useEffect(() => {
    if (peerConnection) {
      socket.on('call:end', handleEndedCall);
      socket.on('call:declined', handleDeclinedCall);

      return () => {
        socket.off('call:end', handleEndedCall);
        socket.off('call:declined', handleDeclinedCall);
      };
    }
  }, [peerConnection, currentRoom]);

  useEffect(() => {
    if (peerConnection) {
      socket.on('call:answered', handleAnsweredCall);
      socket.on('call:candidate', handleIceCandidates);
      return () => {
        socket.off('call:answered', handleAnsweredCall);
        socket.off('call:candidate', handleIceCandidates);
      };
    }
  }, [peerConnection, handleAnsweredCall, handleIceCandidates]);

  return (
    <div className="container justify-between md:justify-between flex h-14 md:h-20 md:px-14 items-center backdrop-blur-lg sticky top-0">
      <div className="flex items-center">
        <Image
          src="voxel-logo.svg"
          width="1000"
          height="1000"
          alt="logo"
          className="mr-2 w-10 h-10 rounded-full"
        ></Image>
        <h1 className="text-xl  font-medium">voxel</h1>
      </div>

      <ul className="md:flex hidden flex-row gap-2 text-sm items-baseline justify-self-end mr-20">
        <NavListItem href="/">Home</NavListItem>
        <NavListItem href="/chats">Chats</NavListItem>
        <NavListButton onClick={handleLogout}>Logout</NavListButton>
      </ul>
      <div className="flex items-center gap-4">
        <DarkModeToggle />
        <div className="md:hidden relative">
          <button
            onClick={toggleHamburger}
            className="hover:bg-accent-light-faded p-2 rounded-full"
          >
            <BiMenuAltRight />
          </button>
          {hamburgerOpen && (
            <nav
              className={`absolute mt-2 right-0 border dark:border-zinc-700 border-zinc-200 rounded-lg bg-white dark:bg-zinc-950`}
            >
              <ul className="px-1 py-1 flex flex-col text-sm">
                <NavListItem
                  href="/"
                  onClick={toggleHamburger}
                  className={'block rounded-lg px-8 py-2'}
                >
                  Home
                </NavListItem>
                <NavListItem
                  href="/chats"
                  onClick={toggleHamburger}
                  className={'block rounded-lg px-8 py-2'}
                >
                  Chats
                </NavListItem>
                <NavListItem
                  href="/"
                  onClick={handleLogout}
                  className={'block rounded-lg px-8 py-2'}
                >
                  Logout
                </NavListItem>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
