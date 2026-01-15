import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play } from "lucide-react";

interface VideoCardProps {
  videoUrl: string;
  thumbnailUrl?: string;
  onPlayClick?: () => void;
  className?: string;
}

export function VideoCard({
  videoUrl,
  thumbnailUrl,
  onPlayClick,
  className = "",
}: VideoCardProps) {

  const getYouTubeVideoId = (url: string): string | null => {
    const standardMatch = url.match(/[?&]v=([^&]+)/);
    if (standardMatch) return standardMatch[1];

    const shortMatch = url.match(/youtu\.be\/([^?]+)/);
    if (shortMatch) return shortMatch[1];

    const embedMatch = url.match(/embed\/([^?]+)/);
    if (embedMatch) return embedMatch[1];

    return null;
  };

  const getThumbnailUrl = (): string => {
    if (thumbnailUrl) {
      return thumbnailUrl;
    }

    const videoId = getYouTubeVideoId(videoUrl);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    return "/placeholder-video.jpg";
  };

  const handlePlayClick = () => {
    if (onPlayClick) {
      onPlayClick();
    } else {
      window.open(videoUrl, "_blank");
    }
  };

  return (
    <Card className={`relative overflow-hidden rounded-lg shadow-2xl p-0 ${className}`}>
      <div className="relative aspect-video">
        <img
          src={getThumbnailUrl()}
          alt="Video thumbnail"
          className="h-full w-full object-cover"
          onError={(e) => {
            const videoId = getYouTubeVideoId(videoUrl);
            if (videoId && !thumbnailUrl) {
              e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
            }
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all hover:bg-black/20">
          <Button
            onClick={handlePlayClick}
            size="lg"
            className="gap-2 rounded-full bg-blue-600 px-6 py-6 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform"
            aria-label="Play video"
          >
            <Play className="h-5 w-5 fill-white" />
            Play video
          </Button>
        </div>
      </div>
    </Card>
  );
}
