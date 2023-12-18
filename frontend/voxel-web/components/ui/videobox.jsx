export default function VideoBox({ videoRef, muted }) {
  return (
    <video
      className="h-1/2 min-w-1/2 grow max-w-full object-contain rounded-xl"
      ref={videoRef}
      muted={muted}
      autoPlay
    >
      Your browser does not support the video functionality!
    </video>
  );
}
