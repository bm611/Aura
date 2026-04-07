export interface AiChatRequest {
  question: string
  noteContents: { title: string; content: string }[]
  mode?: 'chat' | 'inline'
}

export interface AiStreamCallbacks {
  onToken: (token: string) => void
  onDone: () => void
  onError: (error: string) => void
}

function buildSystemPrompt(noteContents: { title: string; content: string }[]): string {
  const notesBlock = noteContents
    .map((n) => `## ${n.title}\n${n.content}`)
    .join('\n\n')

  return `You are a writing assistant embedded in the Folio note-taking app.
Answer concisely and helpfully.
${notesBlock ? `\n--- NOTES ---\n${notesBlock}` : ''}`
}

export async function streamAiChat(
  request: AiChatRequest,
  callbacks: AiStreamCallbacks,
  apiKey: string,
  signal?: AbortSignal
): Promise<void> {
  const { onToken, onDone, onError } = callbacks

  const systemPrompt = buildSystemPrompt(request.noteContents)

  let response: Response

  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'com.folio.mobile',
        'X-Title': 'Folio Mobile',
      },
      body: JSON.stringify({
        model: 'google/gemini-flash-1.5',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.question },
        ],
      }),
      signal,
    })
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    onError('Failed to connect to AI service.')
    return
  }

  if (!response.ok) {
    let message = `AI request failed (${response.status})`
    if (response.status === 429) {
      message = 'Rate limited — wait a moment and try again.'
    } else if (response.status === 401) {
      message = 'Invalid API key. Check your OpenRouter key in Settings.'
    }
    try {
      const text = await response.text()
      const body = JSON.parse(text)
      if (body.error) {
        message = typeof body.error === 'string' ? body.error : (body.error.message ?? message)
      }
    } catch {
      // keep default message
    }
    onError(message)
    return
  }

  const reader = response.body?.getReader()
  if (!reader) {
    onError('No response stream available.')
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data: ')) continue

        const data = trimmed.slice(6)
        if (data === '[DONE]') {
          onDone()
          return
        }

        try {
          // OpenRouter SSE format: { choices: [{ delta: { content: "..." } }] }
          const parsed = JSON.parse(data) as {
            choices?: { delta?: { content?: string } }[]
            error?: string | { message?: string }
          }
          if (parsed.error) {
            const errMsg = typeof parsed.error === 'string'
              ? parsed.error
              : (parsed.error.message ?? 'Unknown error')
            onError(errMsg)
            return
          }
          const token = parsed.choices?.[0]?.delta?.content
          if (token) onToken(token)
        } catch {
          // skip malformed SSE frames
        }
      }
    }

    onDone()
  } catch (err) {
    if ((err as Error).name === 'AbortError') return
    onError((err as Error).message || 'Stream interrupted.')
  } finally {
    reader.releaseLock()
  }
}
