// User portal URL - set via environment variable or defaults to relative path
const USER_PORTAL_URL = import.meta.env.VITE_USER_PORTAL_URL || ''

function StepNumberBox({
  children,
  className = ''
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-6 py-2 text-4xl font-bold uppercase text-gray-900 shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${className}`}
    >
      {children}
    </span>
  )
}

export function HomePage() {
  const signupUrl = `${USER_PORTAL_URL}/signup`

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-800 via-teal-900 to-gray-900 text-white">
      {/* Main Container */}
      <div className="flex flex-col items-center justify-start px-6 py-20">
        {/* Spacer */}
        <div className="h-10 sm:h-16"></div>

        {/* Logo */}
        <div className="mb-8 size-32 overflow-hidden rounded-full border-4 border-yellow-400 p-2 shadow-lg sm:size-40">
          <img
            src="/dws-logo.png"
            alt="DWS Logo"
            className="size-full rounded-full object-cover"
          />
        </div>

        {/* Company Name */}
        <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
          USA Software <span className="text-yellow-400">Leasing</span>
        </h1>

        {/* Tagline */}
        <p className="mb-20 max-w-md text-center text-xl font-semibold sm:text-2xl">
          We have created a financial{' '}
          <span className="text-emerald-400">miracle!</span>
        </p>

        {/* Step 1: Register with Broker */}
        <StepNumberBox className="mb-4">STEP 1</StepNumberBox>
        <div className="mb-24 w-full max-w-2xl">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Register with a Broker
          </h2>
          <p className="mb-8 text-center text-xl">
            Open an account with Trading.com, a fully licensed and regulated
            broker. You can download a detailed,{' '}
            <a href="/docs" className="text-green-400 hover:underline">
              step-by-step guide
            </a>{' '}
            on how to open your account.
          </p>

          {/* Broker Card */}
          <a
            href="https://www.trading.com/us/"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto block max-w-[250px] rounded-xl bg-white p-2 shadow-2xl transition-all duration-300 hover:scale-105"
          >
            <img
              src="/trading-com-logo.png"
              alt="Trading.com Logo"
              className="mx-auto h-auto w-full object-contain"
            />
          </a>
        </div>

        {/* Step 2: Create Account */}
        <StepNumberBox className="mb-4">STEP 2</StepNumberBox>
        <div className="mb-32 w-full max-w-2xl">
          <h2 className="mb-8 text-center text-3xl font-bold sm:text-4xl">
            Create Account
          </h2>
          <p className="mb-8 text-center text-xl">
            Open an account with us to lease our software.
          </p>

          <div className="flex justify-center">
            <a
              href={signupUrl}
              className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-12 py-4 text-lg font-bold text-gray-900 shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-yellow-400/50"
            >
              Sign Up Now
            </a>
          </div>
        </div>

        {/* Lease Terms */}
        <div className="w-full max-w-2xl">
          <h2 className="mb-6 text-center text-3xl font-bold sm:text-4xl">
            Lease Terms
          </h2>
          <p className="mx-auto max-w-xl text-center text-lg leading-relaxed text-gray-300">
            When you sign the software lease, you agree to walk three times a
            week and contribute 10% of your profits to a retirement or savings
            account.
          </p>
        </div>
      </div>
    </div>
  )
}
