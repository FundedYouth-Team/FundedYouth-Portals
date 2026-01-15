import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Pathway {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Course {
  id: string;
  icon: string;
  pillColor: string;
  name: string;
  description: string;
  url: string;
  status: string;
  requirements: string[];
  classTime: string;
  pathway: string;
  price?: string;
  careerPath?: string;
  unlocks?: string[];
  details?: {
    learningPoints: string[];
    lessons: Array<{
      title: string;
      description: string;
      time: string;
      activities: Array<{
        type: string;
        title: string;
        time: string;
      }>;
    }>;
  };
}

interface CatalogData {
  pathways: Pathway[];
  courses: Course[];
}

const colorMap: Record<string, { bg: string; text: string; dot: string; border: string }> = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", border: "border-amber-200" },
  blue: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500", border: "border-blue-200" },
  purple: { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500", border: "border-purple-200" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500", border: "border-yellow-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-500", border: "border-orange-200" },
  green: { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", border: "border-green-200" },
  gray: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500", border: "border-gray-200" },
};

const activeColorMap: Record<string, string> = {
  blue: "bg-blue-600 text-white",
  purple: "bg-purple-600 text-white",
  yellow: "bg-yellow-500 text-white",
  orange: "bg-orange-500 text-white",
};

const inactiveColorMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
  orange: "bg-orange-100 text-orange-700 hover:bg-orange-200",
};

export function CatalogPage() {
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetch("/assets/data/catalog.json")
      .then((res) => res.json())
      .then((data: CatalogData) => {
        setCatalogData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch catalog:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading catalog...</p>
      </main>
    );
  }

  if (!catalogData) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load catalog.</p>
      </main>
    );
  }

  const { pathways, courses } = catalogData;

  // Group courses by pathway
  const coursesByPathway: Record<string, Course[]> = {};
  courses.forEach((course) => {
    if (!coursesByPathway[course.pathway]) {
      coursesByPathway[course.pathway] = [];
    }
    coursesByPathway[course.pathway].push(course);
  });

  // Build course map for requirement tracing
  const courseMap: Record<string, Course> = {};
  courses.forEach((course) => {
    courseMap[course.id] = course;
  });

  // Get all required courses (recursive)
  const getRequiredCourses = (courseId: string, visited: Set<string> = new Set()): string[] => {
    if (visited.has(courseId)) return [];
    visited.add(courseId);

    const course = courseMap[courseId];
    if (!course) return [];

    let required = [courseId];
    for (const reqId of course.requirements) {
      required = required.concat(getRequiredCourses(reqId, visited));
    }
    return required;
  };

  // Get visible course IDs based on filter
  const getVisibleCourseIds = (): Set<string> => {
    const visibleIds = new Set<string>();

    if (activeFilter === "all") {
      courses.forEach((course) => visibleIds.add(course.id));
    } else {
      // Always include foundation courses
      courses.filter((c) => c.pathway === "foundation").forEach((c) => visibleIds.add(c.id));

      // Get courses in selected pathway and their prerequisites
      courses
        .filter((c) => c.pathway === activeFilter)
        .forEach((course) => {
          const required = getRequiredCourses(course.id);
          required.forEach((id) => visibleIds.add(id));
        });
    }

    return visibleIds;
  };

  const visibleCourseIds = getVisibleCourseIds();

  // Determine which pathways have visible courses
  const visiblePathways = new Set<string>();
  visibleCourseIds.forEach((courseId) => {
    const course = courseMap[courseId];
    if (course) {
      visiblePathways.add(course.pathway);
    }
  });

  const getPathway = (id: string) => pathways.find((p) => p.id === id);

  const displayOrder = ["foundation", "3d-printing", "coding", "electronics", "3d-modeling"];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-slate-800">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-emerald-400 text-sm font-semibold tracking-wider uppercase mb-4">
            Learning Pathways
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Course Catalog
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Structured learning paths designed to take you from beginner to skilled maker. Start
            with our foundation course and unlock multiple specialized pathways.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold text-xl">1</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Complete Prerequisites</h3>
              <p className="text-gray-600 text-sm">
                Start with our required foundation course (3DP1) to unlock all learning pathways.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold text-xl">2</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Choose Your Pathway</h3>
              <p className="text-gray-600 text-sm">
                Select from 3D Printing, Coding, Electronics, or 3D Modeling pathways.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold text-xl">3</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Level Up</h3>
              <p className="text-gray-600 text-sm">
                Progress through courses to gain advanced skills and lab access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Pathways Section */}
      <section className="py-16 bg-white" id="pathways">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Learning Pathways</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              After completing the foundation course, choose your path. Each pathway builds
              progressively on previous courses.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                activeFilter === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Show All
            </button>
            {pathways
              .filter((p) => p.id !== "foundation")
              .map((pathway) => (
                <button
                  key={pathway.id}
                  onClick={() => setActiveFilter(pathway.id)}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                    activeFilter === pathway.id
                      ? activeColorMap[pathway.color] || "bg-gray-600 text-white"
                      : inactiveColorMap[pathway.color] ||
                        "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pathway.name}
                </button>
              ))}
          </div>

          {/* Course Cards Container */}
          <div className="space-y-4 max-w-3xl mx-auto">
            {displayOrder.map((pathwayId) => {
              if (!coursesByPathway[pathwayId]) return null;
              if (!visiblePathways.has(pathwayId)) return null;

              const pathway = getPathway(pathwayId);
              if (!pathway) return null;

              const colors = colorMap[pathway.color] || colorMap.gray;
              const pathwayCourses = coursesByPathway[pathwayId];

              return (
                <div key={pathwayId}>
                  {/* Pathway Header */}
                  <div className="pt-6 first:pt-0">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                      <h3 className="text-lg font-bold text-gray-900">{pathway.name} Pathway</h3>
                    </div>
                  </div>

                  {/* Course Cards */}
                  {pathwayCourses.map((course) => {
                    if (!visibleCourseIds.has(course.id)) return null;

                    const isComingSoon = course.status === "coming-soon";
                    const requirementsText =
                      course.requirements.length === 0 ? "None" : course.requirements.join(", ");
                    const pillColors = colorMap[course.pillColor] || colorMap[pathway.color];
                    const isFoundation = pathwayId === "foundation";

                    if (isFoundation) {
                      // Foundation Course: Orange Gradient Card
                      return (
                        <div key={course.id} className="mb-4">
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex flex-col md:flex-row md:items-start gap-4">
                              {/* Left side: Requirements */}
                              <div className="md:w-32 flex-shrink-0">
                                <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-1">
                                  Requirements
                                </p>
                                <p className="text-sm font-medium text-white">{requirementsText}</p>
                              </div>

                              {/* Main content */}
                              <div className="flex-grow">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5">
                                      {course.id}
                                    </span>
                                    <h4 className="text-lg font-bold text-white">{course.name}</h4>
                                  </div>
                                  <span className="bg-white text-amber-600 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                                    Available
                                  </span>
                                </div>

                                <p className="text-white/90 text-sm leading-relaxed mb-3">
                                  {course.description}
                                </p>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4 text-sm text-white/80">
                                    <span className="flex items-center gap-1">
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
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      {course.classTime}
                                    </span>
                                    {course.price && (
                                      <span className="bg-white text-amber-600 text-xs font-medium px-2 py-1 rounded">
                                        {course.price}
                                      </span>
                                    )}
                                  </div>
                                  <Link
                                    to={`/courses/${course.id}`}
                                    className="text-sm font-medium text-white hover:text-white/80 flex items-center gap-1"
                                  >
                                    View Details
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
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // Regular Course Card
                    return (
                      <div
                        key={course.id}
                        className={`mb-4 ${isComingSoon ? "opacity-70" : ""}`}
                      >
                        <div
                          className={`bg-white border ${
                            isComingSoon
                              ? "border-gray-200 bg-gray-50"
                              : "border-gray-200 hover:shadow-lg"
                          } rounded-xl p-5 transition-shadow`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start gap-4">
                            {/* Left side: Requirements */}
                            <div className="md:w-32 flex-shrink-0">
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                Requirements
                              </p>
                              <p className="text-sm font-medium text-gray-600">{requirementsText}</p>
                            </div>

                            {/* Main content */}
                            <div className="flex-grow">
                              <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="flex items-center gap-3">
                                  <span
                                    className={`${pillColors.bg} ${pillColors.text} text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5`}
                                  >
                                    {course.id}
                                  </span>
                                  <h4 className="text-lg font-bold text-gray-900">{course.name}</h4>
                                </div>
                                {isComingSoon ? (
                                  <span className="bg-yellow-100 text-yellow-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                                    Coming Soon
                                  </span>
                                ) : (
                                  <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap">
                                    Available
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                {course.description}
                              </p>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
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
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {course.classTime}
                                  </span>
                                  {course.careerPath && (
                                    <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded">
                                      {course.careerPath}
                                    </span>
                                  )}
                                </div>
                                {!isComingSoon && (
                                  <Link
                                    to={`/courses/${course.id}`}
                                    className={`text-sm font-medium ${colors.text} hover:underline flex items-center gap-1`}
                                  >
                                    View Details
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
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
