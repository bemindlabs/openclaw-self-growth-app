use crate::db::DbState;
use crate::models::MoodHabitCorrelation;
use tauri::State;

#[tauri::command]
pub fn get_mood_habit_correlation(
    state: State<DbState>,
) -> Result<Vec<MoodHabitCorrelation>, String> {
    let conn = state.0.lock().map_err(|e| e.to_string())?;

    // Count total journal entries with mood ratings to gate the feature
    let total_mood_entries: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM journal_entries WHERE mood_rating IS NOT NULL",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    if total_mood_entries < 14 {
        return Ok(vec![]);
    }

    // Fetch all active habits
    struct HabitRow {
        id: i64,
        name: String,
        color: String,
    }

    let mut stmt = conn
        .prepare("SELECT id, name, color FROM habits WHERE is_active = 1 ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let habits: Vec<HabitRow> = stmt
        .query_map([], |row| {
            Ok(HabitRow {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let mut correlations: Vec<MoodHabitCorrelation> = Vec::new();

    for habit in habits {
        // Average mood on days this habit was completed
        let avg_mood_with: Option<f64> = conn
            .query_row(
                "SELECT AVG(CAST(j.mood_rating AS REAL))
                 FROM journal_entries j
                 INNER JOIN habit_logs hl
                   ON hl.habit_id = ?1
                   AND hl.logged_date = date(j.created_at)
                 WHERE j.mood_rating IS NOT NULL",
                rusqlite::params![habit.id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        // Number of distinct days with mood data where habit was done
        let sample_days_with: i64 = conn
            .query_row(
                "SELECT COUNT(DISTINCT date(j.created_at))
                 FROM journal_entries j
                 INNER JOIN habit_logs hl
                   ON hl.habit_id = ?1
                   AND hl.logged_date = date(j.created_at)
                 WHERE j.mood_rating IS NOT NULL",
                rusqlite::params![habit.id],
                |row| row.get(0),
            )
            .unwrap_or(0);

        // Average mood on days this habit was NOT completed (but mood was recorded)
        let avg_mood_without: Option<f64> = conn
            .query_row(
                "SELECT AVG(CAST(j.mood_rating AS REAL))
                 FROM journal_entries j
                 WHERE j.mood_rating IS NOT NULL
                   AND date(j.created_at) NOT IN (
                       SELECT hl.logged_date FROM habit_logs hl WHERE hl.habit_id = ?1
                   )",
                rusqlite::params![habit.id],
                |row| row.get(0),
            )
            .map_err(|e| e.to_string())?;

        // Require at least 7 days of data for each habit before including
        if sample_days_with < 7 {
            continue;
        }

        // Both averages must be present to compute a diff
        if let (Some(with_val), Some(without_val)) = (avg_mood_with, avg_mood_without) {
            let diff = with_val - without_val;
            // Total sample days = days habit done (with mood) + days not done (with mood)
            let sample_days_without: i64 = conn
                .query_row(
                    "SELECT COUNT(DISTINCT date(j.created_at))
                     FROM journal_entries j
                     WHERE j.mood_rating IS NOT NULL
                       AND date(j.created_at) NOT IN (
                           SELECT hl.logged_date FROM habit_logs hl WHERE hl.habit_id = ?1
                       )",
                    rusqlite::params![habit.id],
                    |row| row.get(0),
                )
                .unwrap_or(0);

            correlations.push(MoodHabitCorrelation {
                habit_name: habit.name,
                habit_color: habit.color,
                avg_mood_with: with_val,
                avg_mood_without: without_val,
                diff,
                sample_days: sample_days_with + sample_days_without,
            });
        }
    }

    // Sort by absolute correlation strength (largest positive diff first)
    correlations.sort_by(|a, b| {
        b.diff
            .partial_cmp(&a.diff)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    Ok(correlations)
}
