import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AuthGuard } from '../components/AuthGuard'
import { supabase } from '../lib/supabaseClient'
import { getInvoices } from '../lib/stripeApi'

function DashboardContent() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarExpanded, setSidebarExpanded] = useState(true)
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

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      isActive: isActive('/dashboard'),
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
      ),
    },
    {
      to: '/dashboard/services',
      label: 'Enable Services',
      isActive: location.pathname.startsWith('/dashboard/services'),
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
    },
    {
      to: '/dashboard/billing',
      label: 'Payments & Billing',
      isActive: location.pathname.startsWith('/dashboard/billing'),
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
        </svg>
      ),
      badge: hasUnpaidInvoices,
    },
    {
      to: '/dashboard/profile',
      label: 'Profile',
      isActive: isActive('/dashboard/profile'),
      icon: (
        <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden flex-col bg-slate-900 transition-all duration-300 md:flex ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          {sidebarExpanded && (
            <span className="text-lg font-semibold text-gray-100 truncate">
              USA Software Leasing
            </span>
          )}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className={`flex items-center justify-center rounded-lg p-2 text-gray-400 hover:bg-slate-800 hover:text-white transition-colors ${
              !sidebarExpanded ? 'mx-auto' : ''
            }`}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              {sidebarExpanded ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5" />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-gray-300 hover:bg-slate-800 hover:text-white'
              } ${!sidebarExpanded ? 'justify-center' : 'gap-3'}`}
              title={!sidebarExpanded ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {sidebarExpanded && <span>{item.label}</span>}
              {item.badge && (
                <span className={`flex size-2 rounded-full bg-yellow-400 ${sidebarExpanded ? 'ml-auto' : 'absolute right-1 top-1'}`} />
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-700 p-2">
          {sidebarExpanded && (
            <div className="truncate px-2 py-2 text-sm text-slate-400">{user?.email}</div>
          )}
          <button
            onClick={handleSignOut}
            className={`flex w-full items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-slate-800 hover:text-white ${
              !sidebarExpanded ? 'justify-center' : 'gap-3'
            }`}
            title={!sidebarExpanded ? 'Sign Out' : undefined}
          >
            <svg className="size-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
            {sidebarExpanded && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Top Header */}
      <header
        className={`fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-white border-b border-gray-200 px-4 transition-all duration-300 ${
          sidebarExpanded ? 'md:pl-68 md:left-64' : 'md:pl-20 md:left-16'
        }`}
      >
        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>

        {/* Mobile logo */}
        <Link to="/dashboard" className="text-lg font-semibold text-gray-900 md:hidden">
          USA Software Leasing
        </Link>

        {/* Spacer for desktop */}
        <div className="hidden md:block" />

        {/* Right section: Status badge + Profile */}
        <div className="flex items-center gap-3">
          {/* Account Status Badge */}
          {isProfileComplete ? (
            <span className="hidden items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 sm:inline-flex">
              <span className="mr-1.5 size-2 rounded-full bg-green-500"></span>
              Approved
            </span>
          ) : (
            <span className="hidden items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 sm:inline-flex">
              <span className="mr-1.5 size-2 rounded-full bg-yellow-500"></span>
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
                <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
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
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
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
                  <svg className="size-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
      />

      {/* Mobile slide-out menu */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-64 bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile menu header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
          <span className="text-lg font-semibold text-gray-100">Menu</span>
          <button
            onClick={closeMenu}
            className="rounded-lg p-2 text-gray-400 hover:bg-slate-800 hover:text-white"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex flex-1 flex-col">
          <div className="space-y-1 px-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={closeMenu}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto flex size-2 rounded-full bg-yellow-400" />
                )}
              </Link>
            ))}
          </div>

          {/* User info at bottom of mobile menu */}
          <div className="mt-auto border-t border-slate-700 p-4">
            <div className="mb-2 truncate text-sm text-slate-400">
              {user?.email}
            </div>
            <button
              onClick={() => {
                closeMenu()
                handleSignOut()
              }}
              className="w-full rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
            >
              Sign Out
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          sidebarExpanded ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
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
