export default function VideoBox({ videoRef, ...props }) {
  return (
    <video
      className="h-1/2 min-w-1/2 grow max-w-full object-contain rounded-xl"
      ref={videoRef}
      autoPlay
      // playsInline
      props
    >
      Your browser does not support the video functionality!
    </video>
  );
}
