import { Link } from 'react-router-dom'

export function WaiverPage() {
  return (
    <main className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-white border-b border-gray-200 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            to="/legal"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium mb-6"
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Legal
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            General Release Agreement
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>Version 1.2.2</span>
            <span className="hidden sm:inline">|</span>
            <span>Last updated: July 19, 2024</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            {/* Version Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
              <p className="text-amber-800 text-sm">
                FundedYouth reserves the right to change this document as they see fit at any time.
                For individuals that have read and consented to this document, consent is reflected
                only in the version they have signed. All individuals participating in activities or
                services related to FundedYouth must sign the latest version of this General Release
                Agreement.
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                We are thrilled to welcome you to our educational programs at FundedYouth. To ensure
                the best experience, we may need to collect certain personal information from both
                the parent/guardian and the individual which FundedYouth refers to as a student.
              </p>
            </div>

            {/* Information Collection and Use */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Information Collection and Use</h2>
              <p className="text-gray-600 leading-relaxed">
                FundedYouth will retain this information for the duration of the individual&apos;s
                participation in our programs and for a reasonable period thereafter as required by
                law. You have the right to request access to or deletion of your personal information
                at any time, in accordance with the{' '}
                <a
                  href="https://www.oag.ca.gov/privacy/ccpa"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  California Consumer Privacy Act (CCPA)
                </a>
                .
              </p>
            </div>

            {/* Privacy and Data Sharing */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Privacy and Data Sharing</h2>
              <p className="text-gray-600 leading-relaxed">
                FundedYouth is committed to protecting your privacy. We do not disclose personal
                information to any third parties, except as required by law or with your explicit
                consent. All collected data will be used exclusively by FundedYouth for the intended
                educational purposes and will be kept secure and confidential, in compliance with
                the California Consumer Privacy Act (CCPA).
              </p>
            </div>

            {/* Liability Waiver */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Liability Waiver</h2>
              <p className="text-gray-600 leading-relaxed">
                By signing this agreement, you acknowledge that participation in FundedYouth&apos;s
                programs involves certain risks, including but not limited to tripping and falling,
                fire hazards, chemical exposure, burns, fume inhalation, mechanical injuries, laser
                exposure, and electrical shock. Please be assured that FundedYouth takes all
                necessary safety precautions to minimize these risks. You agree to release and hold
                harmless FundedYouth, its employees, and agents from any and all liability for any
                injury, loss, or damage that may occur while the student is enrolled in the program,
                except for any claims arising from the gross negligence or willful misconduct of
                FundedYouth.
              </p>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 my-10" />

            {/* Sign the Waiver CTA */}
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Thank you for supporting FundedYouth and our educational programs!
              </p>
              <a
                href="https://forms.office.com/r/aJYRBsLz5Q"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign the Waiver
              </a>
            </div>

            {/* Divider */}
            <hr className="border-gray-200 my-10" />

            {/* Contact Info */}
            <div className="text-center text-sm text-gray-500">
              <p className="font-semibold text-gray-700 mb-2">FundedYouth, 501(c)3 Nonprofit</p>
              <p>204 Greenfield Dr. Ste F</p>
              <p>El Cajon, CA 92021</p>
              <p className="mt-2">
                <a
                  href="https://fundedyouth.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700"
                >
                  FundedYouth.org
                </a>
              </p>
              <p>(619) 728-5002</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
