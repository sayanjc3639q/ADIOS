"""Backup manager for ADIOS SQLite database."""
from __future__ import annotations
import os
import shutil
import glob
from datetime import datetime
from pathlib import Path
from typing import Optional, List
import logging

logger = logging.getLogger("adios.backup")

class BackupManager:
    """Handles automatic and manual SQLite backups into /backups."""

    def __init__(self, db: any, max_backups: int = 10):
        self.db = db
        self.max_backups = max_backups
        db_dir = Path(self.db.db_path).parent
        self.backup_dir = db_dir / "backups"
        self.backup_dir.mkdir(parents=True, exist_ok=True)

    def create_backup(self) -> str:
        """Create a timestamped backup of the current DB file."""
        # Ensure changes are flushed
        self.db.commit()

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"adios_backup_{timestamp}.db"
        dest_path = self.backup_dir / backup_filename

        # Perform atomic SQLite backup or file copy
        src_conn = self.db.get_connection()
        import sqlite3
        dest_conn = sqlite3.connect(str(dest_path))
        with dest_conn:
            src_conn.backup(dest_conn)
        dest_conn.close()

        logger.info("Backup created: %s", dest_path)
        self.prune_backups()
        return str(dest_path)

    def prune_backups(self) -> None:
        """Keep only the latest max_backups files."""
        pattern = str(self.backup_dir / "adios_backup_*.db")
        files = sorted(glob.glob(pattern), key=os.path.getmtime, reverse=True)
        if len(files) > self.max_backups:
            for old_file in files[self.max_backups:]:
                try:
                    os.remove(old_file)
                    logger.info("Pruned old backup: %s", old_file)
                except Exception as e:
                    logger.warning("Failed to remove old backup %s: %s", old_file, e)

    def restore_backup(self, backup_file_path: str) -> bool:
        """Restore database from a backup file."""
        if not os.path.exists(backup_file_path):
            return False
        
        # Close active connection
        self.db.close()
        shutil.copy2(backup_file_path, self.db.db_path)
        # Reopen connection
        self.db.init_db()
        return True
