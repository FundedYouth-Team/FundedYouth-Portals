import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

// Public site URL - set via environment variable or defaults to current origin
const PUBLIC_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || '/'

export function AuthLayout() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  return (
    <div className="min-h-screen">
      <nav className="fixed inset-x-0 top-0 z-50 bg-slate-900 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <a href={PUBLIC_SITE_URL} className="text-xl font-semibold text-gray-100">
              USA Software Leasing, Inc
            </a>

            {/* Desktop navigation */}
            <div className="hidden items-center gap-6 md:flex">
              <a
                href={PUBLIC_SITE_URL}
                className="text-base font-medium text-gray-100 transition-colors hover:text-yellow-400"
              >
                Home
              </a>
              <Link
                to="/login"
                className="text-base font-medium text-gray-100 transition-colors hover:text-yellow-400"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-base font-bold text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all hover:from-yellow-300 hover:to-amber-400"
              >
                Sign Up
              </Link>
              <span className="text-gray-500">|</span>
              <a
                href={`${PUBLIC_SITE_URL}/docs`}
                className="flex items-center gap-1.5 text-base font-medium text-gray-100 transition-colors hover:text-yellow-400"
              >
                <svg
                  className="size-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                  />
                </svg>
                Docs
              </a>
            </div>

            {/* Mobile hamburger button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-100 hover:text-yellow-400 focus:outline-none md:hidden"
              aria-expanded={isOpen}
              aria-label="Toggle navigation menu"
            >
              <svg
                className="size-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                {isOpen ? (
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
          </div>
        </div>

        {/* Mobile menu overlay */}
        <div
          className={`fixed inset-0 top-16 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${
            isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={closeMenu}
        />

        {/* Mobile slide-out menu */}
        <div
          className={`fixed right-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 bg-slate-900 shadow-xl transition-transform duration-300 ease-in-out md:hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col gap-2 p-6">
            <a
              href={PUBLIC_SITE_URL}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-lg font-medium text-gray-100 transition-colors hover:bg-slate-800 hover:text-yellow-400"
            >
              Home
            </a>
            <a
              href={`${PUBLIC_SITE_URL}/docs`}
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-lg font-medium text-gray-100 transition-colors hover:bg-slate-800 hover:text-yellow-400"
            >
              Docs
            </a>
            <Link
              to="/login"
              onClick={closeMenu}
              className="rounded-lg px-4 py-3 text-lg font-medium text-gray-100 transition-colors hover:bg-slate-800 hover:text-yellow-400"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={closeMenu}
              className="mt-2 rounded-md bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-3 text-center text-lg font-bold text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all hover:from-yellow-300 hover:to-amber-400"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
}
