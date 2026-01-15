import { Link } from "react-router-dom";

export function AdventuresPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/rusteze-robotics-2025-26.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Light Red Overlay */}
        <div className="absolute inset-0 bg-purple-600/80"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" />
            </svg>
            Teams, Clubs & Competitions
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
            Adventures at
            <br />
            <span className="text-orange-300">FundedYouth</span>
          </h1>

          <p className="text-purple-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Join our community teams and clubs for hands-on projects, national
            competitions, and unforgettable experiences. From robotics to
            rocketry, there's an adventure waiting for you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#adventures"
              className="inline-block bg-white hover:bg-gray-100 text-purple-700 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Explore Adventures
            </a>
            <Link
              to="/volunteer"
              className="inline-block border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Become a Mentor
            </Link>
          </div>
        </div>
      </section>

      {/* Why Join an Adventure Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join an Adventure?
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our programs provide more than just activities—they build skills,
              confidence, and community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Hands-On Experience */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Hands-On Experience
              </h3>
              <p className="text-gray-600 text-sm">
                Build real projects with professional-grade tools and equipment.
              </p>
            </div>

            {/* Team Collaboration */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Team Collaboration
              </h3>
              <p className="text-gray-600 text-sm">
                Work alongside peers and mentors who share your passion for
                making.
              </p>
            </div>

            {/* Competition Ready */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Competition Ready</h3>
              <p className="text-gray-600 text-sm">
                Prepare for regional and national challenges with expert
                guidance.
              </p>
            </div>

            {/* Year-Round Support */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Year-Round Support
              </h3>
              <p className="text-gray-600 text-sm">
                Access our makerspace throughout the season for building and
                testing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Adventures Section */}
      <section id="adventures" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-purple-600 font-semibold text-sm tracking-wider uppercase mb-2">
              Current Programs
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Our Adventures
            </h2>
          </div>

          {/* FIRST Tech Challenge */}
          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full z-10">
                Robotics
              </span>
              <img
                src="/assets/images/rusteze-robotics-2025-26.png"
                alt="Rusteze Robotics FIRST Tech Challenge team"
                className="w-full h-auto object-cover"
              />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase mb-2">
                FIRST Inspires
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-red-500 mb-4">
                FIRST Tech Challenge
              </h3>
              <img
                src="/assets/images/FIRST_Horz_RGB.png"
                alt="FIRST Logo"
                className="h-8 w-auto mb-4"
              />
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                FundedYouth is a proud supporter of the FIRST® Tech Challenge,
                providing hands-on support to teams like Rusteze Robotics. Our
                community makerspace offers a collaborative environment with 3D
                printing, computers, and fabrication tools, giving teams
                everything they need to design, build, and compete at the
                highest level.
              </p>
              <a
                href="https://www.firstinspires.org/robotics/ftc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-red-500 font-semibold hover:text-red-600 transition-colors"
              >
                Learn about FIRST
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
          </div>

          {/* NASA Student Launch */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative rounded-2xl overflow-hidden shadow-lg md:order-2">
              <span className="absolute top-4 left-4 bg-yellow-500 text-gray-900 text-xs font-semibold px-3 py-1 rounded-full z-10">
                Rocketry
              </span>
              <img
                src="/assets/images/stem-classroom-v2.png"
                alt="NASA Student Launch team"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="md:order-1">
              <p className="text-gray-500 text-sm font-semibold tracking-wider uppercase mb-2">
                NASA Partnership
              </p>
              <h3 className="text-2xl md:text-3xl font-bold text-blue-600 mb-4">
                NASA Student Launch
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Our team works on-site at FundedYouth to design, build, and test
                high-powered rockets for NASA's Student Launch challenge. This
                9-month program tasks student teams to create rockets carrying
                scientific or engineering payloads, culminating in a final
                launch event at NASA's Marshall Space Flight Center in
                Huntsville, Alabama. Students progress through NASA's
                engineering lifecycle with design reviews mirroring real
                aerospace projects.
              </p>
              <a
                href="https://www.nasa.gov/learning-resources/nasa-student-launch/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                Explore NASA Student Launch
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
          </div>
        </div>
      </section>

      {/* More Adventures Coming Soon */}
      <section className="py-16 bg-purple-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <svg
              className="w-8 h-8 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            More Adventures Coming Soon
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            We're always adding new programs, clubs, and competition teams. Have
            an idea for an adventure? Want to start a team at FundedYouth?
          </p>
          <a
            href="mailto:adventures@fundedyouth.org"
            className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Get in Touch
          </a>
        </div>
      </section>

      {/* Inspirational Quote Banner */}
      <section className="relative py-16 bg-gradient-to-r from-purple-600 to-blue-600 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <p className="text-white text-xl md:text-2xl lg:text-3xl font-medium leading-relaxed">
            Every great innovation starts with a <strong>team</strong>, a{" "}
            <strong>challenge</strong>, and the courage to{" "}
            <strong>build something new</strong>.
          </p>
        </div>
      </section>

      {/* Ready to Start CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Whether you want to join an existing team, start a new club, or
            mentor the next generation of makers—we'd love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <a
              href="mailto:adventures@fundedyouth.org"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Join a Team
            </a>
            <Link
              to="/"
              className="inline-block border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Learn About Our Mission
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-gray-600">
            <a
              href="mailto:adventures@fundedyouth.org"
              className="inline-flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              adventures@fundedyouth.org
            </a>
            <a
              href="https://www.instagram.com/fundedyouth/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-pink-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @fundedyouth
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
