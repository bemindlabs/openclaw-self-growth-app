CREATE TABLE IF NOT EXISTS health_checkups (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    checkup_date  TEXT NOT NULL DEFAULT (date('now')),
    provider      TEXT,
    category      TEXT NOT NULL DEFAULT 'general',
    results       TEXT NOT NULL,
    notes         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
