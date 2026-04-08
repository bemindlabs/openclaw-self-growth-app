use crate::db::DbState;
use crate::models::{CreateSkill, Skill};
use tauri::State;

#[tauri::command]
pub fn list_skills(state: State<DbState>) -> Result<Vec<Skill>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, category, target_level, current_level, created_at, updated_at FROM skills ORDER BY name")
        .map_err(|e| e.to_string())?;

    let skills = stmt
        .query_map([], |row| {
            Ok(Skill {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                target_level: row.get(3)?,
                current_level: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(skills)
}

#[tauri::command]
pub fn create_skill(state: State<DbState>, data: CreateSkill) -> Result<Skill, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let category = data.category.unwrap_or_else(|| "general".to_string());
    let target_level = data.target_level.unwrap_or(0);

    conn.execute(
        "INSERT INTO skills (name, category, target_level) VALUES (?1, ?2, ?3)",
        rusqlite::params![data.name, category, target_level],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    let skill = conn
        .query_row(
            "SELECT id, name, category, target_level, current_level, created_at, updated_at FROM skills WHERE id = ?1",
            [id],
            |row| {
                Ok(Skill {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    category: row.get(2)?,
                    target_level: row.get(3)?,
                    current_level: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .map_err(|e| e.to_string())?;

    Ok(skill)
}

#[tauri::command]
pub fn update_skill(
    state: State<DbState>,
    id: i64,
    name: Option<String>,
    category: Option<String>,
    target_level: Option<i32>,
    current_level: Option<i32>,
) -> Result<Skill, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = name {
        conn.execute(
            "UPDATE skills SET name = ?1, updated_at = datetime('now') WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = category {
        conn.execute(
            "UPDATE skills SET category = ?1, updated_at = datetime('now') WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = target_level {
        conn.execute(
            "UPDATE skills SET target_level = ?1, updated_at = datetime('now') WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = current_level {
        conn.execute(
            "UPDATE skills SET current_level = ?1, updated_at = datetime('now') WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, name, category, target_level, current_level, created_at, updated_at FROM skills WHERE id = ?1",
        [id],
        |row| {
            Ok(Skill {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                target_level: row.get(3)?,
                current_level: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_skill(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM skills WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
