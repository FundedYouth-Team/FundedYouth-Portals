import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  { label: "Home", href: "/", page: "" },
  { label: "Learn", href: "/classes", page: "classes" },
  { label: "Get Involved", href: "/volunteer", page: "volunteer" },
  { label: "Adventures", href: "/adventures", page: "adventures" },
  { label: "Impact", href: "/impact", page: "impact" },
  { label: "Donate", href: "/donate", page: "donate" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const currentPage = location.pathname.split("/")[1] || "";

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = mobileMenuOpen ? "" : "hidden";
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    document.body.style.overflow = "";
  };

  return (
    <>
      <header className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 sticky top-0 z-50 shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo and Nav Links */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
              >
                <img
                  src="/logo-color-white-bg.png"
                  alt="FundedYouth"
                  className="h-8 w-auto"
                />
                <span className="text-xl font-semibold text-white">
                  FundedYouth
                </span>
              </Link>

              {/* Desktop Menu */}
              <div className="hidden lg:flex items-center space-x-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`transition-colors ${
                      currentPage === item.page
                        ? "text-white font-medium"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link
                to="/contact"
                className="bg-white text-blue-600 hover:bg-white/90 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Hamburger Menu */}
            <button
              className="lg:hidden p-2 text-white hover:text-white/80 transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Slide-out Menu */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={closeMobileMenu}
        />

        {/* Slide-out Panel */}
        <div
          className={`absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <Link
                to="/"
                className="flex items-center space-x-2 hover:opacity-90 transition-opacity"
                onClick={closeMobileMenu}
              >
                <img
                  src="/logo-color-white-bg.png"
                  alt="FundedYouth"
                  className="h-8 w-auto bg-blue-600 rounded-lg p-1"
                />
                <span className="text-xl font-semibold text-gray-900">
                  FundedYouth
                </span>
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Menu Links */}
            <nav className="flex-1 px-6 py-6 overflow-y-auto">
              <div className="flex flex-col space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`px-4 py-3 text-lg rounded-lg transition-colors ${
                      currentPage === item.page
                        ? "text-blue-600 bg-blue-50 font-medium"
                        : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                    }`}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile Menu Actions */}
            <div className="px-6 py-6 border-t border-gray-200">
              <Link
                to="/contact"
                className="block w-full text-center py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                onClick={closeMobileMenu}
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
