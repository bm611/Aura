const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function normalizeNote(note) {
  const fallbackTimestamp = note.updatedAt || note.createdAt || new Date().toISOString()

  return {
    ...note,
    title: typeof note.title === 'string' ? note.title : '',
    content: typeof note.content === 'string' ? note.content : '',
    tags: Array.isArray(note.tags) ? note.tags : [],
    createdAt: note.createdAt || fallbackTimestamp,
    updatedAt: note.updatedAt || note.createdAt || fallbackTimestamp,
  }
}

export function formatCreatedAt(createdAt) {
  const parsed = new Date(createdAt)

  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }

  return createdAtFormatter.format(parsed)
}

export function countBodyWords(content = '') {
  const plainText = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, ' $1 ')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, ' $1 ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, ' $1 ')
    .replace(/^>\s?/gm, ' ')
    .replace(/^#{1,6}\s+/gm, ' ')
    .replace(/^[-*+]\s+/gm, ' ')
    .replace(/^\d+\.\s+/gm, ' ')
    .replace(/[*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plainText) {
    return 0
  }

  const words = plainText.match(/\b[\p{L}\p{N}][\p{L}\p{N}'’-]*\b/gu)
  return words?.length ?? 0
}

export function getNoteDisplayTitle(note) {
  return note?.title?.trim() || 'Untitled'
}
