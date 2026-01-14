import { useState, useCallback } from 'react'
import { DocsSidebar } from '../components/DocsSidebar'
import { DocsContent } from '../components/DocsContent'

export function DocsPage() {
  const [selectedDoc, setSelectedDoc] = useState('welcome')
  const [scrollToSection, setScrollToSection] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleSelectDoc = useCallback((docId: string) => {
    setSelectedDoc(docId)
    setScrollToSection(null)
  }, [])

  const handleSelectSection = useCallback((sectionId: string) => {
    setScrollToSection(sectionId)
  }, [])

  const handleScrollComplete = useCallback(() => {
    setScrollToSection(null)
  }, [])

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? 'bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900'
          : 'bg-gradient-to-b from-teal-50 via-white to-gray-50'
      }`}
    >
      {/* Mobile header with menu button */}
      <div
        className={`sticky top-16 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur lg:hidden ${
          darkMode
            ? 'border-slate-700 bg-slate-900/95'
            : 'border-teal-200 bg-white/95'
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              darkMode
                ? 'bg-slate-800 text-gray-200 hover:bg-slate-700'
                : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
            }`}
          >
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Menu
          </button>
          <span
            className={`text-sm ${darkMode ? 'text-gray-400' : 'text-teal-600'}`}
          >
            Documentation
          </span>
        </div>

        {/* Mobile theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`rounded-lg p-2 transition-colors ${
            darkMode
              ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
              : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
          }`}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg className="size-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      {/* Main layout */}
      <div className="flex">
        {/* Sidebar */}
        <DocsSidebar
          selectedDoc={selectedDoc}
          onSelectDoc={handleSelectDoc}
          onSelectSection={handleSelectSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />

        {/* Content area */}
        <main className="min-h-[calc(100vh-4rem)] flex-1">
          <DocsContent
            selectedDoc={selectedDoc}
            scrollToSection={scrollToSection}
            onScrollComplete={handleScrollComplete}
            darkMode={darkMode}
          />
        </main>
      </div>
    </div>
  )
}
