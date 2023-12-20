export default function VideoBox({ videoRef, muted, variant }) {
  if (variant === 'fullscreen') {
    return (
      <video
        className="h-full z-10 relative w-full object-cover rounded-xl"
        ref={videoRef}
        muted={muted}
        autoPlay
      >
        Your browser does not support the video functionality!
      </video>
    );
  } else if (variant === 'mini')
    return (
      <video
        className="aspect-square z-20 top-4 left-4 shadow-zinc-700 shadow-sm absolute h-1/5 object-cover rounded-xl"
        ref={videoRef}
        muted={muted}
        autoPlay
      >
        Your browser does not support the video functionality!
      </video>
    );
}
