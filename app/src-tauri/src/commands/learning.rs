use crate::db::DbState;
use crate::models::{CreateLearningItem, LearningItem};
use tauri::State;

#[tauri::command]
pub fn list_learning_items(
    state: State<DbState>,
    status: Option<String>,
) -> Result<Vec<LearningItem>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let query = match status {
        Some(ref s) => format!(
            "SELECT id, title, description, item_type, source_url, status, skill_id, created_at, completed_at FROM learning_items WHERE status = '{}' ORDER BY created_at DESC",
            s.replace('\'', "''")
        ),
        None => "SELECT id, title, description, item_type, source_url, status, skill_id, created_at, completed_at FROM learning_items ORDER BY created_at DESC".to_string(),
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let items = stmt
        .query_map([], |row| {
            Ok(LearningItem {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                item_type: row.get(3)?,
                source_url: row.get(4)?,
                status: row.get(5)?,
                skill_id: row.get(6)?,
                created_at: row.get(7)?,
                completed_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(items)
}

#[tauri::command]
pub fn create_learning_item(
    state: State<DbState>,
    data: CreateLearningItem,
) -> Result<LearningItem, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO learning_items (title, description, item_type, source_url, skill_id) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![data.title, data.description, data.item_type, data.source_url, data.skill_id],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, description, item_type, source_url, status, skill_id, created_at, completed_at FROM learning_items WHERE id = ?1",
        [id],
        |row| {
            Ok(LearningItem {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                item_type: row.get(3)?,
                source_url: row.get(4)?,
                status: row.get(5)?,
                skill_id: row.get(6)?,
                created_at: row.get(7)?,
                completed_at: row.get(8)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_learning_item(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    source_url: Option<String>,
    skill_id: Option<i64>,
) -> Result<LearningItem, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title {
        conn.execute(
            "UPDATE learning_items SET title = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = description {
        conn.execute(
            "UPDATE learning_items SET description = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(ref v) = status {
        conn.execute(
            "UPDATE learning_items SET status = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
        if v == "completed" {
            conn.execute(
                "UPDATE learning_items SET completed_at = datetime('now') WHERE id = ?1",
                [id],
            )
            .map_err(|e| e.to_string())?;
        }
    }
    if let Some(v) = source_url {
        conn.execute(
            "UPDATE learning_items SET source_url = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = skill_id {
        conn.execute(
            "UPDATE learning_items SET skill_id = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, title, description, item_type, source_url, status, skill_id, created_at, completed_at FROM learning_items WHERE id = ?1",
        [id],
        |row| {
            Ok(LearningItem {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                item_type: row.get(3)?,
                source_url: row.get(4)?,
                status: row.get(5)?,
                skill_id: row.get(6)?,
                created_at: row.get(7)?,
                completed_at: row.get(8)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_learning_item(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM learning_items WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
