import { Button } from './ui/button';

export default function ChatScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-[100dvh] w-full absolute top-0 left-0 px-4 backdrop-blur-xl">
      <header className="flex w-full justify-between">
        <h1 className="py-2 font-semibold">room admin's rooms</h1>
        <p></p>
        <Button className="text-sm">Close</Button>
      </header>
      {/* VIDEO GRID */}
      <div className="h-[90dvh] w-full flex flex-wrap overflow-hidden justify-around outline-2 bg-opacity-70 bg-zinc-900  border-spacing-2 px-2 rounded-lg">
        <video className="h-1/2 min-w-1/2 grow max-w-full object-cover rounded-xl">
          <source src="test.mp4" type="video/mp4" className="relative" />
          Your browser does not support the video functionality!
        </video>
        <video className="h-1/2 min-w-1/2 grow max-w-full object-cover">
          <source src="test.mp4" type="video/mp4" />
          Your browser does not support the video functionality!
        </video>
      </div>
      <div className="fixed left-0 bottom-0 mb-8 flex justify-around w-full items-center">
        <Button>Leave</Button>
        <Button>Mute</Button>
        <Button>Video cut</Button>
      </div>
    </div>
  );
}
