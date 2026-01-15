import { useState, ReactNode } from "react";
import { Hero } from "./Hero";
import { VideoCard } from "./VideoCard";
import { VideoPlayer } from "./VideoPlayer";

interface HeroWithFloatingVideoProps {
  youtubeVideoId?: string;
  mp4VideoFallback?: string;
  floatingVideoUrl?: string;
  videoThumbnailUrl?: string;
  children?: ReactNode;
}

export function HeroWithFloatingVideo({
  youtubeVideoId,
  mp4VideoFallback,
  floatingVideoUrl,
  videoThumbnailUrl,
  children,
}: HeroWithFloatingVideoProps) {
  const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

  return (
    <>
      {/* Desktop: Relative positioning for overlap */}
      {/* Mobile/Tablet: Normal flex stack */}
      <div className="lg:relative">
        <Hero
          youtubeVideoId={youtubeVideoId}
          mp4VideoFallback={mp4VideoFallback}
        >
          {children}
        </Hero>

        {/* Floating Video Card */}
        {floatingVideoUrl && (
          <>
            {/* Mobile/Tablet: Full width, no rounded corners, stacked */}
            <div className="lg:hidden">
              <VideoCard
                videoUrl={floatingVideoUrl}
                thumbnailUrl={videoThumbnailUrl}
                onPlayClick={() => setIsVideoPlayerOpen(true)}
                className="rounded-none"
              />
            </div>

            {/* Desktop: Centered, rounded, overlapping */}
            <div className="hidden lg:block absolute left-1/2 bottom-0 z-20 w-full max-w-3xl -translate-x-1/2 translate-y-2/3 px-4">
              <VideoCard
                videoUrl={floatingVideoUrl}
                thumbnailUrl={videoThumbnailUrl}
                onPlayClick={() => setIsVideoPlayerOpen(true)}
                className="transform transition-transform hover:scale-[1.02]"
              />
            </div>
          </>
        )}
      </div>

      {/* Video Player Modal */}
      {floatingVideoUrl && (
        <VideoPlayer
          videoUrl={floatingVideoUrl}
          isOpen={isVideoPlayerOpen}
          onClose={() => setIsVideoPlayerOpen(false)}
        />
      )}
    </>
  );
}
