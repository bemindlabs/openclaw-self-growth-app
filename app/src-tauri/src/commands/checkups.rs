use tauri::State;
use crate::db::DbState;
use crate::models::{HealthCheckup, CreateHealthCheckup};

#[tauri::command]
pub fn list_health_checkups(state: State<DbState>, category: Option<String>) -> Result<Vec<HealthCheckup>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let (sql, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = match &category {
        Some(cat) => (
            "SELECT id, title, checkup_date, provider, category, results, notes, created_at FROM health_checkups WHERE category = ?1 ORDER BY checkup_date DESC".to_string(),
            vec![Box::new(cat.clone()) as Box<dyn rusqlite::types::ToSql>],
        ),
        None => (
            "SELECT id, title, checkup_date, provider, category, results, notes, created_at FROM health_checkups ORDER BY checkup_date DESC".to_string(),
            vec![],
        ),
    };

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let params_ref: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let entries = stmt
        .query_map(params_ref.as_slice(), |row| {
            Ok(HealthCheckup {
                id: row.get(0)?, title: row.get(1)?, checkup_date: row.get(2)?,
                provider: row.get(3)?, category: row.get(4)?, results: row.get(5)?,
                notes: row.get(6)?, created_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(entries)
}

#[tauri::command]
pub fn create_health_checkup(state: State<DbState>, data: CreateHealthCheckup) -> Result<HealthCheckup, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let checkup_date = data.checkup_date.unwrap_or_else(|| chrono::Local::now().format("%Y-%m-%d").to_string());
    let category = data.category.unwrap_or_else(|| "general".to_string());

    conn.execute(
        "INSERT INTO health_checkups (title, checkup_date, provider, category, results, notes) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![data.title, checkup_date, data.provider, category, data.results, data.notes],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, checkup_date, provider, category, results, notes, created_at FROM health_checkups WHERE id = ?1",
        [id],
        |row| Ok(HealthCheckup {
            id: row.get(0)?, title: row.get(1)?, checkup_date: row.get(2)?,
            provider: row.get(3)?, category: row.get(4)?, results: row.get(5)?,
            notes: row.get(6)?, created_at: row.get(7)?,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn update_health_checkup(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    checkup_date: Option<String>,
    provider: Option<String>,
    category: Option<String>,
    results: Option<String>,
    notes: Option<String>,
) -> Result<HealthCheckup, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title { conn.execute("UPDATE health_checkups SET title = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = checkup_date { conn.execute("UPDATE health_checkups SET checkup_date = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = provider { conn.execute("UPDATE health_checkups SET provider = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = category { conn.execute("UPDATE health_checkups SET category = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = results { conn.execute("UPDATE health_checkups SET results = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = notes { conn.execute("UPDATE health_checkups SET notes = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }

    conn.query_row(
        "SELECT id, title, checkup_date, provider, category, results, notes, created_at FROM health_checkups WHERE id = ?1",
        [id],
        |row| Ok(HealthCheckup {
            id: row.get(0)?, title: row.get(1)?, checkup_date: row.get(2)?,
            provider: row.get(3)?, category: row.get(4)?, results: row.get(5)?,
            notes: row.get(6)?, created_at: row.get(7)?,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_health_checkup(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM health_checkups WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}
