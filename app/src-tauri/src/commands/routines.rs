use tauri::State;
use crate::db::DbState;
use crate::models::{CreateRoutine, CreateRoutineStep, Routine, RoutineLog, RoutineStep};

#[tauri::command]
pub fn list_routines(state: State<DbState>) -> Result<Vec<Routine>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, description, frequency, is_active, created_at FROM routines ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let routines = stmt
        .query_map([], |row| {
            Ok(Routine {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                is_active: row.get(4)?,
                created_at: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(routines)
}

#[tauri::command]
pub fn create_routine(state: State<DbState>, data: CreateRoutine) -> Result<Routine, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let frequency = data.frequency.unwrap_or_else(|| "daily".to_string());

    conn.execute(
        "INSERT INTO routines (name, description, frequency) VALUES (?1, ?2, ?3)",
        rusqlite::params![data.name, data.description, frequency],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, name, description, frequency, is_active, created_at FROM routines WHERE id = ?1",
        [id],
        |row| {
            Ok(Routine {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                is_active: row.get(4)?,
                created_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_routine(
    state: State<DbState>,
    id: i64,
    name: Option<String>,
    description: Option<String>,
    frequency: Option<String>,
    is_active: Option<bool>,
) -> Result<Routine, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = name {
        conn.execute("UPDATE routines SET name = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = description {
        conn.execute("UPDATE routines SET description = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = frequency {
        conn.execute("UPDATE routines SET frequency = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = is_active {
        conn.execute("UPDATE routines SET is_active = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, name, description, frequency, is_active, created_at FROM routines WHERE id = ?1",
        [id],
        |row| {
            Ok(Routine {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                is_active: row.get(4)?,
                created_at: row.get(5)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_routine(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM routines WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_routine_steps(state: State<DbState>, routine_id: i64) -> Result<Vec<RoutineStep>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, routine_id, title, duration_min, sort_order FROM routine_steps WHERE routine_id = ?1 ORDER BY sort_order")
        .map_err(|e| e.to_string())?;

    let steps = stmt
        .query_map([routine_id], |row| {
            Ok(RoutineStep {
                id: row.get(0)?,
                routine_id: row.get(1)?,
                title: row.get(2)?,
                duration_min: row.get(3)?,
                sort_order: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(steps)
}

#[tauri::command]
pub fn add_routine_step(state: State<DbState>, data: CreateRoutineStep) -> Result<RoutineStep, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO routine_steps (routine_id, title, duration_min, sort_order) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![data.routine_id, data.title, data.duration_min, data.sort_order],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, routine_id, title, duration_min, sort_order FROM routine_steps WHERE id = ?1",
        [id],
        |row| {
            Ok(RoutineStep {
                id: row.get(0)?,
                routine_id: row.get(1)?,
                title: row.get(2)?,
                duration_min: row.get(3)?,
                sort_order: row.get(4)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_routine_step(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM routine_steps WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn complete_routine(
    state: State<DbState>,
    routine_id: i64,
    notes: Option<String>,
    mood_rating: Option<i32>,
) -> Result<RoutineLog, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO routine_logs (routine_id, notes, mood_rating) VALUES (?1, ?2, ?3)",
        rusqlite::params![routine_id, notes, mood_rating],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, routine_id, completed_at, notes, mood_rating FROM routine_logs WHERE id = ?1",
        [id],
        |row| {
            Ok(RoutineLog {
                id: row.get(0)?,
                routine_id: row.get(1)?,
                completed_at: row.get(2)?,
                notes: row.get(3)?,
                mood_rating: row.get(4)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_routine_logs(state: State<DbState>, routine_id: i64, limit: Option<i64>) -> Result<Vec<RoutineLog>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(30);
    let mut stmt = conn
        .prepare("SELECT id, routine_id, completed_at, notes, mood_rating FROM routine_logs WHERE routine_id = ?1 ORDER BY completed_at DESC LIMIT ?2")
        .map_err(|e| e.to_string())?;

    let logs = stmt
        .query_map(rusqlite::params![routine_id, limit], |row| {
            Ok(RoutineLog {
                id: row.get(0)?,
                routine_id: row.get(1)?,
                completed_at: row.get(2)?,
                notes: row.get(3)?,
                mood_rating: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(logs)
}
