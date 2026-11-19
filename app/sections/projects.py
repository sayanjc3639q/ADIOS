"""Section 8: Project Wishlist for ADIOS.

Tables:
- projects: (id, title, category, priority [Low/Medium/High], status [Idea/Planning/Active/Completed/Paused], tech_stack, target_date, repo_url, live_url, description, notes, created_at, updated_at)
- project_milestones: (id, project_id, title, is_completed, due_date)

Features:
- LIST: Sortable table with Status & Priority filters, Tech Stack tags, Milestone progress indicator.
- CREATE / EDITOR: Detailed specifications form (Title, Category, Tech Stack, Priority, Status, Target Completion Date, GitHub Repo URL, Live Deployment URL, Architecture Notes, Interactive Milestones checklist).
- Side panels: Tags, Linked Items, Reminders.
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QMessageBox, QHeaderView, QSplitter, QListWidget, QListWidgetItem, QInputDialog
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget
from app.core.svg_icons import SvgIconPack
from app.core.icons import WinIcons


PROJECT_STATUSES = ["Idea", "Planning", "In Development", "Completed", "On Hold"]
PROJECT_PRIORITIES = ["High", "Medium", "Low"]


class ProjectsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Project Title", "Category", "Status", "Priority", "Target Date", "Tech Stack"]

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
            return SvgIconPack.get("project", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("title") or "-"
        elif col == 2:
            return item.get("category") or "-"
        elif col == 3:
            return item.get("status") or "-"
        elif col == 4:
            return item.get("priority") or "-"
        elif col == 5:
            return item.get("target_date") or "-"
        elif col == 6:
            return item.get("tech_stack") or "-"
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None


class ProjectsListView(QWidget):
    def __init__(self, section: ProjectsSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Project")
        self.btn_new.setIcon(WinIcons.get("new"))
        self.btn_refresh = QPushButton("Refresh")
        self.btn_refresh.setIcon(WinIcons.get("refresh"))
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Search title, stack, or category...")
        self.txt_filter.setFixedWidth(200)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Status:"))
        self.cmb_status = QComboBox()
        self.cmb_status.addItem("All")
        self.cmb_status.addItems(PROJECT_STATUSES)
        top_bar.addWidget(self.cmb_status)

        top_bar.addStretch()
        self.lbl_counts = QLabel("0 Projects")
        self.lbl_counts.setStyleSheet("font-weight: bold; color: #4f46e5;")
        top_bar.addWidget(self.lbl_counts)
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
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_status.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall("SELECT * FROM projects ORDER BY id DESC")
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        st = self.cmb_status.currentText()
        filtered = []
        for it in self._all_items:
            if st != "All" and it.get("status") != st:
                continue
            title = (it.get("title") or "").lower()
            stack = (it.get("tech_stack") or "").lower()
            cat = (it.get("category") or "").lower()
            if q and (q not in title and q not in stack and q not in cat):
                continue
            filtered.append(it)

        self.model = ProjectsTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_counts.setText(f"{len(filtered)} of {len(self._all_items)} Projects")

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
            window.tab_manager.open_tab(self.section.id, TabKind.VIEW, item_id=item_id)


class ProjectsFormView(QWidget):
    """Detailed Project specifications form."""

    def __init__(self, section: ProjectsSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Project #{item_id}" if item_id else "New Project"
        self._loading = False

        splitter = QSplitter(Qt.Orientation.Horizontal, self)
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        form = QFormLayout()

        # Title & Category
        self.txt_title = QLineEdit()
        self.txt_title.setPlaceholderText("e.g. AI-Powered Personal Dashboard, Microservices Engine")
        form.addRow("Project Title*:", self.txt_title)

        h_cat = QHBoxLayout()
        self.txt_category = QLineEdit()
        self.txt_category.setPlaceholderText("e.g. Web App, CLI Tool, Embedded, Mobile")
        h_cat.addWidget(self.txt_category)

        self.cmb_status = QComboBox()
        self.cmb_status.addItems(PROJECT_STATUSES)
        h_cat.addWidget(QLabel("Status:"))
        h_cat.addWidget(self.cmb_status)

        self.cmb_priority = QComboBox()
        self.cmb_priority.addItems(PROJECT_PRIORITIES)
        h_cat.addWidget(QLabel("Priority:"))
        h_cat.addWidget(self.cmb_priority)
        form.addRow("Classification:", h_cat)

        # Tech Stack & Target Date
        h_tech = QHBoxLayout()
        self.txt_stack = QLineEdit()
        self.txt_stack.setPlaceholderText("e.g. Python, PySide6, SQLite, React, Rust, Docker")
        h_tech.addWidget(self.txt_stack)

        self.date_target = QDateEdit()
        self.date_target.setCalendarPopup(True)
        self.date_target.setDate(QDate.currentDate().addMonths(3))
        h_tech.addWidget(QLabel("Target Completion:"))
        h_tech.addWidget(self.date_target)
        form.addRow("Tech Stack & Date:", h_tech)

        # URLs
        h_urls = QHBoxLayout()
        self.txt_repo = QLineEdit()
        self.txt_repo.setPlaceholderText("https://github.com/user/project")
        h_urls.addWidget(QLabel("Repository:"))
        h_urls.addWidget(self.txt_repo)

        self.txt_live = QLineEdit()
        self.txt_live.setPlaceholderText("https://project.domain.com")
        h_urls.addWidget(QLabel("Live URL:"))
        h_urls.addWidget(self.txt_live)
        form.addRow("Links & Repos:", h_urls)

        # Milestones Checklist
        h_miles = QVBoxLayout()
        self.list_milestones = QListWidget()
        self.list_milestones.setFixedHeight(110)
        h_miles.addWidget(self.list_milestones)

        m_bar = QHBoxLayout()
        btn_add_m = QPushButton("+ Add Milestone")
        btn_add_m.clicked.connect(self._add_milestone)
        btn_toggle_m = QPushButton("Toggle Completed")
        btn_toggle_m.clicked.connect(self._toggle_milestone)
        btn_del_m = QPushButton("Remove")
        btn_del_m.clicked.connect(self._delete_milestone)
        m_bar.addWidget(btn_add_m)
        m_bar.addWidget(btn_toggle_m)
        m_bar.addWidget(btn_del_m)
        m_bar.addStretch()
        h_miles.addLayout(m_bar)
        form.addRow("Key Milestones:", h_miles)

        # Architecture & Detailed Notes
        self.txt_notes = QTextEdit()
        self.txt_notes.setPlaceholderText("System architecture overview, API schemas, future feature roadmap, blockers...")
        self.txt_notes.setMinimumHeight(100)
        form.addRow("Specifications & Notes:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Project")
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

        self.panels = ItemPanelsWidget("projects", self.item_id, self.section.db, parent=self)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(splitter)

        # Signals
        self.txt_title.textChanged.connect(self._on_dirty)
        self.txt_category.textChanged.connect(self._on_dirty)
        self.cmb_status.currentTextChanged.connect(self._on_dirty)
        self.cmb_priority.currentTextChanged.connect(self._on_dirty)
        self.txt_stack.textChanged.connect(self._on_dirty)
        self.txt_repo.textChanged.connect(self._on_dirty)
        self.txt_live.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _add_milestone(self):
        text, ok = QInputDialog.getText(self, "Add Milestone", "Enter milestone description:")
        if ok and text.strip():
            it = QListWidgetItem(f"[ ] {text.strip()}")
            it.setData(Qt.ItemDataRole.UserRole, False)
            self.list_milestones.addItem(it)
            self._on_dirty()

    def _toggle_milestone(self):
        row = self.list_milestones.currentRow()
        if row != -1:
            it = self.list_milestones.item(row)
            done = not it.data(Qt.ItemDataRole.UserRole)
            it.setData(Qt.ItemDataRole.UserRole, done)
            clean_text = it.text().replace("[X] ", "").replace("[ ] ", "")
            it.setText(f"[X] {clean_text}" if done else f"[ ] {clean_text}")
            self._on_dirty()

    def _delete_milestone(self):
        row = self.list_milestones.currentRow()
        if row != -1:
            self.list_milestones.takeItem(row)
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
            row = self.section.db.fetchone("SELECT * FROM projects WHERE id = ?", (self.item_id,))
            if row:
                self.txt_title.setText(row["title"] or "")
                self.txt_category.setText(row["category"] or "")
                
                idx_s = self.cmb_status.findText(row["status"] or "Planning")
                if idx_s != -1:
                    self.cmb_status.setCurrentIndex(idx_s)

                idx_p = self.cmb_priority.findText(row["priority"] or "Medium")
                if idx_p != -1:
                    self.cmb_priority.setCurrentIndex(idx_p)

                self.txt_stack.setText(row["tech_stack"] or "")
                
                t_date = row["target_date"]
                if t_date:
                    qd = QDate.fromString(t_date, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_target.setDate(qd)

                self.txt_repo.setText(row["repo_url"] or "")
                self.txt_live.setText(row["live_url"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["title"] or f"Project #{self.item_id}"

                # Load milestones
                m_rows = self.section.db.fetchall("SELECT title, is_completed FROM project_milestones WHERE project_id = ?", (self.item_id,))
                self.list_milestones.clear()
                for m in m_rows:
                    done = bool(m["is_completed"])
                    prefix = "[X] " if done else "[ ] "
                    it = QListWidgetItem(f"{prefix}{m['title']}")
                    it.setData(Qt.ItemDataRole.UserRole, done)
                    self.list_milestones.addItem(it)

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        title = self.txt_title.text().strip()
        if not title:
            QMessageBox.warning(self, "Validation Error", "Project Title cannot be empty.")
            return False

        category = self.txt_category.text().strip()
        status = self.cmb_status.currentText()
        priority = self.cmb_priority.currentText()
        stack = self.txt_stack.text().strip()
        target_date = self.date_target.date().toString(Qt.DateFormat.ISODate)
        repo = self.txt_repo.text().strip()
        live = self.txt_live.text().strip()
        notes = self.txt_notes.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO projects 
                       (title, category, status, priority, tech_stack, target_date, repo_url, live_url, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (title, category, status, priority, stack, target_date, repo, live, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = title
                self.panels.update_item_id(self.item_id)
                self.btn_delete.setVisible(True)

                # Save milestones
                for idx in range(self.list_milestones.count()):
                    it = self.list_milestones.item(idx)
                    done = 1 if it.data(Qt.ItemDataRole.UserRole) else 0
                    m_title = it.text().replace("[X] ", "").replace("[ ] ", "")
                    self.section.db.execute(
                        "INSERT INTO project_milestones (project_id, title, is_completed) VALUES (?, ?, ?)",
                        (self.item_id, m_title, done)
                    )

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, title)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE projects 
                       SET title = ?, category = ?, status = ?, priority = ?, tech_stack = ?,
                           target_date = ?, repo_url = ?, live_url = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (title, category, status, priority, stack, target_date, repo, live, notes, self.item_id)
                )
                self.item_title = title

                # Replace milestones
                self.section.db.execute("DELETE FROM project_milestones WHERE project_id = ?", (self.item_id,))
                for idx in range(self.list_milestones.count()):
                    it = self.list_milestones.item(idx)
                    done = 1 if it.data(Qt.ItemDataRole.UserRole) else 0
                    m_title = it.text().replace("[X] ", "").replace("[ ] ", "")
                    self.section.db.execute(
                        "INSERT INTO project_milestones (project_id, title, is_completed) VALUES (?, ?, ?)",
                        (self.item_id, m_title, done)
                    )

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Project saved successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this project?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM projects WHERE id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM project_milestones WHERE project_id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class ProjectsSection(BaseSection):
    id = "projects"
    name = "Project Wishlist"
    icon_name = "project"
    shortcut = "Alt+8"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS projects (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT,
                    status TEXT DEFAULT 'Planning',
                    priority TEXT DEFAULT 'Medium',
                    tech_stack TEXT,
                    target_date TEXT,
                    repo_url TEXT,
                    live_url TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS project_milestones (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    project_id INTEGER NOT NULL,
                    title TEXT NOT NULL,
                    is_completed INTEGER DEFAULT 0,
                    due_date TEXT,
                    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ProjectsListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return ProjectsFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ProjectsFormView(self, None, parent)

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT id, title, category, tech_stack, notes FROM projects WHERE title LIKE ? OR tech_stack LIKE ? OR notes LIKE ?",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"Project: {r['title']} ({r['category'] or 'General'})",
            "snippet": f"Stack: {r['tech_stack'] or 'N/A'} - {r['notes'] or ''}"[:100],
            "section_id": self.id
        } for r in rows]
