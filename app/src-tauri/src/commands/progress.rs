use crate::db::DbState;
use crate::models::{CreateProgressEntry, DashboardStats, ProgressEntry};
use tauri::State;

#[tauri::command]
pub fn list_progress(
    state: State<DbState>,
    skill_id: Option<i64>,
    limit: Option<i64>,
) -> Result<Vec<ProgressEntry>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);

    let (query, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = match skill_id {
        Some(sid) => (
            "SELECT id, skill_id, learning_item_id, entry_type, value, notes, created_at FROM progress_entries WHERE skill_id = ?1 ORDER BY created_at DESC LIMIT ?2".to_string(),
            vec![Box::new(sid), Box::new(limit)],
        ),
        None => (
            "SELECT id, skill_id, learning_item_id, entry_type, value, notes, created_at FROM progress_entries ORDER BY created_at DESC LIMIT ?1".to_string(),
            vec![Box::new(limit)],
        ),
    };

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let params_ref: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let entries = stmt
        .query_map(params_ref.as_slice(), |row| {
            Ok(ProgressEntry {
                id: row.get(0)?,
                skill_id: row.get(1)?,
                learning_item_id: row.get(2)?,
                entry_type: row.get(3)?,
                value: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(entries)
}

#[tauri::command]
pub fn create_progress_entry(
    state: State<DbState>,
    data: CreateProgressEntry,
) -> Result<ProgressEntry, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO progress_entries (skill_id, learning_item_id, entry_type, value, notes) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![data.skill_id, data.learning_item_id, data.entry_type, data.value, data.notes],
    )
    .map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, skill_id, learning_item_id, entry_type, value, notes, created_at FROM progress_entries WHERE id = ?1",
        [id],
        |row| {
            Ok(ProgressEntry {
                id: row.get(0)?,
                skill_id: row.get(1)?,
                learning_item_id: row.get(2)?,
                entry_type: row.get(3)?,
                value: row.get(4)?,
                notes: row.get(5)?,
                created_at: row.get(6)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_dashboard_stats(state: State<DbState>) -> Result<DashboardStats, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let total_skills: i64 = conn
        .query_row("SELECT COUNT(*) FROM skills", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let total_learning_items: i64 = conn
        .query_row("SELECT COUNT(*) FROM learning_items", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let active_routines: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM routines WHERE is_active = 1",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let active_goals: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM goals WHERE status = 'active'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let completions_today: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM routine_logs WHERE date(completed_at) = date('now')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Calculate streak: consecutive days with at least one routine completion
    let current_streak: i64 = conn
        .query_row(
            "WITH RECURSIVE dates AS (
                SELECT date('now') as d
                UNION ALL
                SELECT date(d, '-1 day') FROM dates
                WHERE EXISTS (
                    SELECT 1 FROM routine_logs WHERE date(completed_at) = date(d, '-1 day')
                )
            )
            SELECT COUNT(*) - 1 FROM dates
            WHERE EXISTS (SELECT 1 FROM routine_logs WHERE date(completed_at) = d)
            OR d = date('now')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(DashboardStats {
        total_skills,
        total_learning_items,
        active_routines,
        active_goals,
        completions_today,
        current_streak,
    })
}
