import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthGuard } from '../components/AuthGuard'
import { supabase } from '../lib/supabaseClient'
import { getInvoices } from '../lib/stripeApi'

// Public site URL - set via environment variable or defaults to current origin
const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || '/'

function DashboardContent() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [hasUnpaidInvoices, setHasUnpaidInvoices] = useState(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Check for unpaid invoices
  useEffect(() => {
    async function checkUnpaidInvoices() {
      if (!user) return

      // First check if user has billing set up
      const { data: billing } = await supabase
        .from('billing_customers')
        .select('stripe_customer_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!billing?.stripe_customer_id) return

      // Fetch invoices and check for unpaid ones
      try {
        const result = await getInvoices()
        if (result.invoices) {
          setHasUnpaidInvoices(result.invoices.some((inv) => inv.status === 'open'))
        }
      } catch {
        // Silently fail
      }
    }

    checkUnpaidInvoices()
  }, [user])

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const isActive = (path: string) => location.pathname === path

  const firstName = user?.user_metadata?.first_name || ''
  const lastName = user?.user_metadata?.last_name || ''
  const phone = user?.user_metadata?.phone || ''
  const initials =
    firstName || lastName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : ''

  // Profile is complete when user has first name, last name, and phone
  const isProfileComplete = Boolean(firstName && lastName && phone)

  const closeMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Horizontal Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <div className="flex h-16 items-center justify-between px-4">
          {/* Left section: Hamburger + Logo */}
          <div className="flex items-center gap-4">
            {/* Hamburger menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-100 hover:text-yellow-400 focus:outline-none md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                )}
              </svg>
            </button>

            {/* Logo */}
            <Link
              to="/dashboard"
              className="text-lg font-semibold text-gray-100"
            >
              USA Software Leasing
            </Link>

            {/* Desktop Navigation */}
            <nav className="ml-8 hidden items-center gap-1 md:flex">
              <Link
                to="/dashboard"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/services"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/dashboard/services')
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Enable Services
              </Link>
              <Link
                to="/dashboard/billing"
                className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/dashboard/billing')
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Payments &amp; Billing
                {hasUnpaidInvoices && (
                  <svg
                    className="absolute -right-1 -top-1 size-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003z"
                      className="fill-yellow-100 stroke-yellow-800"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                      className="fill-yellow-800"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </Link>
              <Link
                to="/dashboard/profile"
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive('/dashboard/profile')
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                Profile
              </Link>
              <span className="ml-4 h-5 w-px bg-slate-600"></span>
              <a
                href={`${PUBLIC_SITE_URL}/docs`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-800 hover:text-white"
              >
                Docs
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            </nav>
          </div>

          {/* Right section: Status badge + Profile avatar with popover */}
          <div className="flex items-center gap-3">
            {/* Account Status Badge */}
            {isProfileComplete ? (
              <span className="hidden items-center rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 sm:inline-flex">
                <span className="mr-1.5 size-2 rounded-full bg-green-400"></span>
                Approved
              </span>
            ) : (
              <span className="hidden items-center rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400 sm:inline-flex">
                <span className="mr-1.5 size-2 rounded-full bg-yellow-400"></span>
                Pending
              </span>
            )}

            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex size-10 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white transition-colors hover:bg-teal-500"
                aria-expanded={profileMenuOpen}
                aria-haspopup="true"
              >
                {initials ? (
                  initials
                ) : (
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                )}
              </button>

              {/* Profile popover menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black/5">
                  <Link
                    to="/dashboard/profile"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false)
                      handleSignOut()
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <svg
                      className="size-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                      />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 top-16 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile slide-out menu */}
      <div
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-teal-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-1 flex-col">
          <div className="space-y-1 px-4 py-6">
            <Link
              to="/dashboard"
              onClick={closeMenu}
              className={`block rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                isActive('/dashboard') ? 'bg-teal-800' : 'hover:bg-teal-800/50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/services"
              onClick={closeMenu}
              className={`block rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                location.pathname.startsWith('/dashboard/services')
                  ? 'bg-teal-800'
                  : 'hover:bg-teal-800/50'
              }`}
            >
              Enable Services
            </Link>
            <Link
              to="/dashboard/billing"
              onClick={closeMenu}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                location.pathname.startsWith('/dashboard/billing')
                  ? 'bg-teal-800'
                  : 'hover:bg-teal-800/50'
              }`}
            >
              Payments &amp; Billing
              {hasUnpaidInvoices && (
                <svg
                  className="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003z"
                    className="fill-yellow-100 stroke-yellow-800"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                    className="fill-yellow-800"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </Link>
            <Link
              to="/dashboard/profile"
              onClick={closeMenu}
              className={`block rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors ${
                isActive('/dashboard/profile')
                  ? 'bg-teal-800'
                  : 'hover:bg-teal-800/50'
              }`}
            >
              Profile
            </Link>
            <div className="my-2 border-t border-teal-700"></div>
            <a
              href={`${PUBLIC_SITE_URL}/docs`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-800/50"
            >
              Docs
              <svg
                className="size-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                />
              </svg>
            </a>
          </div>

          {/* User info at bottom of mobile menu */}
          <div className="mt-auto border-t border-teal-800 p-4">
            <div className="mb-2 truncate text-sm text-teal-300">
              {user?.email}
            </div>
            <button
              onClick={() => {
                closeMenu()
                handleSignOut()
              }}
              className="w-full rounded-lg bg-teal-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}

export function DashboardLayout() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
}
