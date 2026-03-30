-- Todo / Reminder task management
CREATE TABLE IF NOT EXISTS todos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    description   TEXT,
    due_date      TEXT,                    -- YYYY-MM-DD, nullable for no deadline
    due_time      TEXT,                    -- HH:MM for reminder time, nullable
    priority      TEXT NOT NULL DEFAULT 'medium',   -- 'low' | 'medium' | 'high' | 'urgent'
    status        TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'in_progress' | 'completed' | 'cancelled'
    category      TEXT,                    -- optional grouping tag
    goal_id       INTEGER REFERENCES goals(id) ON DELETE SET NULL,
    completed_at  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_status_due ON todos(status, due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority);
