import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'

export function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsValidSession(true)
          setCheckingSession(false)
        }
      }
    )

    // Check if we already have a valid session (user clicked link and was redirected)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      }
      setCheckingSession(false)
    }

    checkSession()

    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    const { error } = await updatePassword(password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      // Sign out and redirect to login after a short delay
      setTimeout(async () => {
        await supabase.auth.signOut()
        navigate('/login', { replace: true })
      }, 2000)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              USA Software Leasing, Inc.
            </h2>
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <div className="flex items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-teal-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              USA Software Leasing, Inc.
            </h2>
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <h1 className="text-2xl font-bold text-gray-900">Invalid or Expired Link</h1>
              <p className="mt-4 text-sm text-gray-600">
                This password reset link is invalid or has expired. Please request a new password reset.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="mt-6 w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              USA Software Leasing, Inc.
            </h2>
            <div className="rounded-2xl bg-white p-8 shadow-xl">
              <div className="mb-4 flex items-center justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="size-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
              <h1 className="text-center text-2xl font-bold text-gray-900">
                Password Updated
              </h1>
              <p className="mt-4 text-center text-sm text-gray-600">
                Your password has been successfully updated. Redirecting to login...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
            USA Software Leasing, Inc.
          </h2>
          <div className="rounded-2xl bg-white p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-gray-900">Reset Your Password</h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Confirm new password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-teal-600 px-4 py-3 font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
