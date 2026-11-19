"""Section 7: Study Tracker for ADIOS.

Tables:
- study_sessions: (id, subject, topic, start_time, duration_minutes, rating [1-5], notes, created_at)
- study_goals: (id, subject, target_hours_per_week, created_at)

Features:
- LIST: Sortable table of study sessions, weekly/monthly total hours summary, subject filters.
- CREATE / EDITOR: Detailed session entry form with Subject, Topic, Date/Time picker, Stopwatch/Timer assistant, Rating (1-5), Focus efficiency (%), and detailed study notes.
- Quick Log Session assistant.
- Side panels: Tags, Reminders.
- Dashboard Widget: "Study Hours This Week" vs target goals.
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QTimeEdit, QSpinBox, QMessageBox, QHeaderView, QMenu,
    QSplitter, QGroupBox
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate, QTime, QTimer
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget
from app.core.svg_icons import SvgIconPack
from app.core.icons import WinIcons


class StudySessionsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Subject", "Topic", "Date", "Duration", "Rating", "Efficiency", "Notes"]

    def rowCount(self, parent=QModelIndex()):
        return len(self._data)

    def columnCount(self, parent=QModelIndex()):
        return len(self._headers)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid():
            return None
        item = self._data[index.row()]
        col = index.column()

        if role == Qt.ItemDataRole.DecorationRole and col == 1:
            return SvgIconPack.get("study", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("subject") or "-"
        elif col == 2:
            return item.get("topic") or "-"
        elif col == 3:
            return item.get("session_date") or "-"
        elif col == 4:
            mins = item.get("duration_minutes") or 0
            return f"{mins // 60}h {mins % 60}m" if mins >= 60 else f"{mins} mins"
        elif col == 5:
            r = item.get("rating", 3)
            return f"★ {r}/5"
        elif col == 6:
            return f"{item.get('efficiency', 100)}%"
        elif col == 7:
            notes = item.get("notes") or ""
            return notes[:40] + ("..." if len(notes) > 40 else "")
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None


class StudyListView(QWidget):
    def __init__(self, section: StudySection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        # Top Bar
        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("Log Study Session")
        self.btn_new.setIcon(WinIcons.get("new"))
        self.btn_refresh = QPushButton("Refresh")
        self.btn_refresh.setIcon(WinIcons.get("refresh"))
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter Subject:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Search subject or topic...")
        self.txt_filter.setFixedWidth(200)
        top_bar.addWidget(self.txt_filter)

        top_bar.addStretch()
        self.lbl_totals = QLabel("Total: 0 hrs")
        self.lbl_totals.setStyleSheet("font-weight: bold; color: #ea580c;")
        top_bar.addWidget(self.lbl_totals)
        layout.addLayout(top_bar)

        self.table = QTableView()
        self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self.table.setSortingEnabled(True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(True)
        self.table.verticalHeader().setDefaultSectionSize(26)
        self.table.verticalHeader().setVisible(False)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall("SELECT * FROM study_sessions ORDER BY session_date DESC, id DESC")
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        filtered = []
        total_mins = 0
        for it in self._all_items:
            sub = (it.get("subject") or "").lower()
            top = (it.get("topic") or "").lower()
            if q and (q not in sub and q not in top):
                continue
            filtered.append(it)
            total_mins += int(it.get("duration_minutes") or 0)

        self.model = StudySessionsTableModel(filtered)
        self.table.setModel(self.model)
        hrs = total_mins / 60.0
        self.lbl_totals.setText(f"{len(filtered)} Sessions | Total Study Time: {hrs:.1f} Hours")

    def _on_new(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.CREATE)

    def _on_double_click(self, index: QModelIndex):
        if not index.isValid():
            return
        item_id = self.model._data[index.row()]["id"]
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)


class StudyFormView(QWidget):
    """Detailed form for logging and reviewing study sessions."""

    def __init__(self, section: StudySection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Study Session #{item_id}" if item_id else "Log Study Session"
        self._loading = False
        self._timer_seconds = 0
        self._timer_running = False

        splitter = QSplitter(Qt.Orientation.Horizontal, self)
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        form = QFormLayout()

        # Subject & Topic
        self.txt_subject = QLineEdit()
        self.txt_subject.setPlaceholderText("e.g. Distributed Systems, Calculus, Organic Chemistry")
        form.addRow("Subject / Course*:", self.txt_subject)

        self.txt_topic = QLineEdit()
        self.txt_topic.setPlaceholderText("e.g. Paxos consensus, Integration by parts, Chapter 4 notes")
        form.addRow("Topic / Module:", self.txt_topic)

        # Session Date & Time
        h_datetime = QHBoxLayout()
        self.date_session = QDateEdit()
        self.date_session.setCalendarPopup(True)
        self.date_session.setDate(QDate.currentDate())
        h_datetime.addWidget(self.date_session)

        self.time_session = QTimeEdit()
        self.time_session.setTime(QTime.currentTime())
        h_datetime.addWidget(self.time_session)
        form.addRow("Session Date & Time:", h_datetime)

        # Duration & Stopwatch Assistant
        h_dur = QHBoxLayout()
        self.spin_duration = QSpinBox()
        self.spin_duration.setRange(1, 1440)
        self.spin_duration.setValue(45)
        self.spin_duration.setSuffix(" minutes")
        h_dur.addWidget(self.spin_duration)

        self.btn_timer = QPushButton("Start Stopwatch")
        self.btn_timer.setIcon(WinIcons.get("clock"))
        self.btn_timer.clicked.connect(self._toggle_stopwatch)
        h_dur.addWidget(self.btn_timer)

        self.lbl_stopwatch = QLabel("00:00:00")
        self.lbl_stopwatch.setStyleSheet("font-weight: bold; font-size: 14px; color: #ea580c; padding-left: 8px;")
        h_dur.addWidget(self.lbl_stopwatch)
        h_dur.addStretch()
        form.addRow("Duration:", h_dur)

        # Rating & Efficiency
        h_metrics = QHBoxLayout()
        self.spin_rating = QSpinBox()
        self.spin_rating.setRange(1, 5)
        self.spin_rating.setValue(4)
        self.spin_rating.setPrefix("★ ")
        h_metrics.addWidget(QLabel("Understanding (1-5):"))
        h_metrics.addWidget(self.spin_rating)

        self.spin_efficiency = QSpinBox()
        self.spin_efficiency.setRange(10, 100)
        self.spin_efficiency.setValue(90)
        self.spin_efficiency.setSuffix("%")
        h_metrics.addWidget(QLabel("Focus Efficiency:"))
        h_metrics.addWidget(self.spin_efficiency)
        h_metrics.addStretch()
        form.addRow("Performance Metrics:", h_metrics)

        # Detailed Notes & Key Takeaways
        self.txt_notes = QTextEdit()
        self.txt_notes.setPlaceholderText("Key insights, formulas memorized, questions for instructor, reference textbook pages...")
        self.txt_notes.setMinimumHeight(120)
        form.addRow("Session Notes & Takeaways:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Study Session")
        self.btn_save.setIcon(WinIcons.get("save"))
        self.btn_cancel = QPushButton("Cancel")
        self.btn_delete = QPushButton("Delete")
        self.btn_delete.setIcon(WinIcons.get("delete"))
        if not self.item_id:
            self.btn_delete.setVisible(False)

        btn_bar.addWidget(self.btn_save)
        btn_bar.addWidget(self.btn_cancel)
        btn_bar.addSpacing(15)
        btn_bar.addWidget(self.btn_delete)
        btn_bar.addStretch()
        layout.addLayout(btn_bar)

        splitter.addWidget(form_container)

        # Side Panels (Tags & Reminders)
        self.panels = ItemPanelsWidget("study", self.item_id, self.section.db, parent=self)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(splitter)

        # Stopwatch internal timer
        self._qt_timer = QTimer(self)
        self._qt_timer.timeout.connect(self._on_stopwatch_tick)

        # Signals
        self.txt_subject.textChanged.connect(self._on_dirty)
        self.txt_topic.textChanged.connect(self._on_dirty)
        self.spin_duration.valueChanged.connect(self._on_dirty)
        self.spin_rating.valueChanged.connect(self._on_dirty)
        self.spin_efficiency.valueChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _toggle_stopwatch(self):
        if not self._timer_running:
            self._timer_running = True
            self.btn_timer.setText("Stop & Log")
            self._qt_timer.start(1000)
        else:
            self._timer_running = False
            self.btn_timer.setText("Start Stopwatch")
            self._qt_timer.stop()
            # Convert seconds to minutes
            mins = max(1, self._timer_seconds // 60)
            self.spin_duration.setValue(mins)

    def _on_stopwatch_tick(self):
        self._timer_seconds += 1
        h = self._timer_seconds // 3600
        m = (self._timer_seconds % 3600) // 60
        s = self._timer_seconds % 60
        self.lbl_stopwatch.setText(f"{h:02d}:{m:02d}:{s:02d}")

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM study_sessions WHERE id = ?", (self.item_id,))
            if row:
                self.txt_subject.setText(row["subject"] or "")
                self.txt_topic.setText(row["topic"] or "")
                
                s_date = row["session_date"]
                if s_date:
                    qd = QDate.fromString(s_date, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_session.setDate(qd)

                self.spin_duration.setValue(int(row["duration_minutes"] or 45))
                self.spin_rating.setValue(int(row["rating"] or 4))
                self.spin_efficiency.setValue(int(row["efficiency"] or 90))
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = f"{row['subject']}: {row['topic']}" if row['topic'] else row['subject']

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        subject = self.txt_subject.text().strip()
        if not subject:
            QMessageBox.warning(self, "Validation Error", "Subject cannot be empty.")
            return False

        topic = self.txt_topic.text().strip()
        session_date = self.date_session.date().toString(Qt.DateFormat.ISODate)
        duration = self.spin_duration.value()
        rating = self.spin_rating.value()
        efficiency = self.spin_efficiency.value()
        notes = self.txt_notes.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO study_sessions 
                       (subject, topic, session_date, duration_minutes, rating, efficiency, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (subject, topic, session_date, duration, rating, efficiency, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = f"{subject}: {topic}" if topic else subject
                self.panels.update_item_id(self.item_id)
                self.btn_delete.setVisible(True)

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, self.item_title)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE study_sessions 
                       SET subject = ?, topic = ?, session_date = ?, duration_minutes = ?,
                           rating = ?, efficiency = ?, notes = ?
                       WHERE id = ?""",
                    (subject, topic, session_date, duration, rating, efficiency, notes, self.item_id)
                )
                self.item_title = f"{subject}: {topic}" if topic else subject

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Study session saved successfully.")
        return True

    def _on_cancel(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            idx = window.tab_manager.tab_widget.indexOf(self)
            if idx != -1:
                window.tab_manager.close_tab_by_index(idx)

    def _on_delete(self):
        if not self.item_id:
            return
        reply = QMessageBox.question(
            self, "Confirm Delete", "Are you sure you want to delete this study session?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM study_sessions WHERE id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class StudySection(BaseSection):
    id = "study"
    name = "Study Tracker"
    icon_name = "study"
    shortcut = "Alt+7"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS study_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT NOT NULL,
                    topic TEXT,
                    session_date TEXT,
                    duration_minutes INTEGER DEFAULT 45,
                    rating INTEGER DEFAULT 4,
                    efficiency INTEGER DEFAULT 90,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return StudyListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return StudyFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return StudyFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            start_week = (date.today() - timedelta(days=date.today().weekday())).isoformat()
            row = self.db.fetchone(
                "SELECT SUM(duration_minutes) as total_mins, COUNT(id) as cnt FROM study_sessions WHERE session_date >= ?",
                (start_week,)
            )
            total_mins = row["total_mins"] or 0 if row else 0
            cnt = row["cnt"] or 0 if row else 0
            hrs = total_mins / 60.0

            l.addWidget(QLabel(f"<b>This Week's Study:</b> {hrs:.1f} Hours ({cnt} sessions)"))
            btn = QPushButton("Log New Study Session")
            btn.clicked.connect(lambda: w.window().tab_manager.open_tab(self.id, TabKind.CREATE) if hasattr(w.window(), "tab_manager") else None)
            l.addWidget(btn)
            return w

        return [{
            "id": "study_weekly_summary",
            "name": "Weekly Study Progress",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT id, subject, topic, notes FROM study_sessions WHERE subject LIKE ? OR topic LIKE ? OR notes LIKE ?",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"Study: {r['subject']} - {r['topic']}",
            "snippet": (r["notes"] or "")[:100],
            "section_id": self.id
        } for r in rows]
