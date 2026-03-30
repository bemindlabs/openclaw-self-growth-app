-- Stories persistence
CREATE TABLE IF NOT EXISTS stories (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt        TEXT NOT NULL,
    tone          TEXT NOT NULL DEFAULT 'encouraging',
    story         TEXT NOT NULL,
    model         TEXT,
    provider      TEXT,
    context_summary TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Daily journal
CREATE TABLE IF NOT EXISTS journal_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT,
    content       TEXT NOT NULL,
    mood_rating   INTEGER,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Habit tracker
CREATE TABLE IF NOT EXISTS habits (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    description   TEXT,
    frequency     TEXT NOT NULL DEFAULT 'daily',
    color         TEXT DEFAULT '#6366f1',
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habit_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id      INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    logged_date   TEXT NOT NULL,
    notes         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(habit_id, logged_date)
);
