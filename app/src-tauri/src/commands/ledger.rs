use rusqlite::Connection;
use tauri::State;
use crate::db::DbState;
use crate::models::{LedgerEntry, CreateLedgerEntry, LedgerSummary};

const DEFAULT_CURRENCY: &str = "THB";

/// Returns the user-configured default currency from the settings table,
/// falling back to `DEFAULT_CURRENCY` when no value has been set.
fn get_default_currency(conn: &Connection) -> String {
    conn.query_row(
        "SELECT value FROM settings WHERE key = 'default_currency'",
        [],
        |row| row.get::<_, String>(0),
    )
    .unwrap_or_else(|_| DEFAULT_CURRENCY.to_string())
}

#[tauri::command]
pub fn list_ledger_entries(state: State<DbState>, category: Option<String>, limit: Option<i64>) -> Result<Vec<LedgerEntry>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(100);

    let (sql, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = match &category {
        Some(cat) => (
            "SELECT id, title, amount, currency, entry_type, category, description, entry_date, created_at FROM ledger_entries WHERE category = ?1 ORDER BY entry_date DESC, created_at DESC LIMIT ?2".to_string(),
            vec![Box::new(cat.clone()) as Box<dyn rusqlite::types::ToSql>, Box::new(limit)],
        ),
        None => (
            "SELECT id, title, amount, currency, entry_type, category, description, entry_date, created_at FROM ledger_entries ORDER BY entry_date DESC, created_at DESC LIMIT ?1".to_string(),
            vec![Box::new(limit) as Box<dyn rusqlite::types::ToSql>],
        ),
    };

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let params_ref: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let entries = stmt
        .query_map(params_ref.as_slice(), |row| {
            Ok(LedgerEntry {
                id: row.get(0)?,
                title: row.get(1)?,
                amount: row.get(2)?,
                currency: row.get(3)?,
                entry_type: row.get(4)?,
                category: row.get(5)?,
                description: row.get(6)?,
                entry_date: row.get(7)?,
                created_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(entries)
}

#[tauri::command]
pub fn create_ledger_entry(state: State<DbState>, data: CreateLedgerEntry) -> Result<LedgerEntry, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let currency = data.currency.unwrap_or_else(|| get_default_currency(&conn));
    let entry_type = data.entry_type.unwrap_or_else(|| "expense".to_string());
    let category = data.category.unwrap_or_else(|| "general".to_string());
    let entry_date = data.entry_date.unwrap_or_else(|| {
        chrono::Local::now().format("%Y-%m-%d").to_string()
    });

    conn.execute(
        "INSERT INTO ledger_entries (title, amount, currency, entry_type, category, description, entry_date) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![data.title, data.amount, currency, entry_type, category, data.description, entry_date],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        "SELECT id, title, amount, currency, entry_type, category, description, entry_date, created_at FROM ledger_entries WHERE id = ?1",
        [id],
        |row| Ok(LedgerEntry {
            id: row.get(0)?, title: row.get(1)?, amount: row.get(2)?, currency: row.get(3)?,
            entry_type: row.get(4)?, category: row.get(5)?, description: row.get(6)?,
            entry_date: row.get(7)?, created_at: row.get(8)?,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn update_ledger_entry(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    amount: Option<f64>,
    currency: Option<String>,
    entry_type: Option<String>,
    category: Option<String>,
    description: Option<String>,
    entry_date: Option<String>,
) -> Result<LedgerEntry, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title { conn.execute("UPDATE ledger_entries SET title = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = amount { conn.execute("UPDATE ledger_entries SET amount = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = currency { conn.execute("UPDATE ledger_entries SET currency = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = entry_type { conn.execute("UPDATE ledger_entries SET entry_type = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = category { conn.execute("UPDATE ledger_entries SET category = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = description { conn.execute("UPDATE ledger_entries SET description = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }
    if let Some(v) = entry_date { conn.execute("UPDATE ledger_entries SET entry_date = ?1 WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?; }

    conn.query_row(
        "SELECT id, title, amount, currency, entry_type, category, description, entry_date, created_at FROM ledger_entries WHERE id = ?1",
        [id],
        |row| Ok(LedgerEntry {
            id: row.get(0)?, title: row.get(1)?, amount: row.get(2)?, currency: row.get(3)?,
            entry_type: row.get(4)?, category: row.get(5)?, description: row.get(6)?,
            entry_date: row.get(7)?, created_at: row.get(8)?,
        }),
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_ledger_entry(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM ledger_entries WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_ledger_summary(state: State<DbState>, period: Option<String>) -> Result<LedgerSummary, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let days = match period.as_deref() {
        Some("week") => 7,
        Some("year") => 365,
        _ => 30, // default month
    };
    let interval = format!("-{days} days");

    let total_income: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM ledger_entries WHERE entry_type = 'income' AND entry_date >= date('now', ?1)",
        [&interval],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let total_expense: f64 = conn.query_row(
        "SELECT COALESCE(SUM(amount), 0) FROM ledger_entries WHERE entry_type = 'expense' AND entry_date >= date('now', ?1)",
        [&interval],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let default_currency = get_default_currency(&conn);
    let currency: String = conn.query_row(
        "SELECT COALESCE((SELECT currency FROM ledger_entries ORDER BY created_at DESC LIMIT 1), ?1)",
        rusqlite::params![default_currency],
        |row| row.get(0),
    ).map_err(|e| e.to_string())?;

    let mut stmt = conn.prepare(
        "SELECT category, SUM(amount) FROM ledger_entries WHERE entry_type = 'expense' AND entry_date >= date('now', ?1) GROUP BY category ORDER BY SUM(amount) DESC"
    ).map_err(|e| e.to_string())?;

    let by_category: Vec<(String, f64)> = stmt
        .query_map([&interval], |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(LedgerSummary {
        total_income,
        total_expense,
        balance: total_income - total_expense,
        currency,
        by_category,
    })
}
