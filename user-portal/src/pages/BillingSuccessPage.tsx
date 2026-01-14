import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function BillingSuccessPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto-redirect after 5 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard/billing')
    }, 5000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex min-h-[400px] items-center justify-center p-8">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="size-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">
          Payment Successful
        </h1>
        <p className="mt-2 text-gray-600">
          Thank you! Your payment has been processed.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          You will be redirected to billing in 5 seconds...
        </p>
        <Link
          to="/dashboard/billing"
          className="mt-6 inline-block rounded-lg bg-teal-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
        >
          Return to Billing
        </Link>
      </div>
    </div>
  )
}
