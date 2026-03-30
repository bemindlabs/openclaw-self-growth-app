use tauri::State;
use crate::db::DbState;
use crate::gateway;
use crate::models::{ChatMessageInput, AiResponse};

const COACH_SYSTEM: &str = "You are a supportive personal development coach. You give clear, actionable advice grounded in the user's actual tracked data (skills, routines, goals, learning items). Be specific — reference their data when relevant. Keep responses concise (3-5 paragraphs max). Focus on:\n- What they're doing well\n- One concrete next step they can take today\n- How their current activities connect to their goals";

const INSIGHTS_SYSTEM: &str = "You are an analytical self-development advisor. Given the user's tracked data, identify patterns and provide structured insights. Format your response as:\n\n**Strengths**: What's working well (1-2 points)\n**Gaps**: Areas that need attention (1-2 points)\n**Recommendations**: Specific actions ranked by priority (2-3 items)\n**Connection**: How their skills, learning, and routines connect to their goals\n\nBe data-driven — reference their actual tracked items. Keep it concise and actionable.";

const SUMMARIZE_SYSTEM: &str = "You are a concise progress summarizer for a self-development app. Write a brief, motivating narrative summary of the user's progress. Highlight:\n- Key activities and completions\n- Skill growth\n- Routine consistency\n- Progress toward goals\n\nKeep it to 2-3 short paragraphs. Use an encouraging but honest tone. Reference their actual data.";

const CHAT_SYSTEM: &str = "You are a supportive AI coach embedded in Self Growth, a self-development app. The user tracks their skills, routines, learning items, and goals in this app. You have access to their current data as context.\n\nGuidelines:\n- Be warm, concise, and actionable\n- Reference their actual tracked data when relevant\n- Help them reflect on progress, overcome obstacles, and stay motivated\n- Suggest concrete next steps when appropriate\n- Keep responses focused (2-4 paragraphs unless they ask for more)\n- You can discuss routines, learning strategies, skill development, goal setting, habits, productivity, and personal growth";

#[tauri::command]
pub async fn ai_coach(
    state: State<'_, DbState>,
    question: Option<String>,
) -> Result<AiResponse, String> {
    let (endpoint, token) = gateway::llm_config(&state)?;
    let context = build_context(&state)?;
    let context_block = gateway::format_context(&context);

    let q = question
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| "Based on my current progress, what should I focus on next?".to_string());

    let user_prompt = format!("{q}\n\nMy current self-development context:\n{context_block}");

    let messages = vec![
        serde_json::json!({"role": "system", "content": COACH_SYSTEM}),
        serde_json::json!({"role": "user", "content": user_prompt}),
    ];

    let (content, returned_model) = gateway::chat_completion(&endpoint, &token, gateway::LLM_MODEL, &messages, 0.7, 600).await?;
    Ok(AiResponse { content, model: returned_model })
}

#[tauri::command]
pub async fn ai_insights(
    state: State<'_, DbState>,
) -> Result<AiResponse, String> {
    let (endpoint, token) = gateway::llm_config(&state)?;
    let context = build_context(&state)?;
    let context_block = gateway::format_context(&context);

    let user_prompt = format!("Analyze my self-development data and provide insights:\n\n{context_block}");

    let messages = vec![
        serde_json::json!({"role": "system", "content": INSIGHTS_SYSTEM}),
        serde_json::json!({"role": "user", "content": user_prompt}),
    ];

    let (content, returned_model) = gateway::chat_completion(&endpoint, &token, gateway::LLM_MODEL, &messages, 0.5, 700).await?;
    Ok(AiResponse { content, model: returned_model })
}

#[tauri::command]
pub async fn ai_summarize(
    state: State<'_, DbState>,
    period: Option<String>,
) -> Result<AiResponse, String> {
    let (endpoint, token) = gateway::llm_config(&state)?;
    let context = build_context(&state)?;
    let context_block = gateway::format_context(&context);

    let period = period.unwrap_or_else(|| "weekly".to_string());
    let user_prompt = format!("Write a {period} progress summary based on my self-development data:\n\n{context_block}");

    let messages = vec![
        serde_json::json!({"role": "system", "content": SUMMARIZE_SYSTEM}),
        serde_json::json!({"role": "user", "content": user_prompt}),
    ];

    let (content, returned_model) = gateway::chat_completion(&endpoint, &token, gateway::LLM_MODEL, &messages, 0.6, 400).await?;
    Ok(AiResponse { content, model: returned_model })
}

#[tauri::command]
pub async fn ai_chat(
    state: State<'_, DbState>,
    messages: Vec<ChatMessageInput>,
) -> Result<AiResponse, String> {
    let (endpoint, token) = gateway::llm_config(&state)?;
    let context = build_context(&state)?;
    let context_block = gateway::format_context(&context);

    let system_content = if context_block == "No context available." {
        CHAT_SYSTEM.to_string()
    } else {
        format!("{CHAT_SYSTEM}\n\nUser's current self-development data:\n{context_block}")
    };

    let mut llm_messages = vec![serde_json::json!({"role": "system", "content": system_content})];
    for msg in &messages {
        llm_messages.push(serde_json::json!({"role": msg.role, "content": msg.content}));
    }

    let (content, returned_model) = gateway::chat_completion(&endpoint, &token, gateway::LLM_MODEL, &llm_messages, 0.7, 600).await?;
    Ok(AiResponse { content, model: returned_model })
}

fn build_context(state: &State<DbState>) -> Result<serde_json::Value, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    let skills = gateway::query_strings(
        &conn,
        "SELECT name, category, current_level, target_level FROM skills ORDER BY updated_at DESC LIMIT 10",
        |row| {
            Ok(format!(
                "{} ({}) — level {}/{}",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, i32>(2)?,
                row.get::<_, i32>(3)?,
            ))
        },
    )?;

    let routines = gateway::query_strings(
        &conn,
        "SELECT name, frequency, COALESCE(description, '') FROM routines WHERE is_active = 1 ORDER BY created_at DESC LIMIT 10",
        |row| {
            let desc: String = row.get(2)?;
            Ok(if desc.trim().is_empty() {
                format!("{} ({})", row.get::<_, String>(0)?, row.get::<_, String>(1)?)
            } else {
                format!("{} ({}) — {}", row.get::<_, String>(0)?, row.get::<_, String>(1)?, desc.trim())
            })
        },
    )?;

    let goals = gateway::query_strings(
        &conn,
        "SELECT title, status, COALESCE(target_date, '') FROM goals ORDER BY created_at DESC LIMIT 10",
        |row| {
            let date: String = row.get(2)?;
            let mut line = format!("{} [{}]", row.get::<_, String>(0)?, row.get::<_, String>(1)?);
            if !date.trim().is_empty() {
                line.push_str(&format!(" target {}", date.trim()));
            }
            Ok(line)
        },
    )?;

    let learning = gateway::query_strings(
        &conn,
        "SELECT title, item_type, status FROM learning_items ORDER BY created_at DESC LIMIT 10",
        |row| {
            Ok(format!(
                "{} [{} / {}]",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        },
    )?;

    let streaks = gateway::query_strings(
        &conn,
        "SELECT r.name, COUNT(l.id) as completions FROM routines r LEFT JOIN routine_logs l ON r.id = l.routine_id WHERE l.completed_at >= datetime('now', '-7 days') GROUP BY r.id ORDER BY completions DESC LIMIT 5",
        |row| {
            Ok(format!(
                "{}: {} completions this week",
                row.get::<_, String>(0)?,
                row.get::<_, i64>(1)?,
            ))
        },
    )?;

    let health = gateway::query_strings(
        &conn,
        "SELECT metric_type, ROUND(AVG(value), 1), unit, COUNT(*) \
         FROM health_metrics \
         WHERE recorded_at >= datetime('now', '-7 days') \
         GROUP BY metric_type \
         ORDER BY metric_type",
        |row| {
            Ok(format!(
                "{}: avg {} {} ({} readings)",
                row.get::<_, String>(0)?,
                row.get::<_, f64>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, i64>(3)?,
            ))
        },
    )?;

    let todos = gateway::query_strings(
        &conn,
        "SELECT title, priority, COALESCE(due_date, 'no deadline'), status \
         FROM todos WHERE status NOT IN ('completed', 'cancelled') \
         ORDER BY CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END, due_date ASC NULLS LAST \
         LIMIT 10",
        |row| {
            let due: String = row.get(2)?;
            let overdue = if due != "no deadline" {
                // Simple check: if due_date < today
                " (may be overdue)"
            } else {
                ""
            };
            Ok(format!(
                "{} [{}] due {}{}",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                due,
                overdue,
            ))
        },
    )?;

    let checkups = gateway::query_strings(
        &conn,
        "SELECT title, checkup_date, category, results \
         FROM health_checkups \
         ORDER BY checkup_date DESC \
         LIMIT 5",
        |row| {
            Ok(format!(
                "{} ({}) [{}]: {}",
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
            ))
        },
    )?;

    Ok(serde_json::json!({
        "skills": skills,
        "routines": routines,
        "goals": goals,
        "learning": learning,
        "streaks": streaks,
        "health": health,
        "checkups": checkups,
        "todos": todos,
    }))
}
