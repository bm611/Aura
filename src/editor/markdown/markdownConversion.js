import MarkdownIt from 'markdown-it'
import markdownItTaskLists from 'markdown-it-task-lists'
import { generateJSON } from '@tiptap/core'

const CALLOUT_TITLE_FALLBACKS = {
  abstract: 'Abstract',
  bug: 'Bug',
  caution: 'Caution',
  danger: 'Danger',
  example: 'Example',
  failure: 'Failure',
  important: 'Important',
  info: 'Info',
  note: 'Note',
  question: 'Question',
  quote: 'Quote',
  success: 'Success',
  tip: 'Tip',
  todo: 'Todo',
  warning: 'Warning',
}

const CALLOUT_BLOCK_PATTERN = /^> \[!([A-Za-z-]+)\]([+-])?\s*(.*)$/
const MARKDOWN_PATTERN = /(^#{1,6}\s)|(```)|(^[-*+]\s)|(^\d+\.\s)|(^- \[[ xX]\]\s)|(^> \[!)|(\|.+\|)|(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/m

const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
})

markdown.use(markdownItTaskLists, { enabled: true })

function escapeAttribute(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function getDefaultCalloutTitle(type = 'note') {
  return CALLOUT_TITLE_FALLBACKS[type] || `${type.charAt(0).toUpperCase()}${type.slice(1)}`
}

function normalizeTaskListHtml(html) {
  if (typeof document === 'undefined') {
    return html
  }

  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('ul.contains-task-list').forEach((list) => {
    list.setAttribute('data-type', 'taskList')
    list.classList.remove('contains-task-list')
  })

  template.content.querySelectorAll('li.task-list-item').forEach((item) => {
    const checkbox = item.querySelector('input.task-list-item-checkbox')
    const checked = checkbox?.hasAttribute('checked') || false

    item.setAttribute('data-type', 'taskItem')
    item.setAttribute('data-checked', checked ? 'true' : 'false')
    item.classList.remove('task-list-item', 'enabled')
    checkbox?.remove()
  })

  return template.innerHTML
}

function renderMarkdownChunk(chunk = '') {
  if (!chunk.trim()) {
    return ''
  }

  return normalizeTaskListHtml(markdown.render(chunk))
}

function renderCalloutBlock(raw = '') {
  const lines = raw.split('\n')
  const firstLine = lines[0] || ''
  const match = firstLine.match(CALLOUT_BLOCK_PATTERN)

  if (!match) {
    return renderMarkdownChunk(raw)
  }

  const calloutType = match[1].toLowerCase()
  const foldMarker = match[2] || ''
  const title = match[3]?.trim() || getDefaultCalloutTitle(calloutType)
  const foldable = foldMarker === '-' || foldMarker === '+'
  const defaultCollapsed = foldMarker === '-'
  const bodyMarkdown = lines
    .slice(1)
    .map((line) => line.replace(/^> ?/, ''))
    .join('\n')
    .trim()

  const bodyHtml = renderMarkdownChunk(bodyMarkdown) || '<p></p>'

  return `<div data-type="callout" data-callout-kind="${escapeAttribute(calloutType)}" data-callout-title="${escapeAttribute(title)}" data-callout-foldable="${foldable ? 'true' : 'false'}" data-callout-collapsed="${defaultCollapsed ? 'true' : 'false'}">${bodyHtml}</div>`
}

export function looksLikeMarkdown(text = '') {
  return MARKDOWN_PATTERN.test(text)
}

export function markdownToHTML(content = '') {
  if (!content.trim()) {
    return '<p></p>'
  }

  const lines = content.split('\n')
  const rendered = []
  const chunk = []

  const flushChunk = () => {
    if (chunk.length) {
      rendered.push(renderMarkdownChunk(chunk.join('\n')))
      chunk.length = 0
    }
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]

    if (CALLOUT_BLOCK_PATTERN.test(line)) {
      flushChunk()

      const calloutLines = [line]
      while (index + 1 < lines.length && /^> ?/.test(lines[index + 1])) {
        index += 1
        calloutLines.push(lines[index])
      }

      rendered.push(renderCalloutBlock(calloutLines.join('\n')))
      continue
    }

    chunk.push(line)
  }

  flushChunk()

  return rendered.filter(Boolean).join('\n')
}

function escapeMarkdownText(text = '') {
  return text
    .replaceAll('\\', '\\\\')
    .replaceAll('*', '\\*')
    .replaceAll('_', '\\_')
    .replaceAll('[', '\\[')
    .replaceAll(']', '\\]')
    .replaceAll('`', '\\`')
}

function wrapCode(text = '') {
  const fence = text.includes('`') ? '``' : '`'
  return `${fence}${text}${fence}`
}

function renderTextNode(node) {
  const text = node?.text || ''
  const marks = node?.marks || []

  if (!marks.length) {
    return escapeMarkdownText(text)
  }

  const codeMark = marks.find((mark) => mark.type === 'code')
  if (codeMark) {
    return wrapCode(text)
  }

  let value = escapeMarkdownText(text)

  marks.forEach((mark) => {
    if (mark.type === 'link') {
      value = `[${value}](${mark.attrs?.href || ''})`
      return
    }

    if (mark.type === 'bold') {
      value = `**${value}**`
      return
    }

    if (mark.type === 'italic') {
      value = `*${value}*`
      return
    }

    if (mark.type === 'strike') {
      value = `~~${value}~~`
    }
  })

  return value
}

function renderInline(nodes = []) {
  return nodes
    .map((node) => {
      if (!node) {
        return ''
      }

      if (node.type === 'text') {
        return renderTextNode(node)
      }

      if (node.type === 'hardBreak') {
        return '  \n'
      }

      if (node.type === 'paragraph') {
        return renderInline(node.content || [])
      }

      return renderInline(node.content || [])
    })
    .join('')
}

function indentLines(text = '', spaces = 2) {
  const indent = ' '.repeat(spaces)
  return text
    .split('\n')
    .map((line) => (line ? `${indent}${line}` : indent.trimEnd()))
    .join('\n')
}

function prefixBlock(text = '', prefix = '> ') {
  return text
    .split('\n')
    .map((line) => `${prefix}${line}`)
    .join('\n')
}

function renderListItemContent(node, depth, listType, index = 1) {
  const children = node.content || []
  const firstChild = children[0]
  const rest = children.slice(1)

  let lead = ''
  if (firstChild?.type === 'paragraph') {
    lead = renderInline(firstChild.content || [])
  } else if (firstChild) {
    lead = renderNode(firstChild, depth + 1)
  }

  const prefix = listType === 'ordered' ? `${index}. ` : '- '
  const base = `${'  '.repeat(depth)}${prefix}${lead}`.trimEnd()

  if (!rest.length) {
    return base
  }

  const nested = rest
    .map((child) => renderNode(child, depth + 1))
    .filter(Boolean)
    .join('\n')

  return `${base}\n${indentLines(nested)}`
}

function renderTaskItemContent(node, depth) {
  const children = node.content || []
  const firstChild = children[0]
  const rest = children.slice(1)
  const prefix = `${'  '.repeat(depth)}- [${node.attrs?.checked ? 'x' : ' '}] `
  const lead = firstChild?.type === 'paragraph' ? renderInline(firstChild.content || []) : renderNode(firstChild, depth + 1)
  const base = `${prefix}${lead || ''}`.trimEnd()

  if (!rest.length) {
    return base
  }

  const nested = rest
    .map((child) => renderNode(child, depth + 1))
    .filter(Boolean)
    .join('\n')

  return `${base}\n${indentLines(nested)}`
}

function renderTableCell(node) {
  return (node.content || [])
    .map((child) => {
      if (child.type === 'paragraph') {
        return renderInline(child.content || [])
      }

      return renderInline(child.content || [])
    })
    .join(' ')
    .replace(/\n+/g, ' ')
    .trim()
}

function renderTable(node) {
  const rows = node.content || []
  if (!rows.length) {
    return ''
  }

  const headerCells = rows[0]?.content || []
  const header = headerCells.map(renderTableCell)
  const divider = header.map(() => '---')
  const bodyRows = rows.slice(1).map((row) => (row.content || []).map(renderTableCell))

  return [
    `| ${header.join(' | ')} |`,
    `| ${divider.join(' | ')} |`,
    ...bodyRows.map((row) => `| ${row.join(' | ')} |`),
  ].join('\n')
}

function renderNode(node, depth = 0) {
  if (!node) {
    return ''
  }

  switch (node.type) {
    case 'paragraph':
      return renderInline(node.content || [])
    case 'heading':
      return `${'#'.repeat(node.attrs?.level || 1)} ${renderInline(node.content || [])}`.trim()
    case 'bulletList':
      return (node.content || [])
        .map((item) => renderListItemContent(item, depth, 'bullet'))
        .join('\n')
    case 'orderedList': {
      const start = Number(node.attrs?.start || 1)
      return (node.content || [])
        .map((item, index) => renderListItemContent(item, depth, 'ordered', start + index))
        .join('\n')
    }
    case 'taskList':
      return (node.content || [])
        .map((item) => renderTaskItemContent(item, depth))
        .join('\n')
    case 'blockquote': {
      const rendered = renderNodes(node.content || []).trim()
      return rendered ? prefixBlock(rendered, '> ') : '>'
    }
    case 'codeBlock': {
      const language = node.attrs?.language || ''
      const code = (node.content || [])
        .map((child) => child.text || '')
        .join('')
      return `\`\`\`${language}\n${code}\n\`\`\``
    }
    case 'horizontalRule':
      return '---'
    case 'table':
      return renderTable(node)
    case 'callout': {
      const calloutType = node.attrs?.calloutKind || 'note'
      const title = node.attrs?.title || getDefaultCalloutTitle(calloutType)
      const foldable = Boolean(node.attrs?.foldable)
      const defaultCollapsed = Boolean(node.attrs?.defaultCollapsed)
      const marker = foldable ? (defaultCollapsed ? '-' : '+') : ''
      const header = `> [!${calloutType}]${marker}${title ? ` ${title}` : ''}`
      const body = renderNodes(node.content || []).trim()

      if (!body) {
        return header
      }

      return `${header}\n${prefixBlock(body, '> ')}`
    }
    default:
      return renderNodes(node.content || [])
  }
}

function renderNodes(nodes = []) {
  return nodes
    .map((node) => renderNode(node))
    .filter((value) => value !== '')
    .join('\n\n')
}

export function docToMarkdown(doc) {
  if (!doc?.content?.length) {
    return ''
  }

  return renderNodes(doc.content).replace(/\n{3,}/g, '\n\n').trim()
}

export function markdownToDoc(content = '', extensions = []) {
  return generateJSON(markdownToHTML(content), extensions)
}

