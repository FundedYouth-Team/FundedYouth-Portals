interface TaglineBannerProps {
  backgroundImage?: string;
  overlayColor?: string;
  children: React.ReactNode;
}

export function TaglineBanner({
  backgroundImage,
  overlayColor = "rgba(37, 99, 235, 0.8)",
  children,
}: TaglineBannerProps) {
  return (
    <section className="relative w-full overflow-hidden">
      {backgroundImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        >
          <div
            className="absolute inset-0"
            style={{ backgroundColor: overlayColor }}
          />
        </div>
      ) : (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor }}
        />
      )}

      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center text-white">
          {children}
        </div>
      </div>
    </section>
  );
}
