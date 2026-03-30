use std::path::PathBuf;
use tauri::{Manager, State};
use crate::db::DbState;

/// Get the path to the current database file.
fn db_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_data_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    Ok(app_data_dir.join("bemind-growth.db"))
}

/// Export (backup) the database to a given path.
#[tauri::command]
pub fn export_backup(app: tauri::AppHandle, state: State<DbState>, dest_path: String) -> Result<String, String> {
    // Checkpoint WAL to ensure all data is in the main db file
    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);")
            .map_err(|e| format!("WAL checkpoint failed: {e}"))?;
    }

    let src = db_path(&app)?;
    if !src.exists() {
        return Err("Database file not found".to_string());
    }

    let dest = PathBuf::from(&dest_path);
    std::fs::copy(&src, &dest).map_err(|e| format!("Backup failed: {e}"))?;

    Ok(dest_path)
}

/// Import (restore) a database from a given path, replacing the current one.
#[tauri::command]
pub fn import_backup(app: tauri::AppHandle, state: State<DbState>, src_path: String) -> Result<(), String> {
    let src = PathBuf::from(&src_path);
    if !src.exists() {
        return Err("Backup file not found".to_string());
    }

    // Validate the backup is a valid SQLite database with our schema
    {
        let conn = rusqlite::Connection::open(&src).map_err(|e| format!("Invalid backup file: {e}"))?;
        conn.query_row("SELECT COUNT(*) FROM settings", [], |_| Ok(()))
            .map_err(|_| "Invalid backup: not a Self Growth database".to_string())?;
    }

    let dest = db_path(&app)?;

    // Close current connection by acquiring the lock
    {
        let conn = state.0.lock().map_err(|e| e.to_string())?;
        conn.execute_batch("PRAGMA wal_checkpoint(TRUNCATE);").ok();
        // conn is dropped at end of block
    }

    // Copy backup over current database
    std::fs::copy(&src, &dest).map_err(|e| format!("Restore failed: {e}"))?;

    // Remove WAL and SHM files if they exist
    let _ = std::fs::remove_file(dest.with_extension("db-wal"));
    let _ = std::fs::remove_file(dest.with_extension("db-shm"));

    Ok(())
}

/// Get database file size and path info.
#[tauri::command]
pub fn get_backup_info(app: tauri::AppHandle) -> Result<BackupInfo, String> {
    let path = db_path(&app)?;

    let size_bytes = if path.exists() {
        std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0)
    } else {
        0
    };

    Ok(BackupInfo {
        db_path: path.to_string_lossy().to_string(),
        size_bytes,
        size_display: format_size(size_bytes),
    })
}

#[derive(serde::Serialize)]
pub struct BackupInfo {
    pub db_path: String,
    pub size_bytes: u64,
    pub size_display: String,
}

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{} B", bytes)
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    }
}
