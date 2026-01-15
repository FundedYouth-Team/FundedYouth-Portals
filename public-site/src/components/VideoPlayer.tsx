import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface VideoPlayerProps {
  videoUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export function VideoPlayer({ videoUrl, isOpen, onClose }: VideoPlayerProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Helper function to extract YouTube video ID
  const getYouTubeVideoId = (url: string): string | null => {
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) return standardMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return shortMatch[1];

    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  // Determine if this is a YouTube video
  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const isYouTube = !!youtubeVideoId;

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // Handle click outside video to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  // Don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-player-title"
    >
      <div className="relative w-full max-w-5xl animate-in zoom-in-95 duration-200">
        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute -top-12 right-0 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
          aria-label="Close video player"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Video container */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
          {isYouTube ? (
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`}
              title="Video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              className="h-full w-full"
              controls
              autoPlay
              src={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      </div>
    </div>
  );
}
