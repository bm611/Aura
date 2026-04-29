import type { NoteFile } from '../types'

import { supabase } from './supabase'

const SHARE_PATH_PREFIX = '/s/'

export interface SharedNoteData {
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

/**
 * Shared note snapshots.
 *
 * SQL to run once in the Supabase SQL editor:
 * ─────────────────────────────────────────────
 * create table shared_notes (
 *   id            uuid primary key default gen_random_uuid(),
 *   owner_user_id uuid references auth.users(id) on delete cascade not null,
 *   note_id       text not null,
 *   token         text unique not null,
 *   title         text not null default '',
 *   content       text not null default '',
 *   created_at    timestamptz not null,
 *   updated_at    timestamptz not null
 * );
 *
 * alter table shared_notes enable row level security;
 *
 * create policy "Users own their shared notes"
 *   on shared_notes for all
 *   using (auth.uid() = owner_user_id)
 *   with check (auth.uid() = owner_user_id);
 *
 * create index shared_notes_owner_user_id_idx
 *   on shared_notes(owner_user_id);
 *
 * create unique index shared_notes_owner_note_idx
 *   on shared_notes(owner_user_id, note_id);
 * ─────────────────────────────────────────────
 */

function createShareToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ''

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function createSharedNote(note: NoteFile, ownerUserId: string): Promise<string> {
  const sharedNote = {
    title: note.title || note.name || 'Untitled',
    content: note.content || '',
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  }

  const { data: existing, error: loadError } = await supabase
    .from('shared_notes')
    .select('id, token')
    .eq('owner_user_id', ownerUserId)
    .eq('note_id', note.id)
    .limit(1)
    .maybeSingle()

  if (loadError) {
    throw loadError
  }

  if (existing) {
    const { error } = await supabase
      .from('shared_notes')
      .update(sharedNote)
      .eq('id', existing.id)

    if (error) {
      throw error
    }

    return existing.token
  }

  const token = createShareToken()
  const { error } = await supabase
    .from('shared_notes')
    .insert({
      owner_user_id: ownerUserId,
      note_id: note.id,
      token,
      ...sharedNote,
    })

  if (error) {
    throw error
  }

  return token
}

export async function fetchSharedNote(token: string): Promise<SharedNoteData | null> {
  const response = await fetch(`/.netlify/functions/get-shared-note?token=${encodeURIComponent(token)}`, {
    cache: 'no-store',
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    let message = `Failed to load shared note (${response.status})`

    try {
      const body = await response.json() as { error?: string }
      if (body.error) {
        message = body.error
      }
    } catch {
      // Keep the default error message if the response body is not JSON.
    }

    throw new Error(message)
  }

  const body = await response.json() as { note?: SharedNoteData }
  return body.note ?? null
}

export function generateSharedNoteUrl(token: string): string {
  return `${window.location.origin}${SHARE_PATH_PREFIX}${encodeURIComponent(token)}`
}

export function getSharedNoteToken(pathname: string = window.location.pathname): string | null {
  const segments = pathname.split('/').filter(Boolean)

  if (segments[0] !== 's' || !segments[1]) {
    return null
  }

  return decodeURIComponent(segments[1])
}
