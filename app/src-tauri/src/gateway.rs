use crate::db::DbState;
use tauri::State;

/// Read a single setting from the database, returning None if not found.
pub fn get_setting(conn: &rusqlite::Connection, key: &str) -> Option<String> {
    conn.query_row(
        "SELECT value FROM settings WHERE key = ?1",
        [key],
        |row| row.get(0),
    )
    .ok()
}

/// Read a setting that must exist and be non-empty, or return a user-facing error.
pub fn get_required_setting(conn: &rusqlite::Connection, key: &str) -> Result<String, String> {
    get_setting(conn, key)
        .filter(|v| !v.trim().is_empty())
        .ok_or_else(|| format!("Missing '{key}' setting. Configure it in Settings."))
}

/// Read LLM endpoint and token from settings.
pub fn llm_config(state: &State<DbState>) -> Result<(String, String), String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;
    let endpoint = get_required_setting(&conn, "llm_endpoint")?;
    let token = get_setting(&conn, "llm_token").unwrap_or_default();
    Ok((endpoint.trim_end_matches('/').to_string(), token))
}

/// The model identifier sent to the gateway.
pub const LLM_MODEL: &str = "openclaw";

/// Call the LLM chat completions API.
pub async fn chat_completion(
    endpoint: &str,
    token: &str,
    model: &str,
    messages: &[serde_json::Value],
    temperature: f64,
    max_tokens: u32,
) -> Result<(String, String), String> {
    let body = serde_json::json!({
        "model": model,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "messages": messages,
    });

    let client = reqwest::Client::new();
    let url = format!("{endpoint}/chat/completions");
    let mut req = client.post(&url).json(&body);

    if !token.is_empty() {
        req = req.bearer_auth(token);
    }

    let response = req
        .send()
        .await
        .map_err(|e| format!("LLM request failed: {e}"))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("LLM error ({status}): {text}"));
    }

    let data: serde_json::Value = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse LLM response: {e}"))?;

    let content = data
        .pointer("/choices/0/message/content")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .trim()
        .to_string();

    if content.is_empty() {
        return Err("LLM returned empty content".to_string());
    }

    let returned_model = data
        .get("model")
        .and_then(|v| v.as_str())
        .unwrap_or(model)
        .to_string();

    Ok((content, returned_model))
}

/// Format context data into a readable text block for LLM prompts.
pub fn format_context(context: &serde_json::Value) -> String {
    let sections: Vec<String> = ["skills", "routines", "goals", "learning", "streaks", "health", "checkups", "todos"]
        .iter()
        .filter_map(|key| {
            let items = context.get(key)?.as_array()?;
            if items.is_empty() {
                return None;
            }
            let label = match *key {
                "skills" => "Skills",
                "routines" => "Routines",
                "goals" => "Goals",
                "learning" => "Learning",
                "streaks" => "Streaks",
                "health" => "Health (7-day avg)",
                "checkups" => "Recent Health Checkups",
                "todos" => "Pending Todos",
                _ => key,
            };
            let lines: Vec<String> = items
                .iter()
                .filter_map(|v| v.as_str().map(|s| format!("  - {s}")))
                .collect();
            Some(format!("{label}:\n{}", lines.join("\n")))
        })
        .collect();

    if sections.is_empty() {
        "No context available.".to_string()
    } else {
        sections.join("\n\n")
    }
}

/// Run a query and map each row to a String.
pub fn query_strings<F>(
    conn: &rusqlite::Connection,
    sql: &str,
    mut mapper: F,
) -> Result<Vec<String>, String>
where
    F: FnMut(&rusqlite::Row<'_>) -> rusqlite::Result<String>,
{
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let results = stmt
        .query_map([], |row| mapper(row))
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string());
    results
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn setup_test_db() -> rusqlite::Connection {
        let conn = rusqlite::Connection::open_in_memory().unwrap();
        conn.execute_batch(
            "CREATE TABLE settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);",
        )
        .unwrap();
        conn
    }

    // --- format_context tests ---

    #[test]
    fn test_format_context_empty_returns_no_context() {
        let context = json!({});
        assert_eq!(format_context(&context), "No context available.");
    }

    #[test]
    fn test_format_context_with_skills_and_goals() {
        let context = json!({
            "skills": ["Rust", "TypeScript"],
            "goals": ["Ship v1.0", "Learn async Rust"]
        });
        let result = format_context(&context);
        assert!(result.contains("Skills:"));
        assert!(result.contains("  - Rust"));
        assert!(result.contains("  - TypeScript"));
        assert!(result.contains("Goals:"));
        assert!(result.contains("  - Ship v1.0"));
        assert!(result.contains("  - Learn async Rust"));
    }

    #[test]
    fn test_format_context_skips_empty_sections() {
        let context = json!({
            "skills": ["Rust"],
            "goals": [],
            "todos": []
        });
        let result = format_context(&context);
        assert!(result.contains("Skills:"));
        assert!(!result.contains("Goals:"));
        assert!(!result.contains("Pending Todos:"));
    }

    #[test]
    fn test_format_context_all_known_labels() {
        let context = json!({
            "skills":    ["a"],
            "routines":  ["b"],
            "goals":     ["c"],
            "learning":  ["d"],
            "streaks":   ["e"],
            "health":    ["f"],
            "checkups":  ["g"],
            "todos":     ["h"]
        });
        let result = format_context(&context);
        assert!(result.contains("Skills:"));
        assert!(result.contains("Routines:"));
        assert!(result.contains("Goals:"));
        assert!(result.contains("Learning:"));
        assert!(result.contains("Streaks:"));
        assert!(result.contains("Health (7-day avg):"));
        assert!(result.contains("Recent Health Checkups:"));
        assert!(result.contains("Pending Todos:"));
    }

    // --- get_setting tests ---

    #[test]
    fn test_get_setting_no_table_returns_none() {
        // Open a fresh in-memory DB with no tables at all.
        let conn = rusqlite::Connection::open_in_memory().unwrap();
        assert_eq!(get_setting(&conn, "any_key"), None);
    }

    #[test]
    fn test_get_setting_missing_key_returns_none() {
        let conn = setup_test_db();
        assert_eq!(get_setting(&conn, "nonexistent"), None);
    }

    #[test]
    fn test_get_setting_existing_key_returns_value() {
        let conn = setup_test_db();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)",
            ["api_key", "secret123"],
        )
        .unwrap();
        assert_eq!(get_setting(&conn, "api_key"), Some("secret123".to_string()));
    }

    // --- get_required_setting tests ---

    #[test]
    fn test_get_required_setting_missing_key_returns_error() {
        let conn = setup_test_db();
        let result = get_required_setting(&conn, "llm_endpoint");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Missing 'llm_endpoint' setting"));
    }

    #[test]
    fn test_get_required_setting_empty_value_returns_error() {
        let conn = setup_test_db();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)",
            ["llm_endpoint", "   "],
        )
        .unwrap();
        let result = get_required_setting(&conn, "llm_endpoint");
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Missing 'llm_endpoint' setting"));
    }

    #[test]
    fn test_get_required_setting_valid_value_returns_ok() {
        let conn = setup_test_db();
        conn.execute(
            "INSERT INTO settings (key, value) VALUES (?1, ?2)",
            ["llm_endpoint", "http://localhost:11434"],
        )
        .unwrap();
        let result = get_required_setting(&conn, "llm_endpoint");
        assert_eq!(result.unwrap(), "http://localhost:11434");
    }

    // --- LLM_MODEL constant ---

    #[test]
    fn test_llm_model_constant() {
        assert_eq!(LLM_MODEL, "openclaw");
    }
}
