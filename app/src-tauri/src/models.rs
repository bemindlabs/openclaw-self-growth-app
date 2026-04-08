use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Skill {
    pub id: i64,
    pub name: String,
    pub category: String,
    pub target_level: i32,
    pub current_level: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateSkill {
    pub name: String,
    pub category: Option<String>,
    pub target_level: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LearningItem {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub item_type: String,
    pub source_url: Option<String>,
    pub status: String,
    pub skill_id: Option<i64>,
    pub created_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateLearningItem {
    pub title: String,
    pub description: Option<String>,
    pub item_type: String,
    pub source_url: Option<String>,
    pub skill_id: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Routine {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub frequency: String,
    pub is_active: bool,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoutine {
    pub name: String,
    pub description: Option<String>,
    pub frequency: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoutineStep {
    pub id: i64,
    pub routine_id: i64,
    pub title: String,
    pub duration_min: Option<i32>,
    pub sort_order: i32,
}

#[derive(Debug, Deserialize)]
pub struct CreateRoutineStep {
    pub routine_id: i64,
    pub title: String,
    pub duration_min: Option<i32>,
    pub sort_order: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RoutineLog {
    pub id: i64,
    pub routine_id: i64,
    pub completed_at: String,
    pub notes: Option<String>,
    pub mood_rating: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProgressEntry {
    pub id: i64,
    pub skill_id: Option<i64>,
    pub learning_item_id: Option<i64>,
    pub entry_type: String,
    pub value: Option<f64>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateProgressEntry {
    pub skill_id: Option<i64>,
    pub learning_item_id: Option<i64>,
    pub entry_type: String,
    pub value: Option<f64>,
    pub notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Goal {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub skill_id: Option<i64>,
    pub target_date: Option<String>,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateGoal {
    pub title: String,
    pub description: Option<String>,
    pub skill_id: Option<i64>,
    pub target_date: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct LifeBalanceDomain {
    pub domain: String,
    pub score: f64,
}

#[derive(Debug, Serialize)]
pub struct DashboardStats {
    pub total_skills: i64,
    pub total_learning_items: i64,
    pub active_routines: i64,
    pub active_goals: i64,
    pub completions_today: i64,
    pub current_streak: i64,
}

#[derive(Debug, Serialize)]
pub struct SearchResult {
    pub source_table: String,
    pub source_id: i64,
    pub title: String,
    pub description: Option<String>,
    pub score: f32,
}

#[derive(Debug, Deserialize)]
pub struct GenerateStoryInput {
    pub prompt: Option<String>,
    pub tone: Option<String>,
    #[allow(dead_code)]
    pub max_tokens: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct StoryGenerationResult {
    pub story: String,
    pub model: String,
    pub provider: String,
    pub context_summary: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct AiResponse {
    pub content: String,
    pub model: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessageInput {
    pub role: String,
    pub content: String,
}

// Chat Conversations
#[derive(Debug, Serialize, Deserialize)]
pub struct ChatConversation {
    pub id: i64,
    pub title: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessageRecord {
    pub id: i64,
    pub conversation_id: i64,
    pub role: String,
    pub content: String,
    pub created_at: String,
}

// Stories
#[derive(Debug, Serialize, Deserialize)]
pub struct Story {
    pub id: i64,
    pub prompt: String,
    pub tone: String,
    pub story: String,
    pub model: Option<String>,
    pub provider: Option<String>,
    pub context_summary: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct SaveStoryInput {
    pub prompt: String,
    pub tone: String,
    pub story: String,
    pub model: Option<String>,
    pub provider: Option<String>,
    pub context_summary: Option<String>,
}

// Journal
#[derive(Debug, Serialize, Deserialize)]
pub struct JournalEntry {
    pub id: i64,
    pub title: Option<String>,
    pub content: String,
    pub mood_rating: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateJournalEntry {
    pub title: Option<String>,
    pub content: String,
    pub mood_rating: Option<i32>,
}

// Habits
#[derive(Debug, Serialize, Deserialize)]
pub struct Habit {
    pub id: i64,
    pub name: String,
    pub description: Option<String>,
    pub frequency: String,
    pub color: String,
    pub is_active: bool,
    pub created_at: String,
    pub identity_statement: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateHabit {
    pub name: String,
    pub description: Option<String>,
    pub frequency: Option<String>,
    pub color: Option<String>,
    pub identity_statement: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HabitLog {
    pub id: i64,
    pub habit_id: i64,
    pub logged_date: String,
    pub notes: Option<String>,
    pub created_at: String,
}

// Health
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthMetric {
    pub id: i64,
    pub source: String,
    pub metric_type: String,
    pub value: f64,
    pub unit: String,
    pub recorded_at: String,
    pub end_at: Option<String>,
    pub metadata: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthSync {
    pub id: i64,
    pub source: String,
    pub sync_type: String,
    pub records_added: i64,
    pub records_updated: i64,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub status: String,
    pub error_message: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HealthSummary {
    pub metric_type: String,
    pub latest_value: f64,
    pub unit: String,
    pub avg_7d: Option<f64>,
    pub avg_30d: Option<f64>,
    pub trend: String,
}

// Ledger
#[derive(Debug, Serialize, Deserialize)]
pub struct LedgerEntry {
    pub id: i64,
    pub title: String,
    pub amount: f64,
    pub currency: String,
    pub entry_type: String,
    pub category: String,
    pub description: Option<String>,
    pub entry_date: String,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateLedgerEntry {
    pub title: String,
    pub amount: f64,
    pub currency: Option<String>,
    pub entry_type: Option<String>,
    pub category: Option<String>,
    pub description: Option<String>,
    pub entry_date: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct LedgerSummary {
    pub total_income: f64,
    pub total_expense: f64,
    pub balance: f64,
    pub currency: String,
    pub by_category: Vec<(String, f64)>,
}

// Todos
#[derive(Debug, Serialize, Deserialize)]
pub struct Todo {
    pub id: i64,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub priority: String,
    pub status: String,
    pub category: Option<String>,
    pub goal_id: Option<i64>,
    pub completed_at: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateTodo {
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub due_time: Option<String>,
    pub priority: Option<String>,
    pub category: Option<String>,
    pub goal_id: Option<i64>,
}

// Analytics
#[derive(Debug, Serialize)]
pub struct MoodHabitCorrelation {
    pub habit_name: String,
    pub habit_color: String,
    pub avg_mood_with: f64,
    pub avg_mood_without: f64,
    pub diff: f64,
    pub sample_days: i64,
}

// Health Checkups
#[derive(Debug, Serialize, Deserialize)]
pub struct HealthCheckup {
    pub id: i64,
    pub title: String,
    pub checkup_date: String,
    pub provider: Option<String>,
    pub category: String,
    pub results: String,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateHealthCheckup {
    pub title: String,
    pub checkup_date: Option<String>,
    pub provider: Option<String>,
    pub category: Option<String>,
    pub results: String,
    pub notes: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::{json, Value};

    // --- Skill ---

    #[test]
    fn test_skill_roundtrip() {
        let skill = Skill {
            id: 1,
            name: "Rust".to_string(),
            category: "Programming".to_string(),
            target_level: 10,
            current_level: 3,
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-03-30T00:00:00Z".to_string(),
        };
        let json_str = serde_json::to_string(&skill).unwrap();
        let deserialized: Skill = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.id, skill.id);
        assert_eq!(deserialized.name, skill.name);
        assert_eq!(deserialized.category, skill.category);
        assert_eq!(deserialized.target_level, skill.target_level);
        assert_eq!(deserialized.current_level, skill.current_level);
    }

    // --- Goal ---

    #[test]
    fn test_goal_roundtrip() {
        let goal = Goal {
            id: 42,
            title: "Ship v1.0".to_string(),
            description: Some("Launch the product".to_string()),
            skill_id: Some(7),
            target_date: Some("2026-12-31".to_string()),
            status: "active".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
        };
        let json_str = serde_json::to_string(&goal).unwrap();
        let deserialized: Goal = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.id, goal.id);
        assert_eq!(deserialized.title, goal.title);
        assert_eq!(deserialized.description, goal.description);
        assert_eq!(deserialized.skill_id, goal.skill_id);
        assert_eq!(deserialized.status, goal.status);
    }

    // --- Todo ---

    #[test]
    fn test_todo_roundtrip() {
        let todo = Todo {
            id: 5,
            title: "Write tests".to_string(),
            description: Some("Unit tests for backend".to_string()),
            due_date: Some("2026-04-01".to_string()),
            due_time: None,
            priority: "high".to_string(),
            status: "pending".to_string(),
            category: Some("dev".to_string()),
            goal_id: Some(1),
            completed_at: None,
            created_at: "2026-03-30T00:00:00Z".to_string(),
            updated_at: "2026-03-30T00:00:00Z".to_string(),
        };
        let json_str = serde_json::to_string(&todo).unwrap();
        let deserialized: Todo = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.id, todo.id);
        assert_eq!(deserialized.title, todo.title);
        assert_eq!(deserialized.priority, todo.priority);
        assert_eq!(deserialized.status, todo.status);
        assert_eq!(deserialized.due_time, None);
        assert_eq!(deserialized.completed_at, None);
    }

    // --- LedgerEntry ---

    #[test]
    fn test_ledger_entry_roundtrip() {
        let entry = LedgerEntry {
            id: 99,
            title: "Coffee".to_string(),
            amount: 4.50,
            currency: "USD".to_string(),
            entry_type: "expense".to_string(),
            category: "food".to_string(),
            description: None,
            entry_date: "2026-03-30".to_string(),
            created_at: "2026-03-30T08:00:00Z".to_string(),
        };
        let json_str = serde_json::to_string(&entry).unwrap();
        let deserialized: LedgerEntry = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.id, entry.id);
        assert_eq!(deserialized.amount, entry.amount);
        assert_eq!(deserialized.currency, entry.currency);
        assert_eq!(deserialized.entry_type, entry.entry_type);
        assert_eq!(deserialized.description, None);
    }

    // --- DashboardStats ---

    #[test]
    fn test_dashboard_stats_json_structure() {
        let stats = DashboardStats {
            total_skills: 5,
            total_learning_items: 12,
            active_routines: 3,
            active_goals: 2,
            completions_today: 7,
            current_streak: 14,
        };
        let value: Value = serde_json::to_value(&stats).unwrap();
        assert_eq!(value["total_skills"], 5);
        assert_eq!(value["total_learning_items"], 12);
        assert_eq!(value["active_routines"], 3);
        assert_eq!(value["active_goals"], 2);
        assert_eq!(value["completions_today"], 7);
        assert_eq!(value["current_streak"], 14);
    }

    // --- LedgerSummary ---

    #[test]
    fn test_ledger_summary_by_category_as_tuple_array() {
        let summary = LedgerSummary {
            total_income: 3000.0,
            total_expense: 1200.0,
            balance: 1800.0,
            currency: "USD".to_string(),
            by_category: vec![
                ("food".to_string(), 400.0),
                ("transport".to_string(), 150.0),
            ],
        };
        let value: Value = serde_json::to_value(&summary).unwrap();
        assert_eq!(value["total_income"], 3000.0);
        assert_eq!(value["balance"], 1800.0);
        // by_category serializes as an array of two-element arrays
        let by_cat = value["by_category"].as_array().unwrap();
        assert_eq!(by_cat.len(), 2);
        assert_eq!(by_cat[0][0], "food");
        assert_eq!(by_cat[0][1], 400.0);
        assert_eq!(by_cat[1][0], "transport");
        assert_eq!(by_cat[1][1], 150.0);
    }

    // --- CreateSkill ---

    #[test]
    fn test_create_skill_deserialize_optional_fields() {
        // With all optional fields present
        let full = json!({
            "name": "Python",
            "category": "Programming",
            "target_level": 8
        });
        let cs: CreateSkill = serde_json::from_value(full).unwrap();
        assert_eq!(cs.name, "Python");
        assert_eq!(cs.category, Some("Programming".to_string()));
        assert_eq!(cs.target_level, Some(8));

        // With optional fields absent
        let minimal = json!({ "name": "Go" });
        let cs2: CreateSkill = serde_json::from_value(minimal).unwrap();
        assert_eq!(cs2.name, "Go");
        assert_eq!(cs2.category, None);
        assert_eq!(cs2.target_level, None);
    }

    // --- CreateTodo ---

    #[test]
    fn test_create_todo_deserialize_optional_fields() {
        // With all optional fields present
        let full = json!({
            "title": "Buy groceries",
            "description": "Milk and eggs",
            "due_date": "2026-04-01",
            "due_time": "10:00",
            "priority": "medium",
            "category": "personal",
            "goal_id": 3
        });
        let ct: CreateTodo = serde_json::from_value(full).unwrap();
        assert_eq!(ct.title, "Buy groceries");
        assert_eq!(ct.due_date, Some("2026-04-01".to_string()));
        assert_eq!(ct.priority, Some("medium".to_string()));
        assert_eq!(ct.goal_id, Some(3));

        // With only required field
        let minimal = json!({ "title": "Do laundry" });
        let ct2: CreateTodo = serde_json::from_value(minimal).unwrap();
        assert_eq!(ct2.title, "Do laundry");
        assert_eq!(ct2.description, None);
        assert_eq!(ct2.due_date, None);
        assert_eq!(ct2.priority, None);
        assert_eq!(ct2.goal_id, None);
    }

    // --- Habit ---

    #[test]
    fn test_habit_roundtrip_with_identity_statement() {
        let habit = Habit {
            id: 1,
            name: "Morning run".to_string(),
            description: Some("Run 5km every morning".to_string()),
            frequency: "daily".to_string(),
            color: "#6366f1".to_string(),
            is_active: true,
            created_at: "2026-01-01T00:00:00Z".to_string(),
            identity_statement: Some("I'm becoming someone who prioritizes health".to_string()),
        };
        let json_str = serde_json::to_string(&habit).unwrap();
        let deserialized: Habit = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.id, habit.id);
        assert_eq!(deserialized.name, habit.name);
        assert_eq!(deserialized.frequency, habit.frequency);
        assert_eq!(
            deserialized.identity_statement,
            Some("I'm becoming someone who prioritizes health".to_string())
        );
    }

    #[test]
    fn test_habit_roundtrip_without_identity_statement() {
        let habit = Habit {
            id: 2,
            name: "Meditate".to_string(),
            description: None,
            frequency: "daily".to_string(),
            color: "#6366f1".to_string(),
            is_active: true,
            created_at: "2026-01-01T00:00:00Z".to_string(),
            identity_statement: None,
        };
        let json_str = serde_json::to_string(&habit).unwrap();
        let deserialized: Habit = serde_json::from_str(&json_str).unwrap();
        assert_eq!(deserialized.identity_statement, None);
    }

    #[test]
    fn test_create_habit_deserialize_with_identity_statement() {
        let full = json!({
            "name": "Morning run",
            "description": "Run 5km",
            "frequency": "daily",
            "color": "#6366f1",
            "identity_statement": "I'm becoming someone who prioritizes health"
        });
        let ch: CreateHabit = serde_json::from_value(full).unwrap();
        assert_eq!(ch.name, "Morning run");
        assert_eq!(
            ch.identity_statement,
            Some("I'm becoming someone who prioritizes health".to_string())
        );

        let minimal = json!({ "name": "Meditate" });
        let ch2: CreateHabit = serde_json::from_value(minimal).unwrap();
        assert_eq!(ch2.name, "Meditate");
        assert_eq!(ch2.identity_statement, None);
    }
}
