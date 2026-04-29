import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  if (req.method !== 'GET') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(500, { error: 'Supabase share service is not configured' })
  }

  const token = new URL(req.url).searchParams.get('token')?.trim()

  if (!token) {
    return json(400, { error: 'Missing token' })
  }

  if (!SHARE_TOKEN_PATTERN.test(token)) {
    return json(400, { error: 'Invalid token' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase
    .from('shared_notes')
    .select('title, content, created_at, updated_at')
    .eq('token', token)
    .limit(1)
    .maybeSingle()

  if (error) {
    return json(500, { error: 'Failed to load shared note' })
  }

  if (!data) {
    return json(404, { error: 'Shared note not found' })
  }

  return json(200, {
    note: {
      title: data.title || 'Untitled',
      content: data.content || '',
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    },
  })
}

export const config = {
  path: '/.netlify/functions/get-shared-note',
}
