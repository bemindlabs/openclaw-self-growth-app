use tauri::State;
use crate::db::DbState;
use crate::models::{JournalEntry, CreateJournalEntry};

#[tauri::command]
pub fn list_journal_entries(state: State<DbState>, limit: Option<i64>) -> Result<Vec<JournalEntry>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);
    let query = format!(
        "SELECT id, title, content, mood_rating, created_at, updated_at FROM journal_entries ORDER BY created_at DESC LIMIT {}",
        limit
    );

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let entries = stmt
        .query_map([], |row| {
            Ok(JournalEntry {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                mood_rating: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(entries)
}

#[tauri::command]
pub fn create_journal_entry(state: State<DbState>, data: CreateJournalEntry) -> Result<JournalEntry, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO journal_entries (title, content, mood_rating) VALUES (?1, ?2, ?3)",
        rusqlite::params![data.title, data.content, data.mood_rating],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, content, mood_rating, created_at, updated_at FROM journal_entries WHERE id = ?1",
        [id],
        |row| {
            Ok(JournalEntry {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                mood_rating: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_journal_entry(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    content: Option<String>,
    mood_rating: Option<i32>,
) -> Result<JournalEntry, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title {
        conn.execute("UPDATE journal_entries SET title = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = content {
        conn.execute("UPDATE journal_entries SET content = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = mood_rating {
        conn.execute("UPDATE journal_entries SET mood_rating = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    conn.execute("UPDATE journal_entries SET updated_at = datetime('now') WHERE id = ?1", [id]).map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, title, content, mood_rating, created_at, updated_at FROM journal_entries WHERE id = ?1",
        [id],
        |row| {
            Ok(JournalEntry {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                mood_rating: row.get(3)?,
                created_at: row.get(4)?,
                updated_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_journal_entry(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM journal_entries WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}
