import { StyledVideoPlayer } from "./StyledVideoPlayer";

interface FeatureShowcaseProps {
  eyebrow?: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
  mediaType: "image" | "video";
  mediaSrc: string;
  videoThumbnail?: string;
  videoAutoPlayCount?: number;
  imagePosition?: "left" | "right";
  titleColor?: string;
  buttonColor?: string;
  backgroundColor?: string;
}

export function FeatureShowcase({
  eyebrow,
  title,
  description,
  buttonText,
  buttonHref,
  mediaType,
  mediaSrc,
  videoThumbnail,
  videoAutoPlayCount = 3,
  imagePosition = "right",
  titleColor = "text-blue-600",
  buttonColor = "bg-blue-600",
  backgroundColor = "bg-white",
}: FeatureShowcaseProps) {
  const contentOrder = imagePosition === "right" ? "order-2 md:order-1" : "order-2 md:order-2";
  const mediaOrder = imagePosition === "right" ? "order-1 md:order-2" : "order-1 md:order-1";

  const buttonHoverColor = buttonColor.replace("600", "700");

  return (
    <section className={`relative ${backgroundColor} py-16 px-6 sm:px-8 lg:px-12`}>
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Content Side */}
          <div className={`${contentOrder}`}>
            {eyebrow && (
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">
                {eyebrow}
              </p>
            )}

            <h2 className={`text-1xl sm:text-2xl lg:text-3xl font-bold ${titleColor} mb-4`}>
              {title}
            </h2>

            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {description}
            </p>


             <a href={buttonHref}
              className={`inline-block px-6 py-3 ${buttonColor} text-white font-semibold rounded-lg hover:${buttonHoverColor} transition-colors`}
            >
              {buttonText}
            </a>
          </div>

          {/* Media Side */}
          <div className={`${mediaOrder}`}>
            {mediaType === "video" ? (
              <StyledVideoPlayer
                src={mediaSrc}
                poster={videoThumbnail}
                autoPlayCount={videoAutoPlayCount}
              />
            ) : (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                <img
                  src={mediaSrc}
                  alt={title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
