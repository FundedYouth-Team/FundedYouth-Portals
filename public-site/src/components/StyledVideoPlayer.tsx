import { useState, useRef, useEffect } from "react";

interface StyledVideoPlayerProps {
  src: string;
  poster?: string;
  autoPlayCount?: number;
  className?: string;
}

export function StyledVideoPlayer({
  src,
  poster,
  autoPlayCount = 3,
  className = "",
}: StyledVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playCount, setPlayCount] = useState(0);

  // Handle video ended event for looping
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setPlayCount((prev) => {
        const newCount = prev + 1;
        if (newCount < autoPlayCount) {
          video.play().catch(console.error);
        }
        return newCount;
      });
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [autoPlayCount]);

  // Autoplay on mount when component becomes visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video || autoPlayCount <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && playCount === 0 && video.paused) {
            video.play().catch(console.error);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [autoPlayCount, playCount]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((error) => {
        console.error("Video play failed:", error);
      });
    } else {
      video.pause();
    }
  };

  return (
    <div className={`relative aspect-video rounded-lg overflow-hidden bg-gray-100 group ${className}`}>
      {/* Thumbnail Overlay - shown when paused */}
      {!isPlaying && poster && (
        <img
          src={poster}
          alt="Video thumbnail"
          className="absolute inset-0 w-full h-full object-cover z-10"
        />
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        playsInline
        muted
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Play/Pause Button Overlay */}
      <button
        onClick={togglePlayPause}
        className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white/90 hover:bg-white border-2 border-gray-300 flex items-center justify-center shadow-lg transition-all hover:scale-110 cursor-pointer z-20"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? (
          // Pause Icon
          <svg
            className="w-6 h-6 text-gray-800"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          // Play Icon - Larger and shifted left for centering
          <svg
            className="w-8 h-8 text-gray-800 ml-0.5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
