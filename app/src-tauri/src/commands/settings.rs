use serde::Serialize;
use tauri::State;
use crate::db::DbState;
use crate::gateway;

#[tauri::command]
pub fn get_app_setting(state: State<DbState>, key: String) -> Result<Option<String>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let result = conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [&key],
        |row| row.get::<_, String>(0),
    );

    match result {
        Ok(value) => Ok(Some(value)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn set_app_setting(state: State<DbState>, key: String, value: String) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        rusqlite::params![key, value],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_all_app_settings(state: State<DbState>) -> Result<Vec<(String, String)>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT key, value FROM settings ORDER BY key")
        .map_err(|e| e.to_string())?;

    let settings = stmt
        .query_map([], |row| Ok((row.get::<_, String>(0)?, row.get::<_, String>(1)?)))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    Ok(settings)
}

#[tauri::command]
pub fn reset_app_settings(state: State<DbState>) -> Result<(), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM settings", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[derive(Debug, Serialize)]
pub struct ConnectionTestResult {
    pub ok: bool,
    pub llm_endpoint: Option<String>,
    pub available_models: Option<Vec<String>>,
    pub error: Option<String>,
}

#[tauri::command]
pub async fn test_ai_gateway_connection(state: State<'_, DbState>) -> Result<ConnectionTestResult, String> {
    let (endpoint, token) = gateway::llm_config(&state)?;
    let url = format!("{endpoint}/models");

    let client = reqwest::Client::new();
    let mut req = client.get(&url).timeout(std::time::Duration::from_secs(5));
    if !token.is_empty() {
        req = req.bearer_auth(&token);
    }

    let response = req.send().await;

    match response {
        Ok(resp) if resp.status().is_success() => {
            let data: serde_json::Value = resp.json().await.unwrap_or_default();
            let models: Vec<String> = data
                .get("data")
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().filter_map(|m| m.get("id").and_then(|v| v.as_str()).map(String::from)).collect())
                .unwrap_or_default();

            Ok(ConnectionTestResult {
                ok: true,
                llm_endpoint: Some(endpoint),
                available_models: Some(models),
                error: None,
            })
        }
        Ok(resp) => Ok(ConnectionTestResult {
            ok: false, llm_endpoint: None, available_models: None,
            error: Some(format!("Server returned {}", resp.status())),
        }),
        Err(e) => Ok(ConnectionTestResult {
            ok: false, llm_endpoint: None, available_models: None,
            error: Some(format!("Connection failed: {e}")),
        }),
    }
}
