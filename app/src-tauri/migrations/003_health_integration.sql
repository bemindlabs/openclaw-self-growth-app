-- Unified health metrics from Apple Health and Google Fit
CREATE TABLE IF NOT EXISTS health_metrics (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    source        TEXT NOT NULL,           -- 'apple_health' | 'google_fit'
    metric_type   TEXT NOT NULL,           -- 'steps' | 'heart_rate' | 'sleep_minutes' | 'weight_kg' | 'calories_burned' | 'distance_m' | 'workout' | 'active_minutes'
    value         REAL NOT NULL,
    unit          TEXT NOT NULL,           -- 'count' | 'bpm' | 'min' | 'kg' | 'kcal' | 'm'
    recorded_at   TEXT NOT NULL,           -- ISO 8601
    end_at        TEXT,                    -- for duration-based metrics (sleep, workouts)
    metadata      TEXT,                    -- JSON blob for extras (workout type, device, etc.)
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(source, metric_type, recorded_at)
);

CREATE INDEX IF NOT EXISTS idx_health_metrics_type_date ON health_metrics(metric_type, recorded_at);
CREATE INDEX IF NOT EXISTS idx_health_metrics_source ON health_metrics(source);

-- Import/sync history tracking
CREATE TABLE IF NOT EXISTS health_syncs (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    source           TEXT NOT NULL,           -- 'apple_health' | 'google_fit'
    sync_type        TEXT NOT NULL,           -- 'full_import' | 'incremental'
    records_added    INTEGER NOT NULL DEFAULT 0,
    records_updated  INTEGER NOT NULL DEFAULT 0,
    started_at       TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at     TEXT,
    status           TEXT NOT NULL DEFAULT 'running', -- 'running' | 'completed' | 'failed'
    error_message    TEXT
);
