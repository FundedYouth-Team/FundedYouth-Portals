import { HeroBackground } from "./HeroBackground";
import { ReactNode } from "react";

interface HeroProps {
  youtubeVideoId?: string;
  mp4VideoFallback?: string;
  children?: ReactNode;
}

export function Hero({
  youtubeVideoId,
  mp4VideoFallback,
  children,
}: HeroProps) {
  return (
    <section className="relative h-[45vh] sm:h-[45vh] md:h-[50vh] lg:h-[75vh] w-full overflow-hidden">
      {/* Background video */}
      <HeroBackground
        youtubeVideoId={youtubeVideoId}
        mp4VideoFallback={mp4VideoFallback}
      />

      {/* Content container */}
      <div className="container relative mx-auto flex h-full flex-col items-center pt-20 px-4">
        {children}
      </div>
    </section>
  );
}
