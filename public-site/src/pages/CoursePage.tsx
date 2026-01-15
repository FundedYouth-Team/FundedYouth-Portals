import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

interface Pathway {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Activity {
  type: string;
  title: string;
  time: string;
}

interface Lesson {
  title: string;
  description: string;
  time: string;
  activities: Activity[];
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
    lessons: Lesson[];
  };
}

interface CatalogData {
  pathways: Pathway[];
  courses: Course[];
}

const colorMap: Record<string, { bg: string; light: string; text: string; border: string }> = {
  amber: { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-700", border: "border-amber-500" },
  blue: { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-700", border: "border-blue-500" },
  purple: { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-700", border: "border-purple-500" },
  yellow: { bg: "bg-yellow-500", light: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-500" },
  orange: { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-700", border: "border-orange-500" },
};

export function CoursePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [catalogData, setCatalogData] = useState<CatalogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading course...</p>
      </div>
    );
  }

  if (!catalogData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Failed to load course data.</p>
      </div>
    );
  }

  const { pathways, courses } = catalogData;

  // Find selected course
  const selectedCourse = courses.find((c) => c.id === courseId) || courses[0];
  const selectedPathway = pathways.find((p) => p.id === selectedCourse.pathway);

  // Group courses by pathway
  const coursesByPathway: Record<string, Course[]> = {};
  courses.forEach((course) => {
    if (!coursesByPathway[course.pathway]) {
      coursesByPathway[course.pathway] = [];
    }
    coursesByPathway[course.pathway].push(course);
  });

  const getPathway = (id: string) => pathways.find((p) => p.id === id);
  const getCourse = (id: string) => courses.find((c) => c.id === id);

  const pathwayColors = colorMap[selectedPathway?.color || "blue"] || colorMap.blue;
  const pillColor = colorMap[selectedCourse.pillColor || selectedPathway?.color || "blue"] || colorMap.blue;

  const displayOrder = ["foundation", "3d-printing", "coding", "electronics", "3d-modeling"];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/catalog" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FY</span>
            </div>
            <span className="font-bold text-gray-900">Course Docs</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-72 h-screen bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-gray-200">
            <Link to="/catalog" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">FY</span>
              </div>
              <span className="font-bold text-gray-900">Course Documentation</span>
            </Link>
          </div>

          {/* Mobile close button area */}
          <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-gray-200">
            <span className="font-bold text-gray-900">Courses</span>
            <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-gray-100">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 sidebar-scroll">
            {displayOrder.map((pathwayId) => {
              if (!coursesByPathway[pathwayId]) return null;
              const pathway = getPathway(pathwayId);
              if (!pathway) return null;
              const colors = colorMap[pathway.color] || colorMap.blue;

              return (
                <div key={pathwayId} className="mb-6">
                  <div className="flex items-center gap-2 px-3 mb-2">
                    <div className={`w-2 h-2 rounded-full ${colors.bg}`}></div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {pathway.name}
                    </h3>
                  </div>
                  <ul className="space-y-1">
                    {coursesByPathway[pathwayId].map((course) => {
                      const isActive = course.id === selectedCourse.id;
                      const isComingSoon = course.status === "coming-soon";

                      return (
                        <li key={course.id}>
                          <Link
                            to={`/courses/${course.id}`}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isActive
                                ? `${colors.light} ${colors.text} font-medium`
                                : "text-gray-700 hover:bg-gray-100"
                            } ${isComingSoon ? "opacity-60" : ""}`}
                          >
                            <span className={`font-mono text-xs ${isActive ? colors.text : "text-gray-400"}`}>
                              {course.id}
                            </span>
                            <span className="truncate">{course.name}</span>
                            {isComingSoon && (
                              <span className="ml-auto text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                                Soon
                              </span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            {/* Back to Catalog Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                to="/catalog"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Catalog
              </Link>
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Home
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link to="/catalog" className="hover:text-gray-700">
              Courses
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={pathwayColors.text}>{selectedPathway?.name}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-900 font-medium">{selectedCourse.id}</span>
          </nav>

          {/* Course Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`${pillColor.light} ${pillColor.text} text-sm font-bold px-3 py-1.5 rounded-full`}>
                {selectedCourse.id}
              </span>
              {selectedCourse.status === "coming-soon" ? (
                <span className="bg-yellow-100 text-yellow-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  Coming Soon
                </span>
              ) : (
                <span className="bg-emerald-100 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full">
                  Available
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{selectedCourse.name}</h1>
            <p className="text-lg text-gray-600 leading-relaxed">{selectedCourse.description}</p>
          </header>

          {/* Course Details Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Duration */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                  <p className="font-semibold text-gray-900">{selectedCourse.classTime}</p>
                </div>
              </div>
            </div>

            {/* Pathway */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 ${pathwayColors.light} rounded-lg flex items-center justify-center`}>
                  <div className={`w-3 h-3 ${pathwayColors.bg} rounded-full`}></div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Pathway</p>
                  <p className={`font-semibold ${pathwayColors.text}`}>{selectedPathway?.name}</p>
                </div>
              </div>
            </div>

            {/* Price (if available) */}
            {selectedCourse.price && (
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Price</p>
                    <p className="font-semibold text-gray-900">{selectedCourse.price}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Requirements Section */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
            {selectedCourse.requirements.length === 0 ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-emerald-600 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="font-medium text-emerald-800">No prerequisites required</p>
                    <p className="text-sm text-emerald-700 mt-1">
                      This is a foundation course open to all students.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-sm text-gray-600 mb-4">
                  You must complete the following courses before enrolling:
                </p>
                <div className="space-y-3">
                  {selectedCourse.requirements.map((reqId) => {
                    const reqCourse = getCourse(reqId);
                    if (!reqCourse) return null;
                    const reqPathway = getPathway(reqCourse.pathway);
                    const reqColors = colorMap[reqCourse.pillColor || reqPathway?.color || "blue"] || colorMap.blue;

                    return (
                      <Link
                        key={reqId}
                        to={`/courses/${reqId}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                      >
                        <span className={`${reqColors.light} ${reqColors.text} text-xs font-bold px-2 py-1 rounded`}>
                          {reqId}
                        </span>
                        <span className="text-gray-900 font-medium">{reqCourse.name}</span>
                        <svg
                          className="w-4 h-4 text-gray-400 ml-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* Unlocks Section (if available) */}
          {selectedCourse.unlocks && selectedCourse.unlocks.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What This Course Unlocks</h2>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100 rounded-xl p-5">
                <ul className="space-y-3">
                  {selectedCourse.unlocks.map((unlock, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">{unlock}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* What You'll Learn (if available) */}
          {selectedCourse.details?.learningPoints && selectedCourse.details.learningPoints.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">What You'll Learn</h2>
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <ul className="grid sm:grid-cols-2 gap-3">
                  {selectedCourse.details.learningPoints.map((point, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* Course Curriculum (if available) */}
          {selectedCourse.details?.lessons && selectedCourse.details.lessons.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
              <div className="space-y-4">
                {selectedCourse.details.lessons.map((lesson, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    {/* Lesson Header */}
                    <div className="p-5 border-b border-gray-100">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 ${pillColor.light} rounded-lg flex items-center justify-center flex-shrink-0`}
                          >
                            <span className={`${pillColor.text} font-bold text-sm`}>{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-gray-600 text-sm mt-1">{lesson.description}</p>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 whitespace-nowrap flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {lesson.time}
                        </span>
                      </div>
                    </div>

                    {/* Activities */}
                    {lesson.activities && lesson.activities.length > 0 && (
                      <div className="px-5 py-3 bg-gray-50">
                        <div className="flex flex-wrap gap-2">
                          {lesson.activities.map((activity, actIndex) => (
                            <div
                              key={actIndex}
                              className={`inline-flex items-center gap-2 text-sm ${
                                activity.type === "quiz"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-amber-100 text-amber-700"
                              } px-3 py-1.5 rounded-full`}
                            >
                              {activity.type === "quiz" ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                  />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                  />
                                </svg>
                              )}
                              <span className="font-medium">{activity.title}</span>
                              <span className="text-xs opacity-75">{activity.time}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Career Path (if available) */}
          {selectedCourse.careerPath && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Career Path</h2>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-indigo-900">{selectedCourse.careerPath}</p>
                    <p className="text-sm text-indigo-700 mt-1">
                      This course helps prepare you for a career in this field.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* CTA Section */}
          {selectedCourse.status !== "coming-soon" ? (
            <section className="bg-gray-900 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-3">Ready to Get Started?</h2>
              <p className="text-gray-400 mb-6">Check our upcoming classes and reserve your spot today.</p>
              <Link
                to="/classes"
                className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                View Upcoming Classes
              </Link>
            </section>
          ) : (
            <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
              <h2 className="text-2xl font-bold text-yellow-800 mb-3">Coming Soon</h2>
              <p className="text-yellow-700 mb-6">
                This course is currently in development. Check back soon for updates!
              </p>
              <Link
                to="/volunteer"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get Notified
              </Link>
            </section>
          )}
        </div>
      </main>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 2px;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
