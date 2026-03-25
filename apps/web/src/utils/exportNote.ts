import type { NoteFile } from '../types'
import { docToMarkdown } from '../editor/markdown/markdownConversion'

function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window
}

function getFileName(note: NoteFile): string {
  const title = note.title?.trim() || 'untitled'
  return (
    title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '') + '.md'
  )
}

async function exportNativeTauri(markdown: string, fileName: string): Promise<void> {
  const { save } = await import('@tauri-apps/plugin-dialog')
  const { writeTextFile } = await import('@tauri-apps/plugin-fs')

  const filePath = await save({
    defaultPath: fileName,
    filters: [{ name: 'Markdown', extensions: ['md'] }],
  })

  if (filePath) {
    await writeTextFile(filePath, markdown)
  }
}

function exportBrowserDownload(markdown: string, fileName: string): void {
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function exportNoteAsMarkdown(note: NoteFile): Promise<void> {
  const markdown = note.contentDoc ? docToMarkdown(note.contentDoc) : note.content || ''
  const fileName = getFileName(note)

  if (isTauri()) {
    await exportNativeTauri(markdown, fileName)
  } else {
    exportBrowserDownload(markdown, fileName)
  }
}
