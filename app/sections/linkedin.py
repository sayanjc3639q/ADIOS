"""LinkedIn Queue section for ADIOS.

Features:
- title, body (multiline, live character counter)
- status (Idea / Drafting / Ready / Scheduled / Posted)
- planned_date, tags, notes
- Copy to Clipboard, Mark as Posted (NO auto-posting)
- QTableView list with sorting, quick filter, status filter, row count in status bar
- Create & Editor sharing form with mode flag
- Dashboard widget: Posts ready/scheduled
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QMessageBox, QApplication, QHeaderView
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind


STATUS_OPTIONS = ["Idea", "Drafting", "Ready", "Scheduled", "Posted"]


class LinkedInTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Title", "Status", "Planned Date", "Char Count", "Tags"]

    def rowCount(self, parent=QModelIndex()):
        return len(self._data)

    def columnCount(self, parent=QModelIndex()):
        return len(self._headers)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid() or role != Qt.ItemDataRole.DisplayRole:
            return None
        item = self._data[index.row()]
        col = index.column()
        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("title")
        elif col == 2:
            return item.get("status")
        elif col == 3:
            return item.get("planned_date") or "-"
        elif col == 4:
            return len(item.get("body") or "")
        elif col == 5:
            return item.get("tags") or ""
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("id") or 0,
            1: lambda x: (x.get("title") or "").lower(),
            2: lambda x: (x.get("status") or "").lower(),
            3: lambda x: x.get("planned_date") or "",
            4: lambda x: len(x.get("body") or ""),
            5: lambda x: (x.get("tags") or "").lower(),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class LinkedInListView(QWidget):
    def __init__(self, section: LinkedInSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        # Top control bar
        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Post")
        self.btn_refresh = QPushButton("Refresh")
        
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Filter by title or tags...")
        self.txt_filter.setFixedWidth(180)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Status:"))
        self.cmb_status = QComboBox()
        self.cmb_status.addItem("All Statuses")
        self.cmb_status.addItems(STATUS_OPTIONS)
        top_bar.addWidget(self.cmb_status)

        top_bar.addStretch()

        self.lbl_count = QLabel("0 posts")
        top_bar.addWidget(self.lbl_count)

        layout.addLayout(top_bar)

        # Table View
        self.table = QTableView()
        self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self.table.setSortingEnabled(True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(True)
        self.table.verticalHeader().setDefaultSectionSize(26)
        self.table.verticalHeader().setVisible(False)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        # Signals
        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_status.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall(
            "SELECT id, title, body, status, planned_date, tags, notes FROM linkedin_posts ORDER BY id DESC"
        )
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        query = self.txt_filter.text().strip().lower()
        status_filter = self.cmb_status.currentText()

        filtered = []
        for item in self._all_items:
            if status_filter != "All Statuses" and item.get("status") != status_filter:
                continue
            if query:
                title = (item.get("title") or "").lower()
                tags = (item.get("tags") or "").lower()
                if query not in title and query not in tags:
                    continue
            filtered.append(item)

        self.model = LinkedInTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_count.setText(f"{len(filtered)} / {len(self._all_items)} posts")

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


class LinkedInFormView(QWidget):
    """Unified Editor and Create form for LinkedIn queue items."""

    def __init__(self, section: LinkedInSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Post #{item_id}" if item_id else "New Post"
        self._loading = False

        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(8)

        form = QFormLayout()
        form.setFieldGrowthPolicy(QFormLayout.FieldGrowthPolicy.ExpandingFieldsGrow)

        self.txt_title = QLineEdit()
        form.addRow("Title:", self.txt_title)

        # Status & Planned Date row
        h_meta = QHBoxLayout()
        self.cmb_status = QComboBox()
        self.cmb_status.addItems(STATUS_OPTIONS)
        h_meta.addWidget(self.cmb_status)

        h_meta.addWidget(QLabel("Planned Date:"))
        self.date_planned = QDateEdit()
        self.date_planned.setCalendarPopup(True)
        self.date_planned.setDate(QDate.currentDate())
        h_meta.addWidget(self.date_planned)
        h_meta.addStretch()
        form.addRow("Status / Date:", h_meta)

        self.txt_tags = QLineEdit()
        self.txt_tags.setPlaceholderText("comma-separated e.g. python, career, qt")
        form.addRow("Tags:", self.txt_tags)

        # Body with Live Character Counter
        self.txt_body = QTextEdit()
        self.txt_body.setAcceptRichText(False)
        self.lbl_char_count = QLabel("Characters: 0 / 3000 (ideal: 1,000 - 1,800)")
        body_box = QVBoxLayout()
        body_box.addWidget(self.txt_body)
        body_box.addWidget(self.lbl_char_count)
        form.addRow("Body:", body_box)

        self.txt_notes = QTextEdit()
        self.txt_notes.setMaximumHeight(80)
        self.txt_notes.setPlaceholderText("Internal notes or brainstorming...")
        form.addRow("Internal Notes:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save")
        self.btn_cancel = QPushButton("Cancel")
        self.btn_copy = QPushButton("Copy to Clipboard")
        self.btn_mark_posted = QPushButton("Mark as Posted")
        self.btn_delete = QPushButton("Delete")
        if not self.item_id:
            self.btn_delete.setVisible(False)

        btn_bar.addWidget(self.btn_save)
        btn_bar.addWidget(self.btn_cancel)
        btn_bar.addSpacing(15)
        btn_bar.addWidget(self.btn_copy)
        btn_bar.addWidget(self.btn_mark_posted)
        btn_bar.addSpacing(15)
        btn_bar.addWidget(self.btn_delete)
        btn_bar.addStretch()

        layout.addLayout(btn_bar)

        # Signal connections
        self.txt_body.textChanged.connect(self._on_body_changed)
        self.txt_title.textChanged.connect(self._on_dirty)
        self.cmb_status.currentTextChanged.connect(self._on_dirty)
        self.date_planned.dateChanged.connect(self._on_dirty)
        self.txt_tags.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_copy.clicked.connect(self._on_copy)
        self.btn_mark_posted.clicked.connect(self._on_mark_posted)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _on_body_changed(self):
        chars = len(self.txt_body.toPlainText())
        self.lbl_char_count.setText(f"Characters: {chars} / 3000 (ideal: 1,000 - 1,800)")
        self._on_dirty()

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM linkedin_posts WHERE id = ?", (self.item_id,))
            if row:
                self.txt_title.setText(row["title"] or "")
                idx = self.cmb_status.findText(row["status"] or "Drafting")
                if idx != -1:
                    self.cmb_status.setCurrentIndex(idx)
                
                pdate_str = row["planned_date"]
                if pdate_str:
                    try:
                        qdate = QDate.fromString(pdate_str, Qt.DateFormat.ISODate)
                        if qdate.isValid():
                            self.date_planned.setDate(qdate)
                    except Exception:
                        pass

                self.txt_tags.setText(row["tags"] or "")
                self.txt_body.setPlainText(row["body"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["title"] or f"#{self.item_id}"
                
                chars = len(row["body"] or "")
                self.lbl_char_count.setText(f"Characters: {chars} / 3000 (ideal: 1,000 - 1,800)")
                
                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        title = self.txt_title.text().strip()
        if not title:
            QMessageBox.warning(self, "Validation Error", "Post title cannot be empty.")
            return False

        body = self.txt_body.toPlainText()
        status = self.cmb_status.currentText()
        planned_date = self.date_planned.date().toString(Qt.DateFormat.ISODate)
        tags = self.txt_tags.text().strip()
        notes = self.txt_notes.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO linkedin_posts (title, body, status, planned_date, tags, notes)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (title, body, status, planned_date, tags, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = title
            
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, title)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE linkedin_posts 
                       SET title = ?, body = ?, status = ?, planned_date = ?, tags = ?, notes = ?
                       WHERE id = ?""",
                    (title, body, status, planned_date, tags, notes, self.item_id)
                )
                self.item_title = title

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "LinkedIn post saved successfully.")
        return True

    def _on_copy(self):
        text = self.txt_body.toPlainText()
        if not text:
            QMessageBox.information(self, "Copy", "Body is empty.")
            return
        clipboard = QApplication.clipboard()
        clipboard.setText(text)
        QMessageBox.information(self, "Clipboard", f"Copied {len(text)} characters to clipboard.")

    def _on_mark_posted(self):
        idx = self.cmb_status.findText("Posted")
        if idx != -1:
            self.cmb_status.setCurrentIndex(idx)
            self.save_item()

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
            self, "Confirm Delete", "Are you sure you want to delete this LinkedIn post?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM linkedin_posts WHERE id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class LinkedInSection(BaseSection):
    id = "linkedin"
    name = "LinkedIn Queue"
    icon_name = "edit"
    shortcut = "Alt+1"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS linkedin_posts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    body TEXT,
                    status TEXT DEFAULT 'Idea',
                    planned_date TEXT,
                    tags TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return LinkedInListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return LinkedInFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return LinkedInFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            ready_count = self.db.fetchone("SELECT COUNT(*) FROM linkedin_posts WHERE status = 'Ready'")[0]
            sched_count = self.db.fetchone("SELECT COUNT(*) FROM linkedin_posts WHERE status = 'Scheduled'")[0]
            draft_count = self.db.fetchone("SELECT COUNT(*) FROM linkedin_posts WHERE status = 'Drafting'")[0]
            
            lbl = QLabel(f"Ready: {ready_count} | Scheduled: {sched_count}\nDrafting: {draft_count}")
            l.addWidget(lbl)

            btn = QPushButton("Open Queue")
            btn.clicked.connect(lambda: w.window().tab_manager.open_tab(self.id, TabKind.LIST) if hasattr(w.window(), "tab_manager") else None)
            l.addWidget(btn)
            return w

        return [{
            "id": "linkedin_summary",
            "name": "LinkedIn Queue Status",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            """SELECT id, title, body, status FROM linkedin_posts 
               WHERE title LIKE ? OR body LIKE ? OR tags LIKE ?""",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"[{r['status']}] {r['title']}",
            "snippet": (r["body"] or "")[:120],
            "section_id": self.id
        } for r in rows]

    def reminder_rules(self) -> List[Dict[str, Any]]:
        # Posts scheduled with planned_date
        rows = self.db.fetchall(
            "SELECT id, title, planned_date FROM linkedin_posts WHERE status = 'Scheduled' AND planned_date IS NOT NULL"
        )
        return [{
            "item_type": "linkedin",
            "item_id": r["id"],
            "title": f"Scheduled Post: {r['title']}",
            "remind_at": f"{r['planned_date']} 09:00:00"
        } for r in rows]
