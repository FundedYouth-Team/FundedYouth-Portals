import { useState } from 'react'
import { docs, type DocPage } from '../data/docs'

interface DocsSidebarProps {
  selectedDoc: string
  onSelectDoc: (docId: string) => void
  onSelectSection: (sectionId: string) => void
  isOpen: boolean
  onClose: () => void
  darkMode: boolean
  onToggleDarkMode: () => void
}

export function DocsSidebar({
  selectedDoc,
  onSelectDoc,
  onSelectSection,
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode
}: DocsSidebarProps) {
  const [expandedDocs, setExpandedDocs] = useState<string[]>([selectedDoc])

  const toggleExpand = (docId: string) => {
    setExpandedDocs(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    )
  }

  const handleDocClick = (doc: DocPage) => {
    onSelectDoc(doc.id)
    if (!expandedDocs.includes(doc.id)) {
      setExpandedDocs(prev => [...prev, doc.id])
    }
  }

  const handleSectionClick = (docId: string, sectionId: string) => {
    if (selectedDoc !== docId) {
      onSelectDoc(docId)
    }
    onSelectSection(sectionId)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 overflow-y-auto shadow-xl transition-transform duration-300 lg:sticky lg:translate-x-0 lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          darkMode
            ? 'bg-slate-900'
            : 'bg-white lg:border-r lg:border-teal-200'
        }`}
      >
        <div className="p-4">
          {/* Header with theme toggle (desktop) */}
          <div className="mb-4 flex items-center justify-between">
            <h2
              className={`text-lg font-semibold ${
                darkMode ? 'text-gray-100' : 'text-teal-900'
              }`}
            >
              Documentation
            </h2>
            {/* Desktop theme toggle */}
            <button
              onClick={onToggleDarkMode}
              className={`hidden rounded-lg p-2 transition-colors lg:block ${
                darkMode
                  ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                  : 'bg-[#134e4a] text-gray-100 hover:bg-[#0f3d3a]'
              }`}
              aria-label={
                darkMode ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
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

          <nav className="space-y-1">
            {docs.map(doc => (
              <div key={doc.id}>
                {/* Document title */}
                <button
                  onClick={() => handleDocClick(doc)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                    selectedDoc === doc.id
                      ? darkMode
                        ? 'bg-slate-800 text-yellow-400'
                        : 'bg-[#134e4a] text-gray-100'
                      : darkMode
                        ? 'text-gray-300 hover:bg-slate-800 hover:text-gray-100'
                        : 'text-gray-700 hover:bg-teal-50 hover:text-teal-800'
                  }`}
                >
                  <span>{doc.title}</span>
                  <svg
                    className={`size-4 transition-transform ${
                      expandedDocs.includes(doc.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Section links */}
                {expandedDocs.includes(doc.id) && (
                  <div
                    className={`ml-3 mt-1 space-y-1 border-l pl-3 ${
                      darkMode ? 'border-slate-700' : 'border-teal-200'
                    }`}
                  >
                    {doc.sections.map(section => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionClick(doc.id, section.id)}
                        className={`block w-full rounded px-2 py-1.5 text-left text-sm transition-colors ${
                          darkMode
                            ? 'text-gray-400 hover:bg-slate-800 hover:text-gray-200'
                            : 'text-gray-600 hover:bg-teal-50 hover:text-teal-700'
                        }`}
                      >
                        {section.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>
    </>
  )
}
