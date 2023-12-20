// 'use client';
// import Nav from '@/components/Nav';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { useToast } from '@/components/ui/use-toast';
// import useStore from '@/store/store';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState, useRef } from 'react';
// import { SkeletonChats } from './page';

// export default function Chats() {
//   const router = useRouter();

//   const { toast } = useToast();

//   const [joinRoomString, setJoinRoomString] = useState('');
//   const joinInputRef = useRef(null);

//   const peerConnection = useStore((state) => state.peerConnection);
//   const currentRoom = useStore((state) => state.currentRoom);
//   const inCall = useStore((state) => state.inCall);
//   const isLoggedIn = useStore((state) => state.isLoggedIn);
//   const socket = useStore((state) => state.socket);
//   const localStream = useStore((state) => state.localStream);
//   const createdRoomString = useStore((state) => state.createdRoomString);
//   const videoCallVisible = useStore((state) => state.videoCallVisible);

//   const setCreatedRoomString = useStore((state) => state.setCreatedRoomString);
//   const setPeerConnection = useStore((state) => state.setPeerConnection);
//   const setVideoCallVisible = useStore((state) => state.setVideoCallVisible);
//   const setInCall = useStore((state) => state.setInCall);
//   const callSetupPhase = useStore((state) => state.callSetupPhase);
//   const setCallSetupPhase = useStore((state) => state.setCallSetupPhase);
//   const setLocalStream = useStore((state) => state.setLocalStream);
//   const setCurrentRoom = useStore((state) => state.setCurrentRoom);

//   // TODO : IMPLEMENT ERROR FLOW B/W BACKEND AND FRONTEND FOR ROOMS ETC
//   const copyToClipboard = async (e) => {
//     if (e) e.preventDefault();
//     try {
//       await navigator.clipboard.writeText(createdRoomString);
//       if (e)
//         toast({
//           title: 'Copied to clipboard',
//           description: 'Ask them to join your voxel chat',
//         });
//     } catch (err) {
//       toast({
//         title: 'No clipboard support',
//         description: 'Failed to copy to clipboard',
//         variant: 'destructive',
//       });
//     }
//   };

//   const servers = {
//     iceServers: [
//       {
//         urls: [
//           'stun:stun1.l.google.com:19302',
//           'stun:stun.services.mozilla.com',
//         ],
//       },
//     ],
//     iceCandidatePoolSize: 10,
//   };

//   const mediaConstraints = { video: true, audio: true };

//   // CREATE OFFER IS USED FOR CALL
//   const createOffer = async () => {
//     const pc = new RTCPeerConnection(servers);
//     setPeerConnection(pc);
//     const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
//     setLocalStream(stream);
//     stream.getTracks().forEach((track) => {
//       pc.addTrack(track, stream);
//     });
//     pc.ontrack = (event) => {
//       event.streams[0].getTracks((track) => {
//         remoteStream.addTrack(track);
//       });
//     };

//     pc.onicecandidate = (event) => {
//       if (event.candidate) {
//         socket.emit('candidate', {
//           roomId: currentRoom,
//           candidate: event.candidate,
//         });
//       }
//     };

//     const offer = await pc.createOffer();
//     await pc.setLocalDescription(offer);

//     pc.ontrack = (event) => {
//       const newStream = new MediaStream();
//       event.streams[0].getTracks().forEach((track) => {
//         newStream.addTrack(track);
//       });
//       setRemoteStream(newStream);
//     };

//     if (stream) socket.emit('offer', { roomId: currentRoom, offer });
//     else
//       toast({
//         title: 'Media not available',
//         description: 'A/V devices permission not available for call',
//       });
//     setVideoCallVisible(true);
//   };

//   // CREATE ANSWER IS USED FOR ANSWERING CALL
//   // const createAnswer = async () => {
//   //   const pc = new RTCPeerConnection(servers);
//   //   setPeerConnection(pc);
//   //   setLocalStream(await navigator.mediaDevices.getUserMedia(mediaConstraints));
//   //   localStream.getTrack.forEach((track) => {
//   //     pc.addTrack(track, localStream);
//   //   });
//   //   pc.ontrack = (event) => {
//   //     event.streams[0].getTracks((track) => {
//   //       remoteStream.addTrack(track);
//   //     });
//   //   };
//   //   const answer = await pc.createAnswer();
//   //   socket.emit('answer', answer);
//   // };
//   const endCall = () => {
//     const tracks = localStream?.getTracks();
//     tracks?.forEach(async (track) => {
//       track.stop();
//     });
//     // socket.emit('end:call', currentRoom)
//     setVideoCallVisible(false);
//     setPeerConnection(null);
//   };

//   const endChat = () => {
//     if (inCall) endCall();
//     setCurrentRoom(null);
//     setCreatedRoomString('');
//   };

//   const showVideoCall = (e) => {
//     setVideoCallVisible(true);
//   };

//   const createRoom = async () => {
//     if (socket) {
//       console.log('Room creation');
//       socket.emit('create');
//     } else {
//       toast({
//         title: 'Error connecting to servers',
//       });
//     }
//   };

//   const joinVoxelChat = () => {
//     if (socket && joinRoomString) {
//       socket.emit('join', { roomId: joinRoomString });
//     }
//   };

//   const joinRoomInputHandler = (e) => {
//     if (e) setJoinRoomString(e.target.value);
//   };

//   const clearPreviousRoom = () => {
//     setCurrentRoom('');
//     // setLocalStream(null);
//     setCreatedRoomString('');
//     setJoinRoomString('');
//   };

//   useEffect(() => {
//     if (!isLoggedIn) router.push('/');
//   }, [isLoggedIn]);

//   useEffect(() => {
//     if (socket) {
//       socket.on('room_created', async (data) => {
//         clearPreviousRoom();
//         setCurrentRoom(data.roomId);
//         setCreatedRoomString(data.roomId);
//         toast({
//           title: 'Voxel room created',
//           description:
//             'Ask them to join your voxel chat by copying the room id',
//         });
//       });

//       socket.on('joined', (data) => {
//         setCurrentRoom(data.message.data.roomId);
//         toast({
//           title: data.message.title,
//           description: data.message.description,
//         });
//       });

//       socket.on('error', async (data) => {});

//       socket.on('incoming:call', async (data) => {
//         const pc = new RTCPeerConnection();
//         const offer = data.offer;
//         const offerDescription = new RTCSessionDescription(offer);
//         // pc.setRemoteDescription
//         pc.ontrack = (event) => {
//           const newStream = new MediaStream();
//           event.streams[0].getTracks().forEach((track) => {
//             newStream.addTrack(track);
//           });
//           setRemoteStream(newStream);
//         };
//       });

//       socket.on('answer:call', async (data) => {
//         const stream = new MediaStream();
//         const answer = data.message.data.answer;
//         const answerDescription = new RTCSessionDescription(answer);
//         pc.setRemoteDescription(answerDescription);
//         toast({ title: 'Call connected' });
//         setRemoteStream(stream);
//       });

//       // socket.on('offer', async (data) => {
//       //   if (data.message.data.offer) {
//       //     const pc = new RTCPeerConnection();
//       //     setPeerConnection(data.message.data.socketId, pc);
//       //     await pc.setRemoteDescription(
//       //       new RTCSessionDescription(data.message.data.offer)
//       //     );
//       //     const answer = await pc.createAnswer();
//       //     await pc.setLocalDescription(answer);
//       //     socket.emit('answer', {
//       //       socketId: data.message.data.socketId,
//       //       answer,
//       //     });
//       //   }
//       // });
//       // socket.on('message')
//       // ADD MESSAGE FUNCTIONALITY
//       socket.on('error', (data) => {
//         console.log('error', data);
//         alert(`ERROR :  ${data.message.title}`);
//         toast({
//           title: data.message.title,
//           description: data.message.description,
//           variant: 'destructive',
//         });
//       });
//     }
//   }, [socket]);

//   return (
//     <>
//       {isLoggedIn && (
//         <>
//           <Nav />
//           <main className="flex flex-col md:flex-row justify-center md:mx-12 p-2 md:p-4 gap-4">
//             <div className="flex md:min-w-fit flex-col gap-2 col-span-1">
//               <Card>
//                 <CardHeader className="pb-4">
//                   <CardTitle>Have a Chat</CardTitle>
//                   <CardDescription>
//                     Creating a new chat takes a fluke!
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <Input
//                     className={`my-2 mt-0 ${createdRoomString ? 'hidden' : ''}`}
//                     ref={joinInputRef}
//                     onChange={joinRoomInputHandler}
//                   ></Input>
//                   <Input
//                     className={`my-2 mt-0 ${
//                       !createdRoomString ? 'hidden' : ''
//                     }`}
//                     readOnly
//                     value={createdRoomString}
//                   ></Input>
//                   <Button
//                     className="mt-2 w-full"
//                     disabled={currentRoom}
//                     onClick={joinVoxelChat}
//                   >
//                     Join
//                   </Button>
//                   <div className="flex gap-1 my-2 flex-col">
//                     <Button
//                       className="w-full"
//                       disabled={currentRoom}
//                       onClick={createRoom}
//                     >
//                       Create
//                     </Button>
//                     <Button
//                       className={`w-full ${createdRoomString ? '' : 'hidden'}`}
//                       onClick={copyToClipboard}
//                     >
//                       Copy
//                     </Button>
//                     <Button
//                       className={`${currentRoom && !inCall ? '' : 'hidden'}`}
//                       onClick={createOffer}
//                     >
//                       Call
//                     </Button>
//                     <Button
//                       className={`${currentRoom && inCall ? '' : 'hidden'}`}
//                       onClick={endCall}
//                     >
//                       End Call
//                     </Button>

//                     <Button
//                       className={`w-full hover:bg-accent-light-bright active:opacity-90 dark:bg-cyan-100 hover:dark:bg-cyan-200 duration-200 ${
//                         createdRoomString ? '' : 'hidden'
//                       }`}
//                       onClick={showVideoCall}
//                     >
//                       Go To Chat
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>
//             <Card className="grow w-full p-4 flex flex-col">
//               <SkeletonChats />
//               {/* TODO : Add no previous chats available or loading */}
//               {/* <div className="grid place-items-center h-full">
//                 <h2 className="text-xl font-bold">No Previous Chats Available</h2>
//               </div> */}
//             </Card>
//           </main>
//         </>
//       )}
//     </>
//   );
// }
