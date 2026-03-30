-- Skills the user wants to develop
CREATE TABLE IF NOT EXISTS skills (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    category      TEXT NOT NULL DEFAULT 'general',
    target_level  INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 0,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Learning items: courses, books, articles, videos, practice
CREATE TABLE IF NOT EXISTS learning_items (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    item_type     TEXT NOT NULL,
    source_url    TEXT,
    status        TEXT NOT NULL DEFAULT 'backlog',
    skill_id      INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at  TEXT
);

-- Routines (daily, weekly, custom)
CREATE TABLE IF NOT EXISTS routines (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL,
    description   TEXT,
    frequency     TEXT NOT NULL DEFAULT 'daily',
    is_active     INTEGER NOT NULL DEFAULT 1,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Ordered steps within a routine
CREATE TABLE IF NOT EXISTS routine_steps (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id    INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    duration_min  INTEGER,
    sort_order    INTEGER NOT NULL
);

-- Routine completion log
CREATE TABLE IF NOT EXISTS routine_logs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id    INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    completed_at  TEXT NOT NULL DEFAULT (datetime('now')),
    notes         TEXT,
    mood_rating   INTEGER
);

-- Progress entries
CREATE TABLE IF NOT EXISTS progress_entries (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    skill_id         INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    learning_item_id INTEGER REFERENCES learning_items(id) ON DELETE SET NULL,
    entry_type       TEXT NOT NULL,
    value            REAL,
    notes            TEXT,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Goals and milestones
CREATE TABLE IF NOT EXISTS goals (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    skill_id      INTEGER REFERENCES skills(id) ON DELETE SET NULL,
    target_date   TEXT,
    status        TEXT NOT NULL DEFAULT 'active',
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vector embeddings for RAG
CREATE TABLE IF NOT EXISTS embeddings (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    source_table  TEXT NOT NULL,
    source_id     INTEGER NOT NULL,
    content_hash  TEXT NOT NULL,
    embedding     BLOB NOT NULL,
    updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(source_table, source_id)
);

-- App settings (key-value)
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Migration tracking
CREATE TABLE IF NOT EXISTS _migrations (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL UNIQUE,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);
