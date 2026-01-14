/**
 * Documentation Build Script
 *
 * Converts markdown files from docs-source/ into the TypeScript docs.ts file.
 *
 * Usage: node scripts/build-docs.js
 *
 * Markdown files should have frontmatter:
 * ---
 * id: unique-id
 * title: Document Title
 * description: Brief description
 * order: 1
 * ---
 *
 * ## Section Title
 * Content here...
 *
 * Images can be referenced as: ![Alt text](/docs-images/filename.png)
 * Images are served from public/docs-images/
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, cpSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const DOCS_SOURCE_DIR = join(__dirname, '..', 'docs-source')
const IMAGES_SOURCE_DIR = join(DOCS_SOURCE_DIR, 'images')
const IMAGES_DEST_DIR = join(__dirname, '..', 'public', 'docs-images')
const OUTPUT_FILE = join(__dirname, '..', 'src', 'data', 'docs.ts')

/**
 * Parse frontmatter from markdown content
 */
function parseFrontmatter(content) {
  // Normalize line endings to \n (handles Windows CRLF)
  content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
  const match = content.match(frontmatterRegex)

  if (!match) {
    throw new Error('Invalid frontmatter format')
  }

  const frontmatter = {}
  match[1].split('\n').forEach(line => {
    const [key, ...valueParts] = line.split(':')
    if (key && valueParts.length) {
      frontmatter[key.trim()] = valueParts.join(':').trim()
    }
  })

  return {
    frontmatter,
    content: match[2].trim()
  }
}

/**
 * Alert type configurations with colors (dark mode classes by default)
 * Light mode conversions are handled in DocsContent.tsx via getThemedContent()
 *
 * Color scheme:
 * - NOTE: Blue
 * - TIP: Green
 * - IMPORTANT: Purple
 * - WARNING: Yellow
 * - ERROR: Red
 */
const ALERT_TYPES = {
  NOTE: {
    icon: 'ℹ️',
    label: 'Note',
    bgClass: 'bg-blue-950/40',
    borderClass: 'border-blue-500',
    textClass: 'text-blue-300'
  },
  TIP: {
    icon: '💡',
    label: 'Tip',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-500',
    textClass: 'text-emerald-300'
  },
  IMPORTANT: {
    icon: '📌',
    label: 'Important',
    bgClass: 'bg-purple-950/40',
    borderClass: 'border-purple-500',
    textClass: 'text-purple-300'
  },
  WARNING: {
    icon: '⚠️',
    label: 'Warning',
    bgClass: 'bg-yellow-950/40',
    borderClass: 'border-yellow-500',
    textClass: 'text-yellow-300'
  },
  ERROR: {
    icon: '🚫',
    label: 'Error',
    bgClass: 'bg-red-950/40',
    borderClass: 'border-red-500',
    textClass: 'text-red-300'
  }
}

/**
 * Process GitHub-style alerts from blockquotes
 * Supports: > [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!ERROR]
 * Also supports custom labels: > [!NOTE Custom Label]
 */
function processGitHubAlerts(markdown) {
  // Match multi-line blockquote alerts: > [!TYPE] or > [!TYPE Custom Label]
  // Captures consecutive lines starting with >
  const alertBlockRegex = /^>\s*\[!(\w+)(?:\s+([^\]]+))?\]\s*\n((?:>\s*.*(?:\n|$))*)/gm

  return markdown.replace(alertBlockRegex, (match, type, customLabel, contentLines) => {
    const alertType = type.toUpperCase()
    const config = ALERT_TYPES[alertType]

    if (!config) {
      // Not a recognized alert type, return as normal blockquote
      return match
    }

    // Use custom label if provided, otherwise use default
    const label = customLabel ? customLabel.trim() : config.label

    // Process content lines (remove leading > and whitespace)
    const content = contentLines
      .split('\n')
      .map(line => line.replace(/^>\s?/, '').trim())
      .filter(line => line.length > 0)
      .join(' ')

    return `<div class="doc-alert doc-alert-${alertType.toLowerCase()} p-4 rounded-lg border mb-4 ${config.bgClass} ${config.borderClass}">
  <div class="flex items-start gap-3">
    <span class="text-lg flex-shrink-0">${config.icon}</span>
    <div>
      <div class="font-semibold mb-1 ${config.textClass}">${label}</div>
      <div>${convertInlineMarkdown(content)}</div>
    </div>
  </div>
</div>`
  })
}

/**
 * Convert markdown to HTML with styling classes
 */
function markdownToHtml(markdown) {
  let html = markdown

  // Process GitHub-style alerts first (before other blockquote processing)
  html = processGitHubAlerts(html)

  // Process legacy blockquotes with bold text (for backwards compatibility)
  html = html.replace(/^>\s*\*\*([^*]+)\*\*(.*)$/gm, (_, boldText, rest) => {
    // Warning/important blockquotes
    if (boldText.toLowerCase().includes('warning')) {
      const config = ALERT_TYPES.WARNING
      return `<div class="doc-alert doc-alert-warning p-4 rounded-lg border mb-4 ${config.bgClass} ${config.borderClass}">
  <div class="flex items-start gap-3">
    <span class="text-lg flex-shrink-0">${config.icon}</span>
    <div>
      <div class="font-semibold mb-1 ${config.textClass}">${boldText}</div>
      <div>${convertInlineMarkdown(rest)}</div>
    </div>
  </div>
</div>`
    }
    const config = ALERT_TYPES.NOTE
    return `<div class="doc-alert doc-alert-note p-4 rounded-lg border mb-4 ${config.bgClass} ${config.borderClass}">
  <div class="flex items-start gap-3">
    <span class="text-lg flex-shrink-0">${config.icon}</span>
    <div>${convertInlineMarkdown(`<strong>${boldText}</strong>${rest}`)}</div>
  </div>
</div>`
  })

  // Process remaining simple blockquotes
  html = html.replace(/^>\s*(.*)$/gm, (_, content) => {
    const config = ALERT_TYPES.NOTE
    return `<div class="doc-alert doc-alert-note p-4 rounded-lg border mb-4 ${config.bgClass} ${config.borderClass}">
  <div class="flex items-start gap-3">
    <span class="text-lg flex-shrink-0">${config.icon}</span>
    <div>${convertInlineMarkdown(content)}</div>
  </div>
</div>`
  })

  // Split into sections by h2 headers
  const sections = []
  const lines = html.split('\n')
  let currentSection = null
  let currentContent = []

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/)
    if (h2Match) {
      if (currentSection) {
        sections.push({
          title: currentSection,
          content: currentContent.join('\n')
        })
      }
      currentSection = h2Match[1].trim()
      currentContent = []
    } else if (currentSection) {
      currentContent.push(line)
    }
  }

  // Push the last section
  if (currentSection) {
    sections.push({
      title: currentSection,
      content: currentContent.join('\n')
    })
  }

  // Convert each section's content to HTML
  return sections.map(section => ({
    id: slugify(section.title),
    title: section.title,
    content: convertContentToHtml(section.content.trim())
  }))
}

/**
 * Convert section content to HTML
 */
function convertContentToHtml(content) {
  let html = content

  // Convert h3 headers
  html = html.replace(/^###\s+(.+)$/gm, '<h4 class="text-xl font-semibold text-yellow-400 mb-3 mt-8">$1</h4>')

  // Convert h4 headers
  html = html.replace(/^####\s+(.+)$/gm, '<h5 class="text-lg font-semibold text-emerald-400 mb-2 mt-6">$1</h5>')

  // Convert ordered lists
  html = html.replace(/^(\d+)\.\s+(.+)$/gm, '<li>$2</li>')
  html = html.replace(/(<li>.*<\/li>\n?)+/g, match => {
    return `<ol class="list-decimal list-inside space-y-2 mb-4">${match}</ol>`
  })

  // Convert unordered lists
  html = html.replace(/^-\s+(.+)$/gm, '<li class="ul-item">$1</li>')
  html = html.replace(/(<li class="ul-item">.*<\/li>\n?)+/g, match => {
    return `<ul class="list-disc list-inside space-y-2 mb-4">${match.replace(/class="ul-item"/g, '')}</ul>`
  })

  // Convert paragraphs (lines that aren't already HTML)
  const lines = html.split('\n')
  const processedLines = lines.map(line => {
    const trimmed = line.trim()
    if (!trimmed) return ''
    if (trimmed.startsWith('<')) return line
    return `<p class="mb-4">${trimmed}</p>`
  })
  html = processedLines.join('\n')

  // Convert inline markdown
  html = convertInlineMarkdown(html)

  // Convert images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg shadow-lg my-4 max-w-full" />')

  // Clean up empty paragraphs and fix nested tags
  html = html.replace(/<p class="mb-4"><\/p>/g, '')
  html = html.replace(/<p class="mb-4">(<(?:ul|ol|div|h4|h5)[^>]*>)/g, '$1')
  html = html.replace(/(<\/(?:ul|ol|div|h4|h5)>)<\/p>/g, '$1')

  return html
}

/**
 * Convert inline markdown (bold, italic, code, links)
 */
function convertInlineMarkdown(text) {
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')

  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1.5 py-0.5 rounded text-sm">$1</code>')

  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-emerald-400 hover:underline">$1</a>')

  return text
}

/**
 * Convert title to URL-friendly slug
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Escape string for TypeScript
 */
function escapeForTs(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')
}

/**
 * Main build function
 */
function build() {
  console.log('Building documentation...\n')

  // Copy images to public folder
  if (existsSync(IMAGES_SOURCE_DIR)) {
    console.log('Copying images to public/docs-images/')
    cpSync(IMAGES_SOURCE_DIR, IMAGES_DEST_DIR, { recursive: true })
  }

  // Read all markdown files
  const files = readdirSync(DOCS_SOURCE_DIR)
    .filter(f => f.endsWith('.md'))
    .sort()

  console.log(`Found ${files.length} markdown file(s):\n`)

  const docs = []

  for (const file of files) {
    console.log(`  Processing: ${file}`)
    const filePath = join(DOCS_SOURCE_DIR, file)
    const content = readFileSync(filePath, 'utf-8')

    try {
      const { frontmatter, content: markdownContent } = parseFrontmatter(content)

      if (!frontmatter.id || !frontmatter.title) {
        console.error(`    ERROR: Missing required frontmatter (id, title) in ${file}`)
        continue
      }

      const sections = markdownToHtml(markdownContent)

      docs.push({
        id: frontmatter.id,
        title: frontmatter.title,
        description: frontmatter.description || '',
        order: parseInt(frontmatter.order) || 999,
        sections
      })

      console.log(`    ✓ ${frontmatter.title} (${sections.length} sections)`)
    } catch (error) {
      console.error(`    ERROR: ${error.message}`)
    }
  }

  // Sort by order
  docs.sort((a, b) => a.order - b.order)

  // Generate TypeScript output
  const tsContent = `// AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
// Run "pnpm docs:build" to regenerate from markdown sources in docs-source/

export interface DocSection {
  id: string
  title: string
  content: string
}

export interface DocPage {
  id: string
  title: string
  description: string
  sections: DocSection[]
}

export const docs: DocPage[] = ${JSON.stringify(docs.map(d => ({
    id: d.id,
    title: d.title,
    description: d.description,
    sections: d.sections
  })), null, 2)}
`

  writeFileSync(OUTPUT_FILE, tsContent, 'utf-8')

  console.log(`\n✓ Generated ${OUTPUT_FILE}`)
  console.log(`  ${docs.length} document(s) with ${docs.reduce((sum, d) => sum + d.sections.length, 0)} total sections`)
}

// Run build
build()
