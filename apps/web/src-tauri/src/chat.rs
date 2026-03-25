use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::Emitter;

const OPENROUTER_BASE_URL: &str = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL: &str = "x-ai/grok-4.1-fast";

// ── Request / Response types ──────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct NoteContent {
    pub title: String,
    pub content: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChatRequest {
    pub question: String,
    pub note_contents: Vec<NoteContent>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "kind")]
pub enum ChatStreamEvent {
    #[serde(rename = "token")]
    Token { token: String },
    #[serde(rename = "done")]
    Done,
    #[serde(rename = "error")]
    Error { error: String },
}

// ── OpenRouter SSE parsing helpers ────────────────────────────────────

#[derive(Debug, Deserialize)]
struct OaiDelta {
    content: Option<String>,
}

#[derive(Debug, Deserialize)]
struct OaiChoice {
    delta: Option<OaiDelta>,
}

#[derive(Debug, Deserialize)]
struct OaiChunk {
    choices: Option<Vec<OaiChoice>>,
}

// ── Tauri command ─────────────────────────────────────────────────────

#[tauri::command]
pub async fn chat_stream(
    app: tauri::AppHandle,
    request: ChatRequest,
) -> Result<(), String> {
    let api_key = std::env::var("OPENROUTER_API_KEY").map_err(|_| {
        "OPENROUTER_API_KEY environment variable is not set. \
         Set it in your shell profile or launch Folio from a terminal with the variable exported."
            .to_string()
    })?;

    // Build system prompt (same logic as the Netlify function)
    let context_block: String = request
        .note_contents
        .iter()
        .enumerate()
        .map(|(i, n)| format!("--- Note {}: \"{}\" ---\n{}", i + 1, n.title, n.content))
        .collect::<Vec<_>>()
        .join("\n\n");

    let system_prompt = if context_block.is_empty() {
        "You are Folio AI, a helpful assistant embedded in a note-taking app. \
         Answer the user's question concisely and helpfully."
            .to_string()
    } else {
        format!(
            "You are Folio AI, a helpful assistant embedded in a note-taking app. \
             The user has referenced the following notes as context for their question. \
             Use these notes to provide an accurate, well-grounded answer. \
             If the notes don't contain enough information to fully answer, say so.\n\n{}",
            context_block
        )
    };

    let body = serde_json::json!({
        "model": DEFAULT_MODEL,
        "messages": [
            { "role": "system", "content": system_prompt },
            { "role": "user", "content": request.question },
        ],
        "stream": true,
    });

    let client = reqwest::Client::new();

    let response = client
        .post(OPENROUTER_BASE_URL)
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .header("HTTP-Referer", "https://folio.app")
        .header("X-Title", "Folio")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Failed to connect to OpenRouter: {}", e))?;

    if !response.status().is_success() {
        let status = response.status().as_u16();
        let text = response.text().await.unwrap_or_default();
        let msg = if status == 429 {
            "Rate limited — the model has usage limits. Wait a moment and try again.".to_string()
        } else {
            format!("OpenRouter API error ({}): {}", status, text)
        };
        let _ = app.emit("chat-stream", ChatStreamEvent::Error { error: msg.clone() });
        return Err(msg);
    }

    // Stream the response using SSE
    let mut stream = response.bytes_stream();
    let mut buffer = String::new();

    while let Some(chunk_result) = stream.next().await {
        let chunk = match chunk_result {
            Ok(bytes) => bytes,
            Err(e) => {
                let _ = app.emit(
                    "chat-stream",
                    ChatStreamEvent::Error {
                        error: format!("Stream error: {}", e),
                    },
                );
                return Err(format!("Stream error: {}", e));
            }
        };

        let text = String::from_utf8_lossy(&chunk);
        buffer.push_str(&text);

        // Process complete SSE lines
        while let Some(newline_pos) = buffer.find('\n') {
            let line = buffer[..newline_pos].trim().to_string();
            buffer = buffer[newline_pos + 1..].to_string();

            if line.is_empty() || !line.starts_with("data: ") {
                continue;
            }

            let data = &line[6..];

            if data == "[DONE]" {
                let _ = app.emit("chat-stream", ChatStreamEvent::Done);
                return Ok(());
            }

            if let Ok(parsed) = serde_json::from_str::<OaiChunk>(data) {
                if let Some(choices) = parsed.choices {
                    if let Some(choice) = choices.first() {
                        if let Some(delta) = &choice.delta {
                            if let Some(content) = &delta.content {
                                if !content.is_empty() {
                                    let _ = app.emit(
                                        "chat-stream",
                                        ChatStreamEvent::Token {
                                            token: content.clone(),
                                        },
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // Stream ended without [DONE] — still signal completion
    let _ = app.emit("chat-stream", ChatStreamEvent::Done);
    Ok(())
}
