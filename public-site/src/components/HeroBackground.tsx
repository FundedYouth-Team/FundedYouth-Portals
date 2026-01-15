import { useState } from "react";

interface HeroBackgroundProps {
  youtubeVideoId?: string;
  mp4VideoFallback?: string;
}

export function HeroBackground({
  youtubeVideoId,
  mp4VideoFallback,
}: HeroBackgroundProps) {
  const [youtubeError, setYoutubeError] = useState(false);

  const useYouTube = youtubeVideoId && !youtubeError;

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-black">
      {useYouTube ? (
        <iframe
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-[177.78vh] h-[56.25vw] -translate-x-1/2 -translate-y-1/2"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1&loop=1&playlist=${youtubeVideoId}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&disablekb=1&iv_load_policy=3`}
          title="Background video"
          allow="autoplay; encrypted-media"
          onError={() => setYoutubeError(true)}
          style={{ pointerEvents: "none" }}
        />
      ) : mp4VideoFallback ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
        >
          <source src={mp4VideoFallback} type="video/mp4" />
        </video>
      ) : null}

      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/40" />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
    </div>
  );
}
