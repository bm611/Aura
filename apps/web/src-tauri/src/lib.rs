mod chat;

use chat::chat_stream;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Folio.", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet, chat_stream])
        .run(tauri::generate_context!())
        .expect("error while running Folio");
}
