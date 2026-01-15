interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  linkText: string;
  linkHref: string;
  maxDescriptionLength?: number;
}

export function FeatureCard({
  icon,
  title,
  description,
  linkText,
  linkHref,
  maxDescriptionLength = 115,
}: FeatureCardProps) {
  // Truncate description if it exceeds max length
  const truncatedDescription =
    description.length > maxDescriptionLength
      ? `${description.substring(0, maxDescriptionLength)}...`
      : description;

  return (
    <div className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Icon Container */}
      <div className="mb-6 w-48 h-48 flex items-center justify-center">
        {icon}
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 mb-6 leading-relaxed min-h-[4rem]">
        {truncatedDescription}
      </p>

      {/* Link */}
        <a href={linkHref}
        className="text-blue-600 font-semibold hover:text-blue-700 transition-colors inline-flex items-center gap-1">
        {linkText}
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </a>
    </div>
  );
}
