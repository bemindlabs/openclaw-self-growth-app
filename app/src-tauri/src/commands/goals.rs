use crate::db::DbState;
use crate::models::{CreateGoal, Goal};
use tauri::State;

#[tauri::command]
pub fn list_goals(state: State<DbState>, status: Option<String>) -> Result<Vec<Goal>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let query = match status {
        Some(ref s) => format!(
            "SELECT id, title, description, skill_id, target_date, status, created_at FROM goals WHERE status = '{}' ORDER BY target_date ASC NULLS LAST",
            s.replace('\'', "''")
        ),
        None => "SELECT id, title, description, skill_id, target_date, status, created_at FROM goals ORDER BY target_date ASC NULLS LAST".to_string(),
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let goals = stmt
        .query_map([], |row| {
            Ok(Goal {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                skill_id: row.get(3)?,
                target_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(goals)
}

#[tauri::command]
pub fn create_goal(state: State<DbState>, data: CreateGoal) -> Result<Goal, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO goals (title, description, skill_id, target_date) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![
            data.title,
            data.description,
            data.skill_id,
            data.target_date
        ],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, description, skill_id, target_date, status, created_at FROM goals WHERE id = ?1",
        [id],
        |row| {
            Ok(Goal {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                skill_id: row.get(3)?,
                target_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_goal(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    description: Option<String>,
    status: Option<String>,
    target_date: Option<String>,
    skill_id: Option<i64>,
) -> Result<Goal, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title {
        conn.execute(
            "UPDATE goals SET title = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = description {
        conn.execute(
            "UPDATE goals SET description = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = status {
        conn.execute(
            "UPDATE goals SET status = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = target_date {
        conn.execute(
            "UPDATE goals SET target_date = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }
    if let Some(v) = skill_id {
        conn.execute(
            "UPDATE goals SET skill_id = ?1 WHERE id = ?2",
            rusqlite::params![v, id],
        )
        .map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, title, description, skill_id, target_date, status, created_at FROM goals WHERE id = ?1",
        [id],
        |row| {
            Ok(Goal {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                skill_id: row.get(3)?,
                target_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_goal(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM goals WHERE id = ?1", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
