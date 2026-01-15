import { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import { ROLES, isAdmin } from "lib/roles";
import { NotificationBell } from "components/NotificationBell";
import { TicketBell } from "components/TicketBell";

export function AdminLayout() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsExpanded, setIsProductsExpanded] = useState(
    location.pathname.startsWith("/products"),
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case ROLES.ADMIN:
        return "bg-red-600";
      case ROLES.MANAGER:
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 transition-colors duration-200 ${
      isActive
        ? "bg-gray-800 border-l-4 border-blue-400 text-white"
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="flex h-16 items-center justify-between border-b border-gray-700 px-4">
        <h1 className="text-xl font-bold text-white">Admin Portal</h1>
        {/* Close button - mobile only */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <NavLink
              to="/"
              end
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Dashboard
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/users"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Users
              </span>
            </NavLink>
          </li>
          {/* Products Menu with Sub-navigation */}
          <li>
            <button
              onClick={() => setIsProductsExpanded(!isProductsExpanded)}
              className={`block w-full px-4 py-3 text-left transition-colors duration-200 ${
                location.pathname.startsWith("/products")
                  ? "bg-gray-800 border-l-4 border-blue-400 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-3">
                  <svg
                    className="size-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Products
                </span>
                <svg
                  className={`size-4 transition-transform duration-200 ${
                    isProductsExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </button>
            {isProductsExpanded && (
              <ul className="bg-gray-950">
                <li>
                  <NavLink
                    to="/products"
                    end
                    className={({ isActive }) =>
                      `block py-2 pl-12 pr-4 text-sm transition-colors duration-200 ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                    onClick={handleNavClick}
                  >
                    All Products
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/products/types"
                    className={({ isActive }) =>
                      `block py-2 pl-12 pr-4 text-sm transition-colors duration-200 ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                    onClick={handleNavClick}
                  >
                    Product Type
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/products/categories"
                    className={({ isActive }) =>
                      `block py-2 pl-12 pr-4 text-sm transition-colors duration-200 ${
                        isActive
                          ? "bg-gray-800 text-white"
                          : "text-gray-400 hover:bg-gray-800 hover:text-white"
                      }`
                    }
                    onClick={handleNavClick}
                  >
                    Category
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
          <li>
            <NavLink
              to="/vps"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                  />
                </svg>
                VPS Management
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/services"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Services
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/notifications"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                Notifications
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/tickets"
              className={navLinkClass}
              onClick={handleNavClick}
            >
              <span className="flex items-center gap-3">
                <svg
                  className="size-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
                Tickets
              </span>
            </NavLink>
          </li>
          {/* Admin Only Links */}
          {isAdmin(role) && (
            <>
              <li className="pt-4">
                <div className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Admin Only
                </div>
              </li>
              <li>
                <NavLink
                  to="/roles"
                  className={navLinkClass}
                  onClick={handleNavClick}
                >
                  <span className="flex items-center gap-3">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    Role Management
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/audit-logs"
                  className={navLinkClass}
                  onClick={handleNavClick}
                >
                  <span className="flex items-center gap-3">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Audit Logs
                  </span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/menu-visibility"
                  className={navLinkClass}
                  onClick={handleNavClick}
                >
                  <span className="flex items-center gap-3">
                    <svg
                      className="size-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Menu Visibility
                  </span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* User Info */}
      <div className="border-t border-gray-700 p-4">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-gray-700 text-sm font-medium text-white">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 truncate">
            <div className="truncate text-sm font-medium text-white">
              {user?.email}
            </div>
            <span
              className={`inline-block rounded px-2 py-0.5 text-xs font-medium uppercase ${getRoleBadgeColor()}`}
            >
              {role}
            </span>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600"
        >
          <svg
            className="size-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 lg:hidden">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="rounded-lg p-2 text-gray-300 hover:bg-gray-800 hover:text-white"
          aria-label="Open menu"
        >
          <svg
            className="size-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white">Admin Portal</h1>
        <div className="flex items-center gap-1 text-white">
          <NotificationBell />
          <TicketBell />
        </div>
      </header>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-gray-900 transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-gray-900 lg:flex">
        <SidebarContent />
      </aside>

      {/* Main Content */}
      <main className="min-h-screen pt-16 lg:ml-64 lg:pt-0">
        {/* Desktop Top Bar */}
        <div className="hidden h-16 items-center justify-end gap-2 border-b border-gray-200 bg-white px-6 lg:flex">
          <NotificationBell />
          <TicketBell />
        </div>

        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
