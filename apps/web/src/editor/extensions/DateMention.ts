import { Node, mergeAttributes } from '@tiptap/core'

function formatDateChip(isoDate: string): string {
  const d = new Date(isoDate)
  const day = String(d.getDate()).padStart(2, '0')
  const mon = d.toLocaleString('en-US', { month: 'short' })
  const year = d.getFullYear()
  return `${day}-${mon}-${year}`
}

export const DateMention = Node.create({
  name: 'dateMention',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      date: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-date-mention]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-date-mention': node.attrs.date,
        class: 'folio-date-mention',
      }),
      formatDateChip(node.attrs.date),
    ]
  },
})
