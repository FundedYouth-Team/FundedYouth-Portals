export function ContactPage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="bg-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-3">
            STAY CONNECTED
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Feel Free To Reach Out
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto">
            Remember to sign up for our newsletter to stay in the loop and if
            you have any additional questions please use the standard form below
            and we'll follow up.
          </p>
        </div>
      </section>

      {/* Newsletter Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-orange-500 text-center mb-8">
            Get the latest updates and promotions
          </h2>

          {/* Mailchimp Form */}
          <div className="border border-gray-200 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-orange-500"
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
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                Stay connected!
              </h3>
              <p className="text-gray-500 text-sm">Sign up for a Newsletter.</p>
            </div>

            {/* Mailchimp Signup Form */}
            <form
              action="https://fundedyouth.us15.list-manage.com/subscribe/post?u=b8008ae86fd8ccf3703b1d1e7&amp;id=65c7edf8a0&amp;f_id=00f4c2e1f0"
              method="post"
              id="mc-embedded-subscribe-form"
              name="mc-embedded-subscribe-form"
              className="space-y-4"
              target="_blank"
            >
              <div>
                <label
                  htmlFor="mce-EMAIL"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="EMAIL"
                  id="mce-EMAIL"
                  placeholder="sample@mail.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="mce-FNAME"
                  className="block text-sm text-gray-600 mb-1"
                >
                  First Name
                </label>
                <input
                  type="text"
                  name="FNAME"
                  id="mce-FNAME"
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="mce-LNAME"
                  className="block text-sm text-gray-600 mb-1"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  name="LNAME"
                  id="mce-LNAME"
                  placeholder="Smith"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              {/* Mailchimp response messages */}
              <div id="mce-responses">
                <div
                  className="text-red-500 text-sm"
                  id="mce-error-response"
                  style={{ display: "none" }}
                ></div>
                <div
                  className="text-green-500 text-sm"
                  id="mce-success-response"
                  style={{ display: "none" }}
                ></div>
              </div>

              {/* Honeypot anti-spam field */}
              <div
                aria-hidden="true"
                style={{ position: "absolute", left: "-5000px" }}
              >
                <input
                  type="text"
                  name="b_b8008ae86fd8ccf3703b1d1e7_65c7edf8a0"
                  tabIndex={-1}
                  defaultValue=""
                />
              </div>

              <div className="text-center pt-4">
                <button
                  type="submit"
                  name="subscribe"
                  id="mc-embedded-subscribe"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Zigzag Divider */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <svg
          viewBox="0 0 400 20"
          className="w-full h-5"
          preserveAspectRatio="none"
        >
          <path
            d="M0,10 L10,0 L20,10 L30,0 L40,10 L50,0 L60,10 L70,0 L80,10 L90,0 L100,10 L110,0 L120,10 L130,0 L140,10 L150,0 L160,10 L170,0 L180,10 L190,0 L200,10 L210,0 L220,10 L230,0 L240,10 L250,0 L260,10 L270,0 L280,10 L290,0 L300,10 L310,0 L320,10 L330,0 L340,10 L350,0 L360,10 L370,0 L380,10 L390,0 L400,10"
            fill="none"
            stroke="#f97316"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Contact Information Section */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-3">
            DETAILS
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Information
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            For all other inquiries please give us a call. If you are in the
            neighborhood we'd love to have you drop in but we do ask that you
            give us a call just in-case we're out of office.
          </p>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Phone */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg
                  className="w-6 h-6 text-slate-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Office Phone Number
              </h3>
              <p className="text-gray-600">+1 (619) 728-5002</p>
            </div>

            {/* Location */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg
                  className="w-6 h-6 text-slate-700"
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
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Office Location</h3>
              <p className="text-gray-600">FundedYouth</p>
              <p className="text-gray-600">415 Parkway Plaza, Suite 519</p>
              <p className="text-gray-600">El Cajon, CA 92020</p>
              <p className="text-gray-500 text-sm mt-2">
                Near the Dick's Sporting Goods mall entrance and TheGym, and across from Winsor
              </p>
            </div>

            {/* Email */}
            <div className="text-center">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg
                  className="w-6 h-6 text-slate-700"
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
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Email Address</h3>
              {/* Email address as image for spam protection */}
              <img
                src="/assets/images/email-address.png"
                alt="Email Address"
                className="h-6 mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hours of Operation Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-orange-500 font-semibold text-sm uppercase tracking-wide mb-3">
            VISIT US
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Hours of Operation
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* Weekdays */}
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Monday – Friday</h3>
              <p className="text-blue-600 font-medium mb-1">Open Labs and Special Events</p>
              <p className="text-gray-600 text-lg">2:30 PM – 7:30 PM</p>
            </div>

            {/* Weekends */}
            <div className="bg-slate-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-green-600"
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
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Saturday & Sunday</h3>
              <p className="text-green-600 font-medium mb-1">STEAM Camps and Classes</p>
              <p className="text-gray-600 text-lg">1:00 PM – 5:00 PM</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
