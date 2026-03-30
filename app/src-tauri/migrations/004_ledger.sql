CREATE TABLE IF NOT EXISTS ledger_entries (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    title         TEXT NOT NULL,
    amount        REAL NOT NULL,
    currency      TEXT NOT NULL DEFAULT 'THB',
    entry_type    TEXT NOT NULL DEFAULT 'expense',
    category      TEXT NOT NULL DEFAULT 'general',
    description   TEXT,
    entry_date    TEXT NOT NULL DEFAULT (date('now')),
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
