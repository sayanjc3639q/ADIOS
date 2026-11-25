"""Background reminder checker and notification system."""
from __future__ import annotations
from typing import TYPE_CHECKING
from datetime import datetime
import logging
from PySide6.QtCore import QTimer, QObject, Signal
from PySide6.QtWidgets import QSystemTrayIcon, QMessageBox

if TYPE_CHECKING:
    from app.core.main_window import MainWindow

logger = logging.getLogger("adios.reminders")

class ReminderSystem(QObject):
    """Checks for due reminders every minute and triggers system notifications."""

    reminder_triggered = Signal(dict)

    def __init__(self, main_window: MainWindow):
        super().__init__()
        self.mw = main_window
        self.timer = QTimer(self)
        self.timer.setInterval(60000) # 1 minute
        self.timer.timeout.connect(self.check_reminders)

    def start(self):
        self.timer.start()
        # Initial check
        self.check_reminders()

    def stop(self):
        self.timer.stop()

    def check_reminders(self):
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        db = self.mw.db
        rows = db.fetchall(
            """SELECT id, item_type, item_id, title, remind_at 
               FROM reminders 
               WHERE is_dismissed = 0 
               AND (snoozed_until IS NULL OR snoozed_until <= ?)
               AND remind_at <= ?""",
            (now_str, now_str)
        )
        for r in rows:
            data = dict(r)
            self._notify_reminder(data)

    def _notify_reminder(self, reminder: dict):
        # Update status bar or show tray message
        title = f"Reminder: {reminder['title']}"
        msg = f"Due at: {reminder['remind_at']}"
        logger.info("Reminder triggered: %s", reminder)

        # Show desktop alert
        reply = QMessageBox.information(
            self.mw,
            title,
            f"{msg}\n\nDismiss or Snooze 10 minutes?",
            QMessageBox.StandardButton.Ok | QMessageBox.StandardButton.Cancel,
            QMessageBox.StandardButton.Ok
        )
        if reply == QMessageBox.StandardButton.Ok:
            # Dismiss
            with self.mw.db.get_connection():
                self.mw.db.execute("UPDATE reminders SET is_dismissed = 1 WHERE id = ?", (reminder["id"],))
        else:
            # Snooze 10 mins
            from datetime import timedelta
            snooze_time = (datetime.now() + timedelta(minutes=10)).strftime("%Y-%m-%d %H:%M:%S")
            with self.mw.db.get_connection():
                self.mw.db.execute("UPDATE reminders SET snoozed_until = ? WHERE id = ?", (snooze_time, reminder["id"]))
