import { Link } from "react-router-dom";

const journeySteps = [
  {
    number: "01",
    title: "Apply",
    description: "Fill out our volunteer application and tell us about yourself and your interests.",
  },
  {
    number: "02",
    title: "Get Trained",
    description: "Complete our free introductory 3D printing course to build your skills and confidence.",
  },
  {
    number: "03",
    title: "Volunteer",
    description: "Help out at events, assist in the makerspace, and support learners of all ages.",
  },
  {
    number: "04",
    title: "Lead & Teach",
    description: "Once approved by a board member, lead classes and inspire new makers in the community.",
  },
];

const benefits = [
  {
    title: "Earn Free 3D Printing Time",
    description: "Your volunteer hours directly translate to printing credits you can use for your own projects.",
    highlight: "1 point for every 1-hour you volunteer",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Free Training & Certification",
    description: "Gain free access to all introductory courses and instructional material.",
    highlight: "A $500 value",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    ),
  },
  {
    title: "Community Service Hours",
    description: "Your volunteer time counts toward community service and outreach requirements—great for students, professionals, and those looking to give back.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Hands-on Experience",
    description: "Work with cutting-edge technology in 3D printing, CAD design, and fabrication while building real-world skills.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Networking & Mentorship",
    description: "Connect with industry professionals, educators, and local businesses invested in STEM education and manufacturing.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: "Resume & Career Boost",
    description: "Develop marketable skills in a growing industry while making a positive community impact.",
    icon: (
      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
];

export function VolunteerPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/storefront-back-with-people.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Green to Teal Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/90 to-teal-600/90"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Join Us in Empowering the
            <br />
            Future Through Innovation
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Become a FundedYouth volunteer and help make hands-on, high-tech learning accessible
            to our community.
          </p>
          <a
            href="https://forms.office.com/r/aJYRBsLz5Q"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Apply to Volunteer
          </a>
        </div>
      </section>

      {/* Our Vision for the Community */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {/* Left Content */}
            <div className="md:col-span-2">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                501(c)(3) Nonprofit
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Our Vision for the Community
              </h2>

              <p className="text-gray-600 leading-relaxed mb-4">
                FundedYouth is a registered 501(c)(3) nonprofit (EIN: 93-4090260) on a mission to
                make hands-on, high-tech learning accessible to our community.
              </p>

              <p className="text-gray-600 leading-relaxed mb-6">
                One of our current goals is to transform our space at Parkway Plaza into a
                vibrant hub where the public can easily explore, learn, and create—starting with
                3D printing.
              </p>

              {/* Location Badge */}
              <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                Parkway Plaza, San Diego
              </div>
            </div>

            {/* Right Card - EIN Number */}
            <div className="bg-emerald-50 rounded-2xl p-6 text-center border border-emerald-100">
              <p className="text-4xl md:text-5xl font-bold text-emerald-600 mb-2">
                93-
                <br />
                4090260
              </p>
              <p className="text-gray-600 font-medium mb-4">EIN Number</p>
              <p className="text-gray-500 text-sm">
                Your contributions and volunteer time may be tax-deductible
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Do as a Volunteer */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              What You'll Do as a Volunteer
            </h2>
            <p className="text-gray-600 text-lg">
              As a FundedYouth volunteer, you won't just help out—you'll become part of the
              learning experience.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <p className="text-gray-600 leading-relaxed mb-4">
              Every volunteer will be trained in our introductory 3D printing course, giving you
              the confidence and skills to eventually teach the material to others.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Once approved by a board member, you'll have the opportunity to{" "}
              <Link to="/classes" className="text-emerald-600 hover:text-emerald-700 font-medium">
                lead classes and inspire new makers
              </Link>{" "}
              in our community.
            </p>
          </div>
        </div>
      </section>

      {/* Storefront Image */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src="/assets/images/storefront-with-people.png"
              alt="Volunteers helping at FundedYouth storefront"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Your Volunteer Journey */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Your Volunteer Journey
            </h2>
            <p className="text-gray-600">
              From application to leading classes—here's your path with FundedYouth
            </p>
          </div>

          {/* Journey Steps */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {journeySteps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="bg-gray-50 rounded-2xl p-6 h-full border border-gray-100">
                  <p className="text-4xl font-bold text-emerald-500 mb-2">{step.number}</p>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
                {/* Arrow (hidden on mobile, last item) */}
                {index < journeySteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 text-emerald-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Volunteer Perks & Benefits */}
      <section className="py-16 bg-emerald-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Volunteer Perks & Benefits
            </h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Curious about what's in it for you? Check out the amazing benefits of joining our
              volunteer team.
            </p>
          </div>

          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white rounded-2xl p-6">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{benefit.description}</p>
                {benefit.highlight && (
                  <p className="text-emerald-600 text-sm font-semibold">{benefit.highlight}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-600 leading-relaxed">
            FundedYouth is a 501(c)(3) nonprofit dedicated to STEM education and on-demand
            manufacturing through 3D printing, CAD design, and rapid prototyping. As a volunteer,
            you'll gain hands-on experience while making a real impact in the community.
          </p>
        </div>
      </section>

      {/* Ready to Make a Difference CTA */}
      <section className="py-16 bg-gradient-to-r from-slate-900 to-teal-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-slate-300 text-lg mb-8">
            Join our team of dedicated volunteers and help inspire the next generation of makers,
            creators, and innovators.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://forms.office.com/r/aJYRBsLz5Q"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Apply Now
            </a>
            <Link
              to="/contact"
              className="inline-block border-2 border-white hover:bg-white/10 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
