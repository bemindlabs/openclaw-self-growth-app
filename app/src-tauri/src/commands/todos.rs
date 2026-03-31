use tauri::State;
use crate::db::DbState;
use crate::models::{Todo, CreateTodo};

const TODO_COLUMNS: &str = "id, title, description, due_date, due_time, priority, status, category, goal_id, completed_at, created_at, updated_at";

fn row_to_todo(row: &rusqlite::Row) -> rusqlite::Result<Todo> {
    Ok(Todo {
        id: row.get(0)?,
        title: row.get(1)?,
        description: row.get(2)?,
        due_date: row.get(3)?,
        due_time: row.get(4)?,
        priority: row.get(5)?,
        status: row.get(6)?,
        category: row.get(7)?,
        goal_id: row.get(8)?,
        completed_at: row.get(9)?,
        created_at: row.get(10)?,
        updated_at: row.get(11)?,
    })
}

#[tauri::command]
pub fn list_todos(
    state: State<DbState>,
    status: Option<String>,
    priority: Option<String>,
    days: Option<i64>,
) -> Result<Vec<Todo>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let mut sql = format!("SELECT {} FROM todos WHERE 1=1", TODO_COLUMNS);
    let mut params: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();
    let mut idx = 1;

    if let Some(ref s) = status {
        sql.push_str(&format!(" AND status = ?{idx}"));
        params.push(Box::new(s.clone()));
        idx += 1;
    }
    if let Some(ref p) = priority {
        sql.push_str(&format!(" AND priority = ?{idx}"));
        params.push(Box::new(p.clone()));
        idx += 1;
    }
    if let Some(d) = days {
        let interval = format!("{} days", d);
        sql.push_str(&format!(" AND (due_date IS NULL OR due_date <= date('now', ?{idx}))"));
        params.push(Box::new(interval));
    }

    sql.push_str(" ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC NULLS LAST, created_at DESC");

    let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();
    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let todos = stmt
        .query_map(param_refs.as_slice(), row_to_todo)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(todos)
}

#[tauri::command]
pub fn create_todo(state: State<DbState>, data: CreateTodo) -> Result<Todo, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let priority = data.priority.unwrap_or_else(|| "medium".to_string());

    conn.execute(
        "INSERT INTO todos (title, description, due_date, due_time, priority, category, goal_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
        rusqlite::params![data.title, data.description, data.due_date, data.due_time, priority, data.category, data.goal_id],
    ).map_err(|e| e.to_string())?;

    let id = conn.last_insert_rowid();
    conn.query_row(
        &format!("SELECT {} FROM todos WHERE id = ?1", TODO_COLUMNS),
        [id],
        row_to_todo,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
#[allow(clippy::too_many_arguments)]
pub fn update_todo(
    state: State<DbState>,
    id: i64,
    title: Option<String>,
    description: Option<String>,
    due_date: Option<String>,
    due_time: Option<String>,
    priority: Option<String>,
    status: Option<String>,
    category: Option<String>,
    goal_id: Option<i64>,
) -> Result<Todo, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    if let Some(v) = title {
        conn.execute("UPDATE todos SET title = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = description {
        conn.execute("UPDATE todos SET description = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = due_date {
        conn.execute("UPDATE todos SET due_date = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = due_time {
        conn.execute("UPDATE todos SET due_time = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = priority {
        conn.execute("UPDATE todos SET priority = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(ref v) = status {
        conn.execute("UPDATE todos SET status = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
        if v == "completed" {
            conn.execute("UPDATE todos SET completed_at = datetime('now') WHERE id = ?1 AND completed_at IS NULL", [id]).map_err(|e| e.to_string())?;
        }
    }
    if let Some(v) = category {
        conn.execute("UPDATE todos SET category = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }
    if let Some(v) = goal_id {
        conn.execute("UPDATE todos SET goal_id = ?1, updated_at = datetime('now') WHERE id = ?2", rusqlite::params![v, id]).map_err(|e| e.to_string())?;
    }

    conn.query_row(
        &format!("SELECT {} FROM todos WHERE id = ?1", TODO_COLUMNS),
        [id],
        row_to_todo,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_todo(state: State<DbState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM todos WHERE id = ?1", [id]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn complete_todo(state: State<DbState>, id: i64) -> Result<Todo, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE todos SET status = 'completed', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?1",
        [id],
    ).map_err(|e| e.to_string())?;

    conn.query_row(
        &format!("SELECT {} FROM todos WHERE id = ?1", TODO_COLUMNS),
        [id],
        row_to_todo,
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_overdue_todos(state: State<DbState>) -> Result<Vec<Todo>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(&format!(
            "SELECT {} FROM todos WHERE due_date < date('now') AND status NOT IN ('completed', 'cancelled') ORDER BY due_date ASC",
            TODO_COLUMNS
        ))
        .map_err(|e| e.to_string())?;

    let todos = stmt
        .query_map([], row_to_todo)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(todos)
}

#[tauri::command]
pub fn get_today_todos(state: State<DbState>) -> Result<Vec<Todo>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(&format!(
            "SELECT {} FROM todos WHERE (due_date <= date('now') OR due_date IS NULL) AND status NOT IN ('completed', 'cancelled') \
             ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC NULLS LAST",
            TODO_COLUMNS
        ))
        .map_err(|e| e.to_string())?;

    let todos = stmt
        .query_map([], row_to_todo)
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(todos)
}
