import { Link } from 'react-router-dom'

const legalDocuments = [
  {
    title: 'General Release Agreement',
    description:
      'Waiver and consent form required for all participants in FundedYouth programs and activities.',
    href: '/legal/waiver',
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
    status: 'active',
  },
  {
    title: 'Privacy Policy',
    description:
      'How we collect, use, and protect your personal information in compliance with CCPA.',
    href: '/legal/privacy-policy',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    title: 'Terms of Service',
    description:
      'Terms and conditions governing the use of FundedYouth services and programs.',
    href: '/legal/terms-of-service',
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    status: 'coming-soon',
  },
  {
    title: 'Code of Conduct',
    description:
      'Expected behavior and guidelines for participants, volunteers, and staff.',
    href: '/legal/code-of-conduct',
    icon: (
      <svg
        className="w-6 h-6"
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
    ),
    status: 'coming-soon',
  },
]

export function LegalIndexPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Legal & Documentation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Access important policies, agreements, and documentation for
            FundedYouth programs and services.
          </p>
        </div>
      </section>

      {/* Documents Grid */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid sm:grid-cols-2 gap-6">
            {legalDocuments.map((doc) => (
              <div
                key={doc.title}
                className={`bg-white rounded-2xl border border-gray-200 p-6 transition-all duration-200 ${
                  doc.status === 'active'
                    ? 'hover:shadow-lg hover:border-blue-200'
                    : 'opacity-75'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      doc.status === 'active'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {doc.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-gray-900">{doc.title}</h2>
                      {doc.status === 'coming-soon' && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {doc.description}
                    </p>
                    {doc.status === 'active' ? (
                      <Link
                        to={doc.href}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View Document
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
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Available soon
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Questions About Our Policies?
            </h2>
            <p className="text-gray-600 mb-6">
              If you have questions about any of our legal documents or need
              assistance, please contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
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
                Contact Us
              </Link>
              <a
                href="tel:+16197285002"
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-200"
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                (619) 728-5002
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
