use crate::db::DbState;
use crate::models::{CreateProgressEntry, DashboardStats, LifeBalanceDomain, ProgressEntry};
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

#[tauri::command]
pub fn get_life_balance(state: State<DbState>) -> Result<Vec<LifeBalanceDomain>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    // Health: count of distinct days with health_metrics in last 30 days, normalize to 0-100
    let health_days: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT date(recorded_at)) FROM health_metrics WHERE recorded_at >= date('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let health_score = ((health_days as f64) / 30.0 * 100.0).min(100.0);

    // Habits: % of last 30 days that have at least one habit log
    let habit_days: i64 = conn
        .query_row(
            "SELECT COUNT(DISTINCT logged_date) FROM habit_logs WHERE logged_date >= date('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let habit_score = ((habit_days as f64) / 30.0 * 100.0).min(100.0);

    // Skills: average of (current_level / target_level * 100) across all skills where target_level > 0
    let skill_score: f64 = {
        let raw: f64 = conn
            .query_row(
                "SELECT COALESCE(AVG(CAST(current_level AS REAL) / CAST(target_level AS REAL) * 100.0), 0.0) FROM skills WHERE target_level > 0",
                [],
                |row| row.get::<_, f64>(0),
            )
            .unwrap_or(0.0_f64);
        raw.min(100.0_f64)
    };

    // Learning: % of items with status 'completed' or 'in_progress'
    let total_learning: i64 = conn
        .query_row("SELECT COUNT(*) FROM learning_items", [], |row| row.get(0))
        .unwrap_or(0);
    let active_learning: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM learning_items WHERE status IN ('completed', 'in_progress')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let learning_score = if total_learning > 0 {
        (active_learning as f64) / (total_learning as f64) * 100.0
    } else {
        0.0
    };

    // Goals: % of goals with status 'active' or 'completed'
    let total_goals: i64 = conn
        .query_row("SELECT COUNT(*) FROM goals", [], |row| row.get(0))
        .unwrap_or(0);
    let engaged_goals: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM goals WHERE status IN ('active', 'completed')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let goals_score = if total_goals > 0 {
        (engaged_goals as f64) / (total_goals as f64) * 100.0
    } else {
        0.0
    };

    // Journal: count of entries in last 30 days, capped at 30 = 100%
    let journal_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM journal_entries WHERE created_at >= date('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let journal_score = ((journal_count as f64) / 30.0 * 100.0).min(100.0);

    // Finance: count of ledger entries in last 30 days, capped at 30 = 100%
    let finance_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM ledger_entries WHERE created_at >= date('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);
    let finance_score = ((finance_count as f64) / 30.0 * 100.0).min(100.0);

    Ok(vec![
        LifeBalanceDomain {
            domain: "Health".to_string(),
            score: health_score,
        },
        LifeBalanceDomain {
            domain: "Habits".to_string(),
            score: habit_score,
        },
        LifeBalanceDomain {
            domain: "Skills".to_string(),
            score: skill_score,
        },
        LifeBalanceDomain {
            domain: "Learning".to_string(),
            score: learning_score,
        },
        LifeBalanceDomain {
            domain: "Goals".to_string(),
            score: goals_score,
        },
        LifeBalanceDomain {
            domain: "Journal".to_string(),
            score: journal_score,
        },
        LifeBalanceDomain {
            domain: "Finance".to_string(),
            score: finance_score,
        },
    ])
}
