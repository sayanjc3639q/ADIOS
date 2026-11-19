"""Home tab view displaying key summaries."""
from __future__ import annotations
from typing import Any
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QGroupBox, QListWidget, QListWidgetItem, QPushButton
)
from PySide6.QtCore import Qt

class HomeView(QWidget):
    def __init__(self, registry: Any, tab_manager: Any, parent=None):
        super().__init__(parent)
        self.registry = registry
        self.tab_manager = tab_manager

        layout = QVBoxLayout(self)
        
        # Header
        header = QHBoxLayout()
        title = QLabel("<h2>Welcome to ADIOS</h2>")
        btn_refresh = QPushButton("Refresh")
        btn_refresh.clicked.connect(self.refresh)
        header.addWidget(title)
        header.addStretch()
        header.addWidget(btn_refresh)
        layout.addLayout(header)

        # Overview boxes
        self.box_events = QGroupBox("Today's Events / Schedule")
        layout_events = QVBoxLayout(self.box_events)
        self.list_events = QListWidget()
        layout_events.addWidget(self.list_events)

        self.box_tasks = QGroupBox("Upcoming Exams & Tasks")
        layout_tasks = QVBoxLayout(self.box_tasks)
        self.list_tasks = QListWidget()
        layout_tasks.addWidget(self.list_tasks)

        self.box_posts = QGroupBox("LinkedIn Posts Ready / Scheduled")
        layout_posts = QVBoxLayout(self.box_posts)
        self.list_posts = QListWidget()
        layout_posts.addWidget(self.list_posts)

        layout.addWidget(self.box_events)
        layout.addWidget(self.box_tasks)
        layout.addWidget(self.box_posts)

        self.list_events.itemDoubleClicked.connect(self._on_item_double_clicked)
        self.list_tasks.itemDoubleClicked.connect(self._on_item_double_clicked)
        self.list_posts.itemDoubleClicked.connect(self._on_item_double_clicked)

        self.refresh()

    def refresh(self):
        self.list_events.clear()
        self.list_tasks.clear()
        self.list_posts.clear()

        # Check sections if available
        # LinkedIn
        li_sec = self.registry.get("linkedin")
        if li_sec:
            rows = self.registry.db.fetchall(
                "SELECT id, title, status, planned_date FROM linkedin_posts WHERE status IN ('Ready', 'Scheduled') ORDER BY planned_date ASC"
            )
            for r in rows:
                item = QListWidgetItem(f"[{r['status']}] {r['title']} (Planned: {r['planned_date'] or 'N/A'})")
                item.setData(Qt.ItemDataRole.UserRole, ("linkedin", r["id"]))
                self.list_posts.addItem(item)
            if not rows:
                self.list_posts.addItem("No posts scheduled or ready.")
        else:
            self.list_posts.addItem("LinkedIn section not loaded.")

        # Exams
        exam_sec = self.registry.get("exams")
        if exam_sec:
            rows = self.registry.db.fetchall("SELECT id, subject, exam_date, exam_time FROM exams ORDER BY exam_date ASC LIMIT 5")
            for r in rows:
                item = QListWidgetItem(f"Exam: {r['subject']} on {r['exam_date']} {r['exam_time']}")
                item.setData(Qt.ItemDataRole.UserRole, ("exams", r["id"]))
                self.list_tasks.addItem(item)
            if not rows:
                self.list_tasks.addItem("No upcoming exams.")
        else:
            self.list_tasks.addItem("Exams section not loaded.")

        # Events
        sched_sec = self.registry.get("schedule")
        if sched_sec:
            self.list_events.addItem("Schedule active.")
        else:
            self.list_events.addItem("No schedule events.")

    def _on_item_double_clicked(self, item: QListWidgetItem):
        data = item.data(Qt.ItemDataRole.UserRole)
        if data:
            sec_id, item_id = data
            from app.core.tab_manager import TabKind
            self.tab_manager.open_tab(sec_id, TabKind.EDITOR, item_id=item_id)
