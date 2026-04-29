import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? ''
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? ''
const MODEL = "x-ai/grok-4.1-fast"
const MAX_BODY_BYTES = 64 * 1024
const MAX_QUESTION_CHARS = 4000
const MAX_NOTES = 8
const MAX_NOTE_TITLE_CHARS = 200
const MAX_NOTE_CONTENT_CHARS = 12000
const MAX_CONTEXT_CHARS = 50000
const USER_REQUESTS_PER_MINUTE = 12
const USER_REQUESTS_PER_DAY = 120
const IP_REQUESTS_PER_MINUTE = 30
const ONE_MINUTE_MS = 60 * 1000
const ONE_DAY_MS = 24 * 60 * 60 * 1000

interface ChatRequestBody {
  question?: unknown
  noteContents?: unknown
  mode?: unknown
}

interface NoteContent {
  title: string
  content: string
}

interface RateBucket {
  minute: number[]
  day: number[]
}

const rateBuckets = new Map<string, RateBucket>()

function json(status: number, body: unknown, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      ...headers,
    },
  })
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-nf-client-connection-ip')
    ?? req.headers.get('cf-connecting-ip')
    ?? req.headers.get('x-real-ip')
    ?? req.headers.get('x-forwarded-for')
    ?? ''

  return forwarded.split(',')[0]?.trim() || 'unknown'
}

function pruneWindow(values: number[], cutoff: number): number[] {
  return values.filter((value) => value > cutoff)
}

function checkRateLimit(key: string, perMinute: number, perDay: number): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now()
  const bucket = rateBuckets.get(key) ?? { minute: [], day: [] }
  bucket.minute = pruneWindow(bucket.minute, now - ONE_MINUTE_MS)
  bucket.day = pruneWindow(bucket.day, now - ONE_DAY_MS)

  if (bucket.minute.length >= perMinute) {
    const oldest = bucket.minute[0] ?? now
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + ONE_MINUTE_MS - now) / 1000)),
    }
  }

  if (bucket.day.length >= perDay) {
    const oldest = bucket.day[0] ?? now
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + ONE_DAY_MS - now) / 1000)),
    }
  }

  bucket.minute.push(now)
  bucket.day.push(now)
  rateBuckets.set(key, bucket)
  return { allowed: true }
}

function normalizeNotes(value: unknown): NoteContent[] {
  if (!Array.isArray(value)) {
    return []
  }

  let remainingChars = MAX_CONTEXT_CHARS
  const notes: NoteContent[] = []

  for (const rawNote of value.slice(0, MAX_NOTES)) {
    if (!rawNote || typeof rawNote !== 'object') {
      continue
    }

    const note = rawNote as Record<string, unknown>
    const title = String(note.title ?? 'Untitled').slice(0, MAX_NOTE_TITLE_CHARS)
    const rawContent = String(note.content ?? '')
    const contentLimit = Math.min(MAX_NOTE_CONTENT_CHARS, remainingChars)

    if (contentLimit <= 0) {
      break
    }

    const content = rawContent.slice(0, contentLimit)
    remainingChars -= content.length
    notes.push({ title, content })
  }

  return notes
}

async function readJsonBody(req: Request): Promise<ChatRequestBody | Response> {
  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return json(413, { error: 'Request is too large' })
  }

  const rawBody = await req.text()
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return json(413, { error: 'Request is too large' })
  }

  try {
    return JSON.parse(rawBody) as ChatRequestBody
  } catch {
    return json(400, { error: 'Invalid JSON body' })
  }
}

async function getAuthenticatedUserId(req: Request): Promise<string | Response> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return json(500, { error: 'Supabase auth service is not configured' })
  }

  const authorization = req.headers.get('authorization') ?? ''
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) {
    return json(401, { error: 'Sign in to use Folio AI' })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) {
    return json(401, { error: 'Invalid or expired session' })
  }

  return data.user.id
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' })
  }

  if (!OPENROUTER_API_KEY) {
    return json(500, { error: 'AI service is not configured' })
  }

  const ip = getClientIp(req)
  const ipLimit = checkRateLimit(`ip:${ip}`, IP_REQUESTS_PER_MINUTE, USER_REQUESTS_PER_DAY * 4)
  if (!ipLimit.allowed) {
    return json(429, { error: 'Too many AI requests. Try again shortly.' }, {
      'Retry-After': String(ipLimit.retryAfterSeconds ?? 60),
    })
  }

  const userId = await getAuthenticatedUserId(req)
  if (userId instanceof Response) {
    return userId
  }

  const userLimit = checkRateLimit(`user:${userId}`, USER_REQUESTS_PER_MINUTE, USER_REQUESTS_PER_DAY)
  if (!userLimit.allowed) {
    return json(429, { error: 'AI usage limit reached. Try again later.' }, {
      'Retry-After': String(userLimit.retryAfterSeconds ?? 60),
    })
  }

  const body = await readJsonBody(req)
  if (body instanceof Response) {
    return body
  }

  const question = typeof body.question === 'string' ? body.question.trim().slice(0, MAX_QUESTION_CHARS) : ''
  const noteContents = normalizeNotes(body.noteContents)
  const mode = body.mode === 'inline' ? 'inline' : 'chat'

  if (!question) {
    return json(400, { error: 'Missing "question" field' })
  }

  const contextBlock = noteContents
    .map(
      (n, i) =>
        `--- Note ${i + 1}: "${n.title}" ---\n${n.content}`
    )
    .join('\n\n')

  const inlineRule = `\n\nIMPORTANT: Output ONLY the requested content in markdown. Do NOT add any preamble, introduction, explanation, or closing remarks. For example, if asked for a shopping todo list, output only the list — no "Here's your list:" or "Let me know if you need anything else." Your output will be inserted directly into the user's note.`

  const isInline = mode === 'inline'

  let systemPrompt: string

  if (isInline) {
    systemPrompt = contextBlock
      ? `You are Folio AI, a writing assistant embedded in a note-taking app. Generate the content the user asks for. If they referenced notes, use them as context — but always fulfill the request even if the notes don't cover the topic. Never refuse or say you lack information.${inlineRule}\n\n${contextBlock}`
      : `You are Folio AI, a writing assistant embedded in a note-taking app. Generate whatever content the user asks for. Never refuse or say you lack information.${inlineRule}`
  } else {
    systemPrompt = contextBlock
      ? `You are Folio AI, a helpful assistant embedded in a note-taking app. The user has referenced the following notes as context for their question. Use these notes to provide an accurate, well-grounded answer. If the notes don't contain enough information to fully answer, say so.\n\n${contextBlock}`
      : `You are Folio AI, a helpful assistant embedded in a note-taking app. Answer the user's question concisely and helpfully.`
  }

  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: OPENROUTER_API_KEY,
  })

  try {
    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const delta = chunk.choices?.[0]?.delta?.content
            if (delta) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ token: delta })}\n\n`)
              )
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: (err as Error).message })}\n\n`
            )
          )
          controller.close()
        }
      },
    })

    return new Response(readable, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    console.error('AI upstream request failed', err)
    return json(502, { error: 'AI service request failed' })
  }
}

export const config = {
  path: '/.netlify/functions/chat',
}
