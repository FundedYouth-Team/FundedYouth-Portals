import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const COUNTRY_CODES = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+61', country: 'AU' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+81', country: 'JP' },
  { code: '+86', country: 'CN' },
  { code: '+91', country: 'IN' },
  { code: '+52', country: 'MX' },
  { code: '+55', country: 'BR' }
]

function parseE164Phone(phone: string): {
  countryCode: string
  number: string
} {
  if (!phone) return { countryCode: '+1', number: '' }

  for (const { code } of COUNTRY_CODES) {
    if (phone.startsWith(code)) {
      return { countryCode: code, number: phone.slice(code.length) }
    }
  }
  // Default: assume +1 if no match
  if (phone.startsWith('+')) {
    return { countryCode: '+1', number: phone.slice(1) }
  }
  return { countryCode: '+1', number: phone }
}

function stripNonDigits(value: string): string {
  return value.replace(/\D/g, '').slice(0, 10)
}

function formatPhoneDisplay(digits: string): string {
  if (!digits) return ''
  if (digits.length <= 3) {
    return `(${digits}`
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  }
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)} - ${digits.slice(6)}`
}

export function ProfilePage() {
  const { user, updatePassword, updateProfile, signIn } = useAuth()

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Profile form state
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [countryCode, setCountryCode] = useState('+1')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [profileLoading, setProfileLoading] = useState(false)

  const firstName = user?.user_metadata?.first_name || ''
  const lastName = user?.user_metadata?.last_name || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ')
  const phone = user?.user_metadata?.phone || ''

  // Initialize edit form with current values
  useEffect(() => {
    setEditFirstName(firstName)
    setEditLastName(lastName)
    const parsed = parseE164Phone(phone)
    setCountryCode(parsed.countryCode)
    setPhoneNumber(parsed.number)
  }, [firstName, lastName, phone])

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A'

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A'

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    // Validate phone number is exactly 10 digits if provided
    if (phoneNumber && phoneNumber.length !== 10) {
      setProfileError('Phone number must be exactly 10 digits')
      return
    }

    setProfileLoading(true)

    // Combine country code and phone number into E.164 format
    const fullPhone = phoneNumber ? `${countryCode}${phoneNumber}` : undefined

    const { error } = await updateProfile({
      firstName: editFirstName,
      lastName: editLastName,
      phone: fullPhone
    })

    if (error) {
      setProfileError(error.message)
    } else {
      setProfileSuccess('Profile updated successfully')
    }
    setProfileLoading(false)
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword) {
      setPasswordError('Current password is required')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)

    // Verify current password by attempting to sign in
    const { error: signInError } = await signIn(
      user?.email || '',
      currentPassword
    )
    if (signInError) {
      setPasswordError('Current password is incorrect')
      setPasswordLoading(false)
      return
    }

    const { error } = await updatePassword(newPassword)

    if (error) {
      setPasswordError(error.message)
    } else {
      setPasswordSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
    setPasswordLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
      <p className="mt-2 text-gray-600">Your account information</p>

      <div className="mt-8 max-w-2xl space-y-6">
        {/* Account Info Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-full bg-teal-100 text-2xl font-bold text-teal-600">
              {firstName
                ? firstName.charAt(0).toUpperCase()
                : user?.email?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {fullName || user?.email || 'Unknown User'}
              </h2>
              <p className="text-sm text-gray-500">Member since {createdAt}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-500">
                  Email Address
                </h3>
                {user?.email_confirmed_at ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                    Pending
                  </span>
                )}
              </div>
              <p className="mt-1 text-gray-900">{user?.email || 'N/A'}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">User ID</h3>
              <p className="mt-1 font-mono text-sm text-gray-900">
                {user?.id || 'N/A'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">
                Last Sign In
              </h3>
              <p className="mt-1 text-gray-900">{lastSignIn}</p>
            </div>
          </div>
        </div>

        {/* Edit Profile Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your personal information
          </p>

          <form onSubmit={handleProfileUpdate} className="mt-6 space-y-4">
            {profileError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {profileSuccess}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone Number
              </label>
              <div className="mt-1 flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  {COUNTRY_CODES.map(({ code, country }) => (
                    <option key={code} value={code}>
                      {code} ({country})
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={formatPhoneDisplay(phoneNumber)}
                  onChange={(e) =>
                    setPhoneNumber(stripNonDigits(e.target.value))
                  }
                  className="block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  placeholder="(555) 123 - 4567"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">10 digits required</p>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Change Password
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your password to keep your account secure
          </p>

          <form onSubmit={handlePasswordChange} className="mt-6 space-y-4">
            {passwordError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Enter new password"
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
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
