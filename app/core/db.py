"""Database manager for ADIOS application."""
from __future__ import annotations
import sqlite3
import os
import logging
from pathlib import Path
from typing import Any, List, Dict, Optional, Tuple

logger = logging.getLogger("adios.db")

SCHEMA_VERSION = 2

MIGRATION_V1 = """
-- Versioning table
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Core shared tables
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#808080'
);

CREATE TABLE IF NOT EXISTS item_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    FOREIGN KEY(tag_id) REFERENCES tags(id) ON DELETE CASCADE,
    UNIQUE(item_type, item_id, tag_id)
);

CREATE TABLE IF NOT EXISTS links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_type TEXT NOT NULL,
    source_id INTEGER NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    relationship TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(source_type, source_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    description TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL,
    item_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    remind_at TIMESTAMP NOT NULL,
    is_dismissed INTEGER DEFAULT 0,
    snoozed_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS quick_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
"""

MIGRATION_V2 = """
-- Migration V2: Ensure all standard columns on schedule_events and exams
"""

class DatabaseManager:
    """Manages SQLite connection, schema migrations, and transactions."""

    def __init__(self, db_path: Optional[str] = None):
        if db_path is None:
            # Default to adios_data.db in user's documents/ADIOS or current dir
            app_dir = Path(os.environ.get("ADIOS_DATA_DIR", Path.cwd()))
            app_dir.mkdir(parents=True, exist_ok=True)
            self.db_path = str(app_dir / "adios_data.db")
        else:
            self.db_path = db_path
            Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)

        self._conn: Optional[sqlite3.Connection] = None
        self.init_db()

    def get_connection(self) -> sqlite3.Connection:
        if self._conn is None:
            self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
            self._conn.row_factory = sqlite3.Row
            self._conn.execute("PRAGMA foreign_keys = ON;")
        return self._conn

    def init_db(self) -> None:
        """Run schema migrations."""
        conn = self.get_connection()
        with conn:
            conn.executescript(MIGRATION_V1)
            cur = conn.cursor()
            cur.execute("SELECT MAX(version) FROM schema_version")
            row = cur.fetchone()
            current_version = row[0] if (row and row[0] is not None) else 0

            if current_version < 1:
                cur.execute("INSERT INTO schema_version (version) VALUES (1)")
                current_version = 1
                logger.info("Initialized database schema version 1 at %s", self.db_path)

            if current_version < 2:
                # Migrate schedule_events columns if table exists
                cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='schedule_events'")
                if cur.fetchone():
                    cur.execute("PRAGMA table_info(schedule_events)")
                    cols = [c[1] for c in cur.fetchall()]
                    if "archived" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN archived INTEGER DEFAULT 0")
                    if "start_date" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN start_date TEXT")
                        cur.execute("UPDATE schedule_events SET start_date = event_date WHERE start_date IS NULL")
                    if "end_date" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN end_date TEXT")
                        cur.execute("UPDATE schedule_events SET end_date = start_date WHERE end_date IS NULL")
                    if "all_day" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN all_day INTEGER DEFAULT 0")
                    if "category" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN category TEXT DEFAULT 'Other'")
                    if "repeat_type" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN repeat_type TEXT DEFAULT 'None'")
                        if "recurrence" in cols:
                            cur.execute("UPDATE schedule_events SET repeat_type = recurrence WHERE repeat_type IS NULL OR repeat_type = 'None'")
                    if "reminder_mins" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN reminder_mins INTEGER DEFAULT 0")
                    if "updated_at" not in cols:
                        cur.execute("ALTER TABLE schedule_events ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")

                # Create schedule_exceptions if not exists
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS schedule_exceptions (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        event_id INTEGER NOT NULL,
                        exception_date TEXT NOT NULL,
                        is_skipped INTEGER DEFAULT 1,
                        override_start_time TEXT,
                        override_end_time TEXT,
                        notes TEXT,
                        FOREIGN KEY(event_id) REFERENCES schedule_events(id) ON DELETE CASCADE,
                        UNIQUE(event_id, exception_date)
                    );
                """)

                cur.execute("INSERT INTO schema_version (version) VALUES (2)")
                logger.info("Migrated database schema to version 2 at %s", self.db_path)

    def execute(self, sql: str, params: Tuple[Any, ...] = ()) -> sqlite3.Cursor:
        """Execute a parameterized query."""
        conn = self.get_connection()
        return conn.execute(sql, params)

    def executemany(self, sql: str, seq_of_params: List[Tuple[Any, ...]]) -> sqlite3.Cursor:
        """Execute many parameterized queries."""
        conn = self.get_connection()
        return conn.executemany(sql, seq_of_params)

    def commit(self) -> None:
        """Commit the current transaction."""
        if self._conn:
            self._conn.commit()

    def fetchall(self, sql: str, params: Tuple[Any, ...] = ()) -> List[sqlite3.Row]:
        """Fetch all rows for a query."""
        cur = self.execute(sql, params)
        return cur.fetchall()

    def fetchone(self, sql: str, params: Tuple[Any, ...] = ()) -> Optional[sqlite3.Row]:
        """Fetch one row for a query."""
        cur = self.execute(sql, params)
        return cur.fetchone()

    def get_setting(self, key: str, default: Optional[str] = None) -> Optional[str]:
        row = self.fetchone("SELECT value FROM settings WHERE key = ?", (key,))
        if row:
            return row["value"]
        return default

    def set_setting(self, key: str, value: str) -> None:
        with self.get_connection():
            self.execute("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)", (key, value))

    def compact(self) -> None:
        """Compact/vacuum database."""
        self.execute("VACUUM;")

    def close(self) -> None:
        if self._conn:
            self._conn.close()
            self._conn = None
