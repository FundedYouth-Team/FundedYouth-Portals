import { useEffect, useRef } from 'react'
import { docs } from '../data/docs'

interface DocsContentProps {
  selectedDoc: string
  scrollToSection: string | null
  onScrollComplete: () => void
  darkMode: boolean
}

export function DocsContent({
  selectedDoc,
  scrollToSection,
  onScrollComplete,
  darkMode
}: DocsContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const doc = docs.find(d => d.id === selectedDoc)

  useEffect(() => {
    if (scrollToSection && contentRef.current) {
      const element = document.getElementById(scrollToSection)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        onScrollComplete()
      }
    }
  }, [scrollToSection, onScrollComplete])

  if (!doc) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
          Select a document from the sidebar
        </p>
      </div>
    )
  }

  // Generate theme-aware content by replacing dark mode classes with conditional ones
  const getThemedContent = (content: string) => {
    if (darkMode) {
      return content
    }
    // Replace dark mode specific classes with light mode equivalents
    return content
      .replace(/text-gray-300/g, 'text-gray-700')
      .replace(/text-gray-400/g, 'text-gray-500')
      .replace(/text-yellow-400/g, 'text-teal-700')
      .replace(/text-emerald-400/g, 'text-teal-600')
      .replace(/text-green-400/g, 'text-teal-600')
      .replace(/text-red-200/g, 'text-red-700')
      .replace(/bg-slate-800\/50/g, 'bg-teal-50')
      .replace(/bg-slate-800/g, 'bg-teal-50')
      .replace(/bg-teal-900\/50/g, 'bg-teal-100')
      .replace(/bg-red-900\/30/g, 'bg-red-50')
      .replace(/border-slate-700/g, 'border-teal-200')
      .replace(/border-teal-700/g, 'border-teal-300')
      .replace(/border-red-800/g, 'border-red-300')
      // Alert background colors (dark -> light)
      .replace(/bg-blue-950\/40/g, 'bg-blue-50')
      .replace(/bg-emerald-950\/40/g, 'bg-emerald-50')
      .replace(/bg-purple-950\/40/g, 'bg-purple-50')
      .replace(/bg-yellow-950\/40/g, 'bg-yellow-50')
      .replace(/bg-red-950\/40/g, 'bg-red-50')
      // Alert border colors (dark -> light with more accent)
      .replace(/border-blue-500/g, 'border-blue-400')
      .replace(/border-emerald-500/g, 'border-emerald-400')
      .replace(/border-purple-500/g, 'border-purple-400')
      .replace(/border-yellow-500/g, 'border-yellow-400')
      .replace(/border-red-500/g, 'border-red-400')
      // Alert text colors (dark -> light)
      .replace(/text-blue-300/g, 'text-blue-700')
      .replace(/text-emerald-300/g, 'text-emerald-700')
      .replace(/text-purple-300/g, 'text-purple-700')
      .replace(/text-yellow-300/g, 'text-yellow-700')
      .replace(/text-red-300/g, 'text-red-700')
  }

  return (
    <div ref={contentRef} className="h-full overflow-y-auto">
      <div className="mx-auto max-w-4xl px-6 py-8 lg:px-8">
        {/* Document header */}
        <header
          className={`mb-8 border-b pb-6 ${
            darkMode ? 'border-slate-700' : 'border-teal-200'
          }`}
        >
          <h1
            className={`text-3xl font-bold sm:text-4xl ${
              darkMode ? 'text-gray-100' : 'text-teal-900'
            }`}
          >
            {doc.title}
          </h1>
          <p
            className={`mt-2 text-lg ${
              darkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {doc.description}
          </p>
        </header>

        {/* Document sections */}
        <div className="space-y-12">
          {doc.sections.map(section => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2
                className={`mb-4 text-2xl font-semibold ${
                  darkMode ? 'text-gray-100' : 'text-teal-800'
                }`}
              >
                {section.title}
              </h2>
              <div
                className={`prose max-w-none ${
                  darkMode ? 'prose-invert text-gray-300' : 'text-gray-700'
                }`}
                dangerouslySetInnerHTML={{
                  __html: getThemedContent(section.content)
                }}
              />
            </section>
          ))}
        </div>

        {/* Bottom padding */}
        <div className="h-16" />
      </div>
    </div>
  )
}
