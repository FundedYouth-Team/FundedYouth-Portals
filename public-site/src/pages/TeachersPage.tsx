export function TeachersPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-emerald-500"></div>
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
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
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            For Schools & Educators
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Private Instruction &<br />
            <span className="text-yellow-300">Professional Development</span>
          </h1>

          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            FundedYouth provides high-quality STEM instructional programs for
            students, along with professional development for your teaching
            staff.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://maps.app.goo.gl/AJQpxEv1KR9XL4vD7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-blue-600 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Visit Us
            </a>
          </div>
        </div>
      </section>

      {/* Two Options Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm tracking-wider uppercase mb-2">
              Flexible Options
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Two Ways to Partner With Us
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We offer flexible options tailored to your school&apos;s needs,
              whether you bring students to us or we come to you.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Option 1 */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-blue-200 transition-colors">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Option 1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Students Come to FundedYouth
              </h3>
              <p className="text-gray-500 text-sm mb-4">Instruction Only</p>
              <p className="text-gray-600 mb-6">
                Bring your students to our fully-equipped makerspace facility
                for hands-on STEM instruction in a professional learning
                environment.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Onsite classroom accommodates up to 10 students
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Courses range from 5 to 20 hours
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Access to professional-grade equipment and tools
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Ideal for smaller groups and field trip experiences
                  </span>
                </li>
              </ul>
            </div>

            {/* Option 2 */}
            <div className="bg-gray-50 rounded-2xl p-8 border-2 border-gray-100 hover:border-emerald-200 transition-colors">
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
                <svg
                  className="w-7 h-7 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <div className="inline-block bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                Option 2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                We Come to Your School
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                Instruction + Professional Development
              </p>
              <p className="text-gray-600 mb-6">
                Our instructors travel to your school for onsite instruction,
                plus professional development to build your staff&apos;s
                long-term teaching capacity.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Onsite instruction for classes of 10-20 students
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Two-week professional development for your instructors
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Curriculum modeling, live coaching, and Q&A sessions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Builds long-term teaching capacity for your staff
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-600">
                    Available as an ongoing service—let our instructors teach
                    regularly at your school
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Optional Add-Ons */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Optional Add-Ons
            </h2>
            <p className="text-gray-600">
              Enhance your program with additional resources and support.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
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
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Curriculum License
              </h3>
              <p className="text-gray-600 text-sm">
                Full curriculum materials for continued use in your classroom
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Virtual Coaching</h3>
              <p className="text-gray-600 text-sm">
                Follow-up virtual coaching sessions to support implementation
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
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
              <h3 className="font-bold text-gray-900 mb-2">
                Student Certification
              </h3>
              <p className="text-gray-600 text-sm">
                Completion assessments and certificates for participating
                students
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware & Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-blue-600 font-semibold text-sm tracking-wider uppercase mb-2">
                Additional Services
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Hardware & Resources
              </h2>
              <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                Beyond instruction, FundedYouth can help your school build
                long-term STEM capacity through equipment procurement and lab
                development. We work with schools to identify the right tools
                and resources for their specific programs and budget.
              </p>
              <p className="text-gray-600 mb-8">
                Whether you&apos;re starting from scratch or expanding an
                existing program, we can guide you through the process of
                selecting, sourcing, and setting up the equipment your students
                need to succeed.
              </p>
              <a
                href="mailto:info@fundedyouth.org?subject=Hardware%20%26%20Resources%20Inquiry"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
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
                Contact us to discuss your needs
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

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      3D Printers & Fabrication Equipment
                    </h3>
                    <p className="text-gray-600 text-sm">
                      FDM and resin printers, laser cutters, and CNC machines
                      for hands-on manufacturing education
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Robotics & Electronics Kits
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Microcontrollers, sensors, motors, and complete robotics
                      platforms for coding and engineering projects
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Workstations & Software
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Computer setups with CAD software, development
                      environments, and design tools for your lab
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-orange-600"
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
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">
                      Consumables & Materials
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Ongoing supply of filaments, components, raw materials,
                      and project supplies to keep your lab running
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-emerald-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-white text-lg md:text-xl leading-relaxed">
            FundedYouth is committed to delivering high-quality STEM educational
            experiences while empowering your instructors and sustaining our
            nonprofit mission as a 501(c)(3) organization.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Let&apos;s Discuss Your Needs
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            We&apos;d love to learn more about your school and students. Reach
            out to discuss how we can create a customized program that fits your
            goals and budget.
          </p>

          <div className="bg-gray-50 rounded-2xl p-8 max-w-xl mx-auto">
            <p className="text-gray-700 font-medium mb-4">
              Stop by our facility or send us an email to start the
              conversation. Please use the subject line &quot;Partner With
              Us&quot; in your message.
            </p>

            <img
              src="/assets/images/email-info.svg"
              alt="info@fundedyouth.org"
              className="h-8 mx-auto mb-6"
            />

            <a
              href="https://maps.app.goo.gl/tbi3qfSUmKoK3Yf26"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              415 Parkway Plaza, Suite 519, El Cajon
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
