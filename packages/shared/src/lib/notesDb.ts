import { getSupabase } from './supabase'

interface DbRow {
  id: string
  user_id: string
  title: string
  content: string
  content_doc: Record<string, unknown> | null
  tags: string[]
  parent_id: string | null
  type: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface AppNote {
  id: string
  type?: string
  name?: string
  title?: string
  content?: string
  contentDoc?: Record<string, unknown> | null
  editorVersion?: number
  tags?: string[]
  parentId?: string | null
  deletedAt?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  children?: AppNote[]
  wordGoal?: number | null
}

function rowToNote(row: DbRow): AppNote {
  return {
    id: row.id,
    type: row.type || 'file',
    name: row.title || 'Untitled',
    title: row.title || '',
    content: row.content || '',
    contentDoc: row.content_doc || undefined,
    editorVersion: row.content_doc ? 2 : undefined,
    tags: row.tags || [],
    parentId: row.parent_id || null,
    deletedAt: row.deleted_at || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    ...(row.type === 'folder' ? { children: [] } : {}),
  }
}

function noteToRow(note: AppNote, userId: string): Record<string, unknown> {
  return {
    id: note.id,
    user_id: userId,
    title: note.title || note.name || '',
    content: note.content || '',
    content_doc: note.contentDoc || null,
    tags: note.tags || [],
    parent_id: note.parentId || null,
    type: note.type || 'file',
    created_at: note.createdAt || null,
    updated_at: note.updatedAt || note.createdAt || null,
    deleted_at: note.deletedAt || null,
  }
}

export async function fetchNotes(userId: string): Promise<AppNote[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return (data || []).map((row: DbRow) => rowToNote(row))
}

export async function upsertNote(note: AppNote, userId: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('notes')
    .upsert(noteToRow(note, userId), { onConflict: 'id' })

  if (error) throw error
}

export async function deleteNote(id: string): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) throw error
}

export async function softDeleteNotes(ids: string[]): Promise<void> {
  if (!ids?.length) return

  const supabase = getSupabase()
  const { error } = await supabase
    .from('notes')
    .update({ deleted_at: new Date().toISOString() })
    .in('id', ids)

  if (error) throw error
}

export async function restoreNotes(notes: AppNote[], userId: string): Promise<void> {
  if (!notes?.length) return

  const supabase = getSupabase()
  const rows = notes.map((note) => ({
    ...noteToRow({ ...note, deletedAt: null }, userId),
    deleted_at: null,
  }))

  const { error } = await supabase
    .from('notes')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw error
}
