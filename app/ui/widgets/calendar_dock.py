"""Calendar month view dockable widget for ADIOS.

Displays:
- Interactive Month Grid (QCalendarWidget)
- Day Agenda list below showing items on the selected date (Exams, Schedule, Reminders)
- Double-click item opens it in its editor tab
"""
from __future__ import annotations
from typing import Any
from datetime import date, datetime

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QCalendarWidget, QListWidget, QListWidgetItem, QPushButton
)
from PySide6.QtCore import Qt, QDate
from app.core.tab_manager import TabKind


class CalendarDockWidget(QWidget):
    def __init__(self, registry: Any, db: Any, parent=None):
        super().__init__(parent)
        self.registry = registry
        self.db = db

        layout = QVBoxLayout(self)
        layout.setContentsMargins(4, 4, 4, 4)
        layout.setSpacing(6)

        self.calendar = QCalendarWidget()
        self.calendar.setGridVisible(True)
        layout.addWidget(self.calendar)

        self.lbl_selected = QLabel(f"<b>Agenda for {date.today().isoformat()}:</b>")
        layout.addWidget(self.lbl_selected)

        self.list_agenda = QListWidget()
        layout.addWidget(self.list_agenda)

        self.calendar.clicked.connect(self._on_date_clicked)
        self.list_agenda.itemDoubleClicked.connect(self._on_item_double_clicked)

        self.load_date_agenda(date.today())

    def _on_date_clicked(self, qd: QDate):
        target_d = qd.toPython()
        self.lbl_selected.setText(f"<b>Agenda for {target_d.isoformat()}:</b>")
        self.load_date_agenda(target_d)

    def load_date_agenda(self, target_d: date):
        self.list_agenda.clear()
        target_str = target_d.isoformat()

        # 1. Check Schedule occurrences
        sched_sec = self.registry.get("schedule")
        if sched_sec:
            try:
                occs = sched_sec.expand_occurrences(target_d, target_d)
                for o in occs:
                    t_str = "All Day" if o.get("all_day") else o.get("start_time")
                    item = QListWidgetItem(f"[Schedule] {t_str}: {o['title']}")
                    item.setData(Qt.ItemDataRole.UserRole, (o.get("source_type") or "Schedule", o.get("event_id")))
                    self.list_agenda.addItem(item)
            except Exception:
                pass

        # 2. Check Exams
        try:
            exams = self.db.fetchall("SELECT id, subject, exam_time, venue FROM exams WHERE exam_date = ? AND archived = 0", (target_str,))
            for ex in exams:
                item = QListWidgetItem(f"[Exam] {ex['exam_time'] or 'All Day'}: {ex['subject']} ({ex['venue'] or ''})")
                item.setData(Qt.ItemDataRole.UserRole, ("exams", ex["id"]))
                self.list_agenda.addItem(item)
        except Exception:
            pass

        # 3. Check Reminders
        try:
            reminders = self.db.fetchall("SELECT id, title, remind_at, item_type, item_id FROM reminders WHERE remind_at LIKE ? AND is_dismissed = 0", (f"{target_str}%",))
            for r in reminders:
                time_part = r["remind_at"].split(" ")[-1][:5]
                item = QListWidgetItem(f"[Reminder] {time_part}: {r['title']}")
                item.setData(Qt.ItemDataRole.UserRole, (r["item_type"], r["item_id"]))
                self.list_agenda.addItem(item)
        except Exception:
            pass

        # 4. Check Club Tasks
        try:
            tasks = self.db.fetchall("SELECT id, task FROM club_tasks WHERE deadline = ? AND archived = 0", (target_str,))
            for t in tasks:
                item = QListWidgetItem(f"[Club Task] Due: {t['task']}")
                item.setData(Qt.ItemDataRole.UserRole, ("clubs", t["id"]))
                self.list_agenda.addItem(item)
        except Exception:
            pass

        if self.list_agenda.count() == 0:
            self.list_agenda.addItem("No items scheduled for this day.")

    def _on_item_double_clicked(self, item: QListWidgetItem):
        data = item.data(Qt.ItemDataRole.UserRole)
        if not data:
            return
        sec_id, item_id = data
        if not item_id:
            return
        if sec_id.lower() in ("schedule", "exams", "clubs", "linkedin", "subscriptions", "money"):
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab(sec_id.lower(), TabKind.EDITOR, item_id=item_id)
