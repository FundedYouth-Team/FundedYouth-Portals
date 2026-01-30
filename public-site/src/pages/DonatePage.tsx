import { Link, useSearchParams } from "react-router-dom";

const monthlyTiers = [
  {
    name: "Level 1 Sponsor",
    amount: 75,
    description: "1 session / month for a single student",
    color: "blue",
    stripeLink: "https://www.zeffy.com/en-US/donation-form/sponsor-a-student-22",
    benefits: ["Listed on Donors Page", "Monthly Donors Newsletter"],
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    checkColor: "text-blue-500",
    buttonClass: "bg-blue-600 hover:bg-blue-700",
  },
  {
    name: "Level 2 Sponsor",
    amount: 125,
    description: "2 sessions / month for a single student",
    color: "purple",
    stripeLink: "https://www.zeffy.com/en-US/donation-form/sponsor-a-student-22",
    benefits: [
      "Updates on your sponsored student",
      "Listed on Donors Page",
      "Monthly Donors Newsletter",
      "Makers Community Access",
    ],
    highlighted: true,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    checkColor: "text-purple-500",
    highlightText: "text-purple-700",
    buttonClass: "bg-purple-600 hover:bg-purple-700",
  },
  {
    name: "Level 3 Sponsor",
    amount: 200,
    description: "3 sessions / month for a single student",
    color: "orange",
    stripeLink: "https://www.zeffy.com/en-US/donation-form/sponsor-a-student-22",
    benefits: [
      "Discounts on Workshops",
      "Updates on your sponsored student",
      "Listed on Donors Page",
      "Monthly Donors Newsletter",
      "Makers Community Access",
    ],
    featured: true,
    iconBg: "bg-orange-200",
    iconColor: "text-orange-600",
    checkColor: "text-orange-500",
    highlightText: "text-orange-700",
    buttonClass: "bg-orange-500 hover:bg-orange-600 shadow-md",
  },
];

export function DonatePage() {
  const [searchParams] = useSearchParams();
  const canceled = searchParams.get("canceled");

  return (
    <main>
      {/* Canceled Payment Notice */}
      {canceled && (
        <div className="bg-amber-50 border-b border-amber-200 py-3 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 text-amber-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm font-medium">
              Payment was canceled. No charges were made. Feel free to try again when you're
              ready.
            </span>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/3Kids-Looking-at-3D-Pencil-Holding-Monster-1024x683.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Blue Overlay */}
        <div className="absolute inset-0 bg-blue-900/85"></div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-full mb-6 shadow-lg">
            501(c)(3) Tax-Deductible
          </p>
          <div className="mb-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
              Sponsor a Child's
              <br />
              <span className="text-orange-400 inline-block mt-2">Future in Making</span>
            </h1>
          </div>
          <div className="mb-8">
            <p className="text-lg md:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-md">
              Your donation gives kids 2 sessions of hands-on learning every week—following a
              single pathway, mixing multiple tracks, or exploring them all.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#monthly"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Giving Monthly
            </a>

          </div>
          <p className="text-white/90 text-sm mt-6 drop-shadow-md">
            <span className="text-orange-300 font-bold">$200/month</span> = 3 sessions / month for a single student
          </p>
        </div>
      </section>

      {/* What Donors Receive */}
      <section className="py-12 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-center text-gray-500 text-sm uppercase tracking-wider mb-2">
            What You'll Receive
          </p>
          <h3 className="text-center text-xl font-bold text-gray-900 mb-8">
            Stay Connected to Your Impact
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { title: "Monthly Newsletter", subtitle: "Updates delivered to your inbox", color: "blue" },
              { title: "Progress Reports", subtitle: "See student growth and milestones", color: "orange" },
              { title: "Student Stories", subtitle: "Real impact and positive outcomes", color: "green" },
              { title: "School Partnerships", subtitle: "New connections in the community", color: "purple" },
              { title: "New Programs", subtitle: "Be first to know what's launching", color: "teal" },
              { title: "Programs in Development", subtitle: "Sneak peeks at what's coming next", color: "amber" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-${item.color}-100 flex items-center justify-center flex-shrink-0`}>
                  <svg className={`w-5 h-5 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-gray-600 text-sm">{item.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donor Tip: 100% Donation */}
      <section className="py-10 bg-blue-50 border-y border-blue-100">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="shrink-0">
              <img
                src="/assets/images/zeffy-100-percent-donation.png"
                alt="Zeffy donation summary showing the 'Other' option to ensure 100% goes to FundedYouth"
                className="rounded-lg border border-gray-200 shadow-sm w-full md:w-64"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="size-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-gray-900">
                  Want 100% of Your Donation to Go to FundedYouth?
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                Our donation platform, Zeffy, is 100% free for nonprofits and
                funded by optional donor contributions. During checkout,
                you&apos;ll see a <strong>Summary</strong> section with a
                suggested contribution to Zeffy.
              </p>
              <p className="text-gray-800 text-sm font-medium">
                To ensure your <em>entire</em> donation goes to FundedYouth,
                select <strong>&ldquo;Other&rdquo;</strong> from the dropdown
                and enter <strong>$0</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Donation Section */}
      <section id="monthly" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider mb-2">
              Recommended
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Become a Monthly Supporter
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Small monthly gifts create <strong>big, lasting impact</strong>. Join our Makers
              Circle and help us plan for the future while you change a child's life today.
            </p>
          </div>

          {/* Monthly Tier Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10 text-sm text-gray-600">
            {["Sustained Support", "Quarterly Impact Newsletter", "Cancel Anytime"].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Monthly Donation Cards */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-6">
            {monthlyTiers.map((tier) => (
              <div
                key={tier.name}
                className={`border ${tier.featured ? "border-2 border-orange-500 bg-orange-50" : "border-gray-200 bg-white"} rounded-2xl p-6 hover:shadow-lg transition-shadow flex flex-col`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <div className={`w-10 h-10 rounded-full ${tier.iconBg} flex items-center justify-center`}>
                    <svg className={`w-5 h-5 ${tier.iconColor}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="font-semibold text-gray-900">{tier.name}</span>
                </div>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-gray-900">${tier.amount}</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{tier.description}</p>
                <ul className="space-y-3 text-sm text-gray-600 mb-6 flex-grow">
                  {tier.benefits.map((benefit, index) => (
                    <li key={benefit} className="flex items-start gap-2">
                      <svg className={`w-4 h-4 ${tier.checkColor} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className={tier.highlightText && index < 2 ? `font-medium ${tier.highlightText}` : ""}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={tier.stripeLink}
                  className={`block w-full text-center ${tier.buttonClass} text-white font-semibold py-3 px-6 rounded-full transition-all duration-200 mt-auto`}
                >
                  Give ${tier.amount}/month
                </a>
              </div>
            ))}
          </div>

          {/* Corporate Sponsor */}
          <div className="max-w-4xl mx-auto">
            <div className="border-2 border-slate-800 rounded-2xl p-8 bg-gradient-to-r from-slate-800 to-slate-900 hover:shadow-xl transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <span className="font-bold text-white text-xl">Level 4 Sponsor</span>
                      <p className="text-slate-400 text-sm">10 sessions / month for a single student</p>
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">$500</span>
                    <span className="text-slate-400"> / month</span>
                  </div>
                  <ul className="grid md:grid-cols-2 gap-3 text-sm text-slate-300">
                    {[
                      "Fully back 1 student",
                      "Covers all pathways",
                      "Everything from Level 3",
                      "Discounts on latest products",
                    ].map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-shrink-0">
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.zeffy.com/en-US/donation-form/sponsor-a-student-22"
                    className="inline-block bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl text-center">
                    Contact Us to Partner
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emotional Quote Section */}
      <section className="py-12 bg-gradient-to-r from-blue-50 to-orange-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <svg className="w-10 h-10 text-blue-300 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-xl md:text-2xl text-gray-700 italic mb-6">
            Every session you sponsor gives a child hands-on time to learn, create, and grow—
            <br className="hidden md:block" />
            <span className="text-blue-600 font-semibold not-italic">
              building skills that last a lifetime.
            </span>
          </p>
        </div>
      </section>

      {/* One-Time Donations Section */}
      <section id="one-time" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-gray-500 text-sm uppercase tracking-wider mb-2">
              + Make a one-time gift
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              One-Time Donations
            </h2>
            <p className="text-gray-600">
              Not ready for monthly? One-time gifts fund individual sessions.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="https://www.zeffy.com/en-US/donation-form/one-time-donation-33"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Make a One-Time Donation
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/assets/images/classroom-tutoring-v1.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        {/* Blue Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-blue-700/90 to-blue-800/90"></div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 drop-shadow-lg">
            Be the Reason a Child Discovers
            <br />
            What They Can Create
          </h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto drop-shadow-md">
            Right now, there are kids in our community who have never touched a 3D printer, never
            written a line of code, never imagined they could build something real.
          </p>
          <p className="text-white font-semibold mb-6 drop-shadow-md">
            <span className="text-orange-300">$200/month</span> gives a child 3 sessions every
            month—
            <br />
            any pathway they choose, from 3D printing to coding and beyond.
          </p>
          <a
            href="#monthly"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-lg"
          >
            Support a Child Today
          </a>
        </div>
      </section>

      {/* Questions Section */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Questions About Donating?</h3>
          <p className="text-gray-600 text-sm mb-4">We're here to help. Reach out anytime.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm">
            <span className="inline-flex items-center">
              <img
                src="/assets/images/email-donate.svg"
                alt="Email donate"
                className="h-5"
              />
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <a href="tel:+16197285002" className="text-blue-600 hover:text-blue-700 font-medium">
              (619) 728-5002
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
