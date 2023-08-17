export default function ChatScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h1>room id here</h1>
      {/* VIDEO GRID */}
      <div className="h-[80vh] grid auto-rows-max gap-0 px-2">
        <video controls className="">
          <source src="test.mp4" type="video/mp4" className="" />
          Your browser does not support the video functionality!
        </video>
        <video controls className="">
          <source src="test.mp4" type="video/mp4" />
          Your browser does not support the video functionality!
        </video>
        <video controls className="w-full">
          <source src="test.mp4" type="video/mp4" />
          Your browser does not support the video functionality!
        </video>
      </div>
    </div>
  );
}
