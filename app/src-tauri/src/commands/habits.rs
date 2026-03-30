use tauri::State;
use crate::db::DbState;
use crate::models::{Habit, CreateHabit, HabitLog};

#[tauri::command]
pub fn list_habits(state: State<DbState>) -> Result<Vec<Habit>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT id, name, description, frequency, color, is_active, created_at FROM habits WHERE is_active = 1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let habits = stmt
        .query_map([], |row| {
            Ok(Habit {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                color: row.get(4)?,
                is_active: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(habits)
}

#[tauri::command]
pub fn create_habit(state: State<DbState>, data: CreateHabit) -> Result<Habit, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let frequency = data.frequency.unwrap_or_else(|| "daily".to_string());
    let color = data.color.unwrap_or_else(|| "#6366f1".to_string());

    conn.execute(
        "INSERT INTO habits (name, description, frequency, color) VALUES (?1, ?2, ?3, ?4)",
        rusqlite::params![data.name, data.description, frequency, color],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, name, description, frequency, color, is_active, created_at FROM habits WHERE id = ?1",
        [id],
        |row| {
            Ok(Habit {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                color: row.get(4)?,
                is_active: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_habit(
    state: State<DbState>,
    id: i64,
    name: Option<String>,
    description: Option<String>,
    frequency: Option<String>,
    color: Option<String>,
    is_active: Option<bool>,
) -> Result<Habit, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = name {
        conn.execute("UPDATE habits SET name = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = description {
        conn.execute("UPDATE habits SET description = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = frequency {
        conn.execute("UPDATE habits SET frequency = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = color {
        conn.execute("UPDATE habits SET color = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = is_active {
        conn.execute("UPDATE habits SET is_active = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }

    conn.query_row(
        "SELECT id, name, description, frequency, color, is_active, created_at FROM habits WHERE id = ?1",
        [id],
        |row| {
            Ok(Habit {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                frequency: row.get(3)?,
                color: row.get(4)?,
                is_active: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_habit(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM habits WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn toggle_habit(state: State<DbState>, habit_id: i64, date: String) -> Result<bool, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let existing: Option<i64> = conn
        .query_row(
            "SELECT id FROM habit_logs WHERE habit_id = ?1 AND logged_date = ?2",
            rusqlite::params![habit_id, date],
            |row| row.get(0),
        )
        .ok();

    if let Some(log_id) = existing {
        conn.execute("DELETE FROM habit_logs WHERE id = ?1", [log_id])
            .map_err(|e| e.to_string())?;
        Ok(false)
    } else {
        conn.execute(
            "INSERT INTO habit_logs (habit_id, logged_date) VALUES (?1, ?2)",
            rusqlite::params![habit_id, date],
        )
        .map_err(|e| e.to_string())?;
        Ok(true)
    }
}

#[tauri::command]
pub fn get_habit_logs(state: State<DbState>, habit_id: i64, days: Option<i64>) -> Result<Vec<HabitLog>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let days = days.unwrap_or(30);
    let interval = format!("-{} days", days);
    let mut stmt = conn
        .prepare("SELECT id, habit_id, logged_date, notes, created_at FROM habit_logs WHERE habit_id = ?1 AND logged_date >= date('now', ?2) ORDER BY logged_date DESC")
        .map_err(|e| e.to_string())?;

    let logs = stmt
        .query_map(rusqlite::params![habit_id, interval], |row| {
            Ok(HabitLog {
                id: row.get(0)?,
                habit_id: row.get(1)?,
                logged_date: row.get(2)?,
                notes: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(logs)
}
