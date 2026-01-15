import { useState } from "react";
import { Link } from "react-router-dom";
import { TaglineBanner } from "../components/TaglineBanner";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";

// Core values
const coreValues = [
  {
    title: "Innovation",
    description: "Embracing new technologies and creative approaches to education and manufacturing.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Accessibility",
    description: "Making STEM education and industrial tools available to everyone, regardless of background.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Community",
    description: "Building connections between students, educators, mentors, and local businesses.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Empowerment",
    description: "Giving youth the skills and confidence to become creators, not just consumers.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
      </svg>
    ),
  },
];

// Goals
const organizationalGoals = [
  {
    title: "Expand Access to STEM Education",
    description: "Partner with schools across the region to bring hands-on maker education to every student, regardless of their school's budget or resources.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    title: "Democratize On-Demand Manufacturing",
    description: "Make 3D printing, laser cutting, and rapid prototyping accessible to individuals, small businesses, and entrepreneurs in our community.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
    ),
  },
  {
    title: "Bring Manufacturing Home",
    description: "Revitalize local manufacturing by empowering community members with the skills and tools to create products locally.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: "Create a Replicable Model",
    description: "Develop a community makerspace model that can be replicated in other cities, spreading access to maker education nationwide.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Launch Youth Entrepreneurs",
    description: "Provide pathways for young makers to turn their creations into real businesses, from prototype to product.",
    icon: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
];



// Testimonials
const testimonials = [
  {
    quote: "FundedYouth transformed our classroom. Students who struggled with traditional learning are now leading 3D printing projects and mentoring their peers.",
    author: "Maria Rodriguez",
    role: "STEM Coordinator, Taft Middle School",
  },
  {
    quote: "The hands-on approach makes all the difference. My son went from being intimidated by technology to designing his own prototypes.",
    author: "James Chen",
    role: "Parent",
  },
  {
    quote: "Having a makerspace in our community means kids have access to tools they'd never see otherwise. It's changing what they believe is possible.",
    author: "Sarah Johnson",
    role: "Community Center Director",
  },
];

// Sponsors
const sponsors = [
  { name: "Local Business Partner 1", tier: "gold" },
  { name: "Community Foundation", tier: "gold" },
  { name: "Tech Company Sponsor", tier: "silver" },
  { name: "Education Grant Foundation", tier: "silver" },
  { name: "Small Business Supporter", tier: "bronze" },
  { name: "Family Foundation", tier: "bronze" },
];

// Board members
const boardMembers = [
  {
    name: "Board Member 1",
    role: "Founder & Executive Director",
    passion: "Passionate about making technology accessible to underserved communities and inspiring the next generation of innovators.",
    expertise: ["STEM Education", "3D Printing", "Community Development"],
  },
  {
    name: "Board Member 2",
    role: "Director of Education",
    passion: "Dedicated to transforming how students learn by bringing hands-on, project-based learning into every classroom.",
    expertise: ["Curriculum Development", "Teacher Training", "EdTech"],
  },
  {
    name: "Board Member 3",
    role: "Director of Operations",
    passion: "Believes in the power of makerspaces to build confidence and real-world skills in young people.",
    expertise: ["Operations", "Manufacturing", "Program Management"],
  },
  {
    name: "Board Member 4",
    role: "Community Outreach Director",
    passion: "Committed to building bridges between schools, businesses, and families to create lasting community impact.",
    expertise: ["Partnerships", "Fundraising", "Volunteer Management"],
  },
];

// Before/After impact images
const impactImages = [
  {
    before: "/assets/images/impact/PreOculusQuestNASASimulation.jpg",
    after: "/assets/images/impact/OculusQuestNASASimulation.png",
    beforeLabel: "Before",
    afterLabel: "After",
    title: "Classroom Transformation",
  },
  {
    before: "/assets/images/impact/PreTaftMiddleSchool.jpg",
    after: "/assets/images/impact/TaftMiddleSchool.png",
    beforeLabel: "Learning",
    afterLabel: "Creating",
    title: "Student Growth",
  },
];

export function ImpactPage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % impactImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + impactImages.length) % impactImages.length);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/classroom-tutoring-v1.png')" }}
        />
        <div className="absolute inset-0 bg-blue-600/85" />

        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-blue-200 font-semibold uppercase tracking-wide mb-4">
            Who We Are & What We Do
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Our Mission & Impact
          </h1>
          <p className="text-xl text-blue-100 leading-relaxed mb-8 max-w-3xl mx-auto">
            A 501(c)(3) nonprofit empowering youth with access to industrial manufacturing tools, STEAM education, and the skills to become tomorrow's creators and innovators.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            EIN: 93-4090260
          </div>
        </div>
      </section>

      {/* Impact Statistics */}
      {/* <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
              By the Numbers
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Measurable Impact
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Every number represents real students, real skills, and real opportunities created in our community.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  {stat.label}
                </div>
                <p className="text-sm text-gray-500">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Mission Statement */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
              Our Mission
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
              Why We Exist
            </h2>
          </div>

          <blockquote className="relative bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-8 lg:p-12">
            <span className="absolute top-4 left-6 text-6xl text-indigo-200 font-serif leading-none">"</span>
            <p className="text-xl lg:text-2xl text-gray-800 text-center leading-relaxed italic px-8">
              Our mission at FundedYouth is to solve for limited resources in education by empowering our youth with access to industrial manufacturing tools, STEAM educational services, and on-demand manufacturing certification programs.
            </p>
            <span className="absolute bottom-4 right-6 text-6xl text-indigo-200 font-serif leading-none">"</span>
          </blockquote>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              We believe that every young person deserves access to the tools and skills that will shape the future. By bridging the gap between classroom learning and real-world manufacturing, we're preparing the next generation to become creators, innovators, and problem-solvers.
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide mb-2">
              What Drives Us
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Our Core Values
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((value) => (
              <div key={value.title} className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                  {value.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tagline Banner */}
      <TaglineBanner
        backgroundImage="/assets/images/tagline-bg-3dprinting.png"
        overlayColor="rgba(37, 99, 235, 0.85)"
      >
        <p className="text-2xl sm:text-3xl leading-tight">
          Every student deserves access to the <span className="font-bold">tools and skills</span> that will shape their future.
        </p>
      </TaglineBanner>

      {/* School Partnerships */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-teal-600 uppercase tracking-wide mb-2">
              School Partnerships
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Transforming Local Education
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Drag the slider to see the transformation our programs create in classrooms and communities.
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative">
            {/* Previous Arrow */}
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-colors -ml-6 lg:-ml-8"
              aria-label="Previous slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next Arrow */}
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 hover:bg-white rounded-full shadow-lg flex items-center justify-center text-gray-700 hover:text-teal-600 transition-colors -mr-6 lg:-mr-8"
              aria-label="Next slide"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Slider Card */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg">
              <BeforeAfterSlider
                beforeImage={impactImages[currentSlide].before}
                afterImage={impactImages[currentSlide].after}
                beforeLabel={impactImages[currentSlide].beforeLabel}
                afterLabel={impactImages[currentSlide].afterLabel}
                className="aspect-[16/9] md:aspect-[21/9]"
              />
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-center text-xl">
                  {impactImages[currentSlide].title}
                </h3>
              </div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-6">
              {impactImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? "bg-teal-600"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Goals */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Our Goals
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              What We're Working Toward
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These ambitious goals guide everything we do at FundedYouth.
            </p>
          </div>

          <div className="space-y-6">
            {organizationalGoals.map((goal, index) => (
              <div key={goal.title} className="flex gap-6 items-start bg-gray-50 rounded-xl p-6 lg:p-8">
                <div className="flex-shrink-0 w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-blue-600">Goal {index + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{goal.title}</h3>
                  <p className="text-gray-600">{goal.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision for Communities */}
      <section className="bg-gradient-to-br from-teal-600 to-teal-800 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <p className="text-teal-200 font-semibold uppercase tracking-wide mb-4">
                Our Vision
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                For Our Local Community
              </h2>
              <p className="text-lg text-teal-100 leading-relaxed mb-6">
                We envision a San Diego where every neighborhood has access to maker education. Where students from all backgrounds can walk into a makerspace after school, learn to design and 3D print, and discover their potential as creators.
              </p>
              <ul className="space-y-4">
                {[
                  "Partner with every school district in the region",
                  "Open satellite makerspaces in underserved communities",
                  "Provide free after-school programs for low-income families",
                  "Connect local businesses with young talent",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-teal-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-teal-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="text-white">
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                For All Communities
              </h2>
              <p className="text-lg text-teal-100 leading-relaxed mb-6">
                Our vision extends beyond San Diego. We're building a model that can be replicated anywhere—a blueprint for community makerspaces that empower youth and revitalize local manufacturing.
              </p>
              <ul className="space-y-4">
                {[
                  "Create open-source curriculum for maker education",
                  "Share our operational model with communities nationwide",
                  "Build a network of FundedYouth-inspired makerspaces",
                  "Advocate for maker education in public policy",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-teal-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-teal-50">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Storefront & Community Impact */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">
                Community Hub
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Our Storefront Impact
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Our retail location isn't just a store—it's a community makerspace where anyone can learn, create, and innovate. From weekend workshops to after-school programs, we're making STEAM education accessible to everyone.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Open Makerspace Hours</h3>
                    <p className="text-gray-600">Free access for members to work on projects with professional-grade equipment.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Weekend Workshops</h3>
                    <p className="text-gray-600">Family-friendly classes that bring parents and kids together to learn new skills.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Robotics Team Support</h3>
                    <p className="text-gray-600">Home base for local FIRST Tech Challenge teams like Rusteze Robotics.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/assets/images/storefront-back-with-people.png"
                  alt="Rusteze Robotics team at FundedYouth makerspace"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Community First</p>
                    <p className="text-sm text-gray-500">Building futures together</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* On-Demand Manufacturing */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-xl overflow-hidden shadow-xl">
                <img
                  src="/assets/images/impact/CampusLabConcept.png"
                  alt="3D Print Lab concept"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Made Locally</p>
                    <p className="text-sm text-gray-500">On-demand production</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">
                Our Belief
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Bringing On-Demand Manufacturing Home
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                For too long, manufacturing has been outsourced overseas, taking jobs and opportunities away from our communities. We believe it's time to bring manufacturing back—and on-demand technology makes it possible.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With 3D printing, laser cutting, and rapid prototyping, anyone can go from idea to product without massive factory investments. We're training the next generation to lead this manufacturing revolution.
              </p>

              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Rapid Prototyping</h3>
                    <p className="text-sm text-gray-600">Turn ideas into physical prototypes in hours, not weeks.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Local Production</h3>
                    <p className="text-sm text-gray-600">Create products right here in our community, for our community.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Economic Opportunity</h3>
                    <p className="text-sm text-gray-600">Empower entrepreneurs and small businesses to compete.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tagline Banner 2 */}
      <TaglineBanner
        backgroundImage="/assets/images/tagline-bg-soldering.png"
        overlayColor="rgba(0, 150, 137, 0.85)"
      >
        <p className="text-2xl sm:text-3xl leading-tight italic">
          The future of manufacturing is <span className="font-bold">local, accessible, and youth-driven.</span>
        </p>
      </TaglineBanner>

      {/* Testimonials */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Voices from Our Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from the teachers, parents, and community leaders who have seen FundedYouth's impact firsthand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-8">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                <blockquote className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Board Members */}
      <section className="bg-gray-50 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-purple-600 uppercase tracking-wide mb-2">
              Our Leadership
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Board
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Passionate leaders dedicated to empowering youth through maker education and on-demand manufacturing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {boardMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-purple-600 font-medium mb-4">{member.role}</p>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{member.passion}</p>
                    <div className="flex flex-wrap gap-2">
                      {member.expertise.map((skill) => (
                        <span key={skill} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-2">
              Our Supporters
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Thank You to Our Sponsors
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our mission is made possible by the generous support of these organizations and individuals.
            </p>
          </div>

          {/* Gold Sponsors */}
          <div className="mb-12">
            <h3 className="text-center text-sm font-semibold text-yellow-600 uppercase tracking-wide mb-6">
              Gold Partners
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {sponsors.filter(s => s.tier === "gold").map((sponsor) => (
                <div key={sponsor.name} className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  </div>
                  <p className="font-bold text-gray-900">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Silver Sponsors */}
          <div className="mb-12">
            <h3 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
              Silver Partners
            </h3>
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
              {sponsors.filter(s => s.tier === "silver").map((sponsor) => (
                <div key={sponsor.name} className="bg-gray-100 border border-gray-200 rounded-lg p-6 text-center">
                  <p className="font-semibold text-gray-700">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bronze Sponsors */}
          <div>
            <h3 className="text-center text-sm font-semibold text-amber-700 uppercase tracking-wide mb-6">
              Bronze Partners
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {sponsors.filter(s => s.tier === "bronze").map((sponsor) => (
                <div key={sponsor.name} className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-center">
                  <p className="text-sm font-medium text-gray-600">{sponsor.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-16">
            <p className="text-gray-600 mb-4">Interested in supporting our mission?</p>
            <Link
              to="/sponsor"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
              Become a Sponsor
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Join Our Mission
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you want to volunteer, donate, partner with us, or bring FundedYouth to your community—we'd love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/volunteer"
              className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              Get Involved
            </Link>
            <Link
              to="/donate"
              className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Donate
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>info@fundedyouth.org</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Parkway Plaza, San Diego</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
