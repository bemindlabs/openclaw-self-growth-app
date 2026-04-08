use crate::db::DbState;
use crate::models::{ChatConversation, ChatMessageRecord};
use tauri::State;

#[tauri::command]
pub fn list_conversations(state: State<'_, DbState>) -> Result<Vec<ChatConversation>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, title, created_at, updated_at FROM chat_conversations ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(ChatConversation {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_conversation(
    state: State<'_, DbState>,
    title: Option<String>,
) -> Result<ChatConversation, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let t = title.unwrap_or_else(|| "New Chat".to_string());

    conn.execute("INSERT INTO chat_conversations (title) VALUES (?1)", [&t])
        .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, created_at, updated_at FROM chat_conversations WHERE id = ?1",
        [id],
        |row| {
            Ok(ChatConversation {
                id: row.get(0)?,
                title: row.get(1)?,
                created_at: row.get(2)?,
                updated_at: row.get(3)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_conversation(
    state: State<'_, DbState>,
    id: i64,
    title: String,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE chat_conversations SET title = ?1, updated_at = datetime('now') WHERE id = ?2",
        rusqlite::params![title, id],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_conversation(state: State<'_, DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM chat_conversations WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_conversation_messages(
    state: State<'_, DbState>,
    conversation_id: i64,
) -> Result<Vec<ChatMessageRecord>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, conversation_id, role, content, created_at FROM chat_messages WHERE conversation_id = ?1 ORDER BY created_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([conversation_id], |row| {
            Ok(ChatMessageRecord {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_chat_message(
    state: State<'_, DbState>,
    conversation_id: i64,
    role: String,
    content: String,
) -> Result<ChatMessageRecord, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO chat_messages (conversation_id, role, content) VALUES (?1, ?2, ?3)",
        rusqlite::params![conversation_id, role, content],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();

    // Update conversation's updated_at
    conn.execute(
        "UPDATE chat_conversations SET updated_at = datetime('now') WHERE id = ?1",
        [conversation_id],
    )
    .map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, conversation_id, role, content, created_at FROM chat_messages WHERE id = ?1",
        [id],
        |row| {
            Ok(ChatMessageRecord {
                id: row.get(0)?,
                conversation_id: row.get(1)?,
                role: row.get(2)?,
                content: row.get(3)?,
                created_at: row.get(4)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}
