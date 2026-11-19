"""Section 10: Skills Inventory for ADIOS.

Tables:
- skills: (id, name, category [Programming/Framework/DevOps/Database/Design/Soft Skill], proficiency_level [Beginner/Intermediate/Advanced/Expert], progress_percent [0-100], target_level, proof_links, notes, created_at, updated_at)

Features:
- LIST: Sortable grid with Proficiency badges, visual Progress Bar representations, and category filters.
- CREATE / EDITOR: Detailed skill evaluation form (Name, Category, Current Proficiency Level, Progress %, Target Proficiency, Learning Resources / Proof Links, Milestones/Project Applications, Notes).
- Side panels: Tags, Linked Items, Reminders.
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QSpinBox, QMessageBox, QHeaderView, QSplitter, QProgressBar
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget
from app.core.svg_icons import SvgIconPack
from app.core.icons import WinIcons


SKILL_CATEGORIES = ["Programming Language", "Framework / Library", "Database & Storage", "Cloud & DevOps", "System Architecture", "Design & UI/UX", "Soft Skill"]
PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]


class SkillsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Skill Name", "Category", "Level", "Progress", "Target", "Resources"]

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
            return SvgIconPack.get("skills", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("name") or "-"
        elif col == 2:
            return item.get("category") or "-"
        elif col == 3:
            return item.get("proficiency_level") or "-"
        elif col == 4:
            return f"{item.get('progress_percent', 0)}%"
        elif col == 5:
            return item.get("target_level") or "-"
        elif col == 6:
            res = item.get("proof_links") or ""
            return res[:30] + ("..." if len(res) > 30 else "")
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None


class SkillsListView(QWidget):
    def __init__(self, section: SkillsSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Skill Entry")
        self.btn_new.setIcon(WinIcons.get("new"))
        self.btn_refresh = QPushButton("Refresh")
        self.btn_refresh.setIcon(WinIcons.get("refresh"))
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Filter skill or category...")
        self.txt_filter.setFixedWidth(200)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Category:"))
        self.cmb_cat = QComboBox()
        self.cmb_cat.addItem("All Categories")
        self.cmb_cat.addItems(SKILL_CATEGORIES)
        top_bar.addWidget(self.cmb_cat)

        top_bar.addStretch()
        self.lbl_counts = QLabel("0 Skills")
        self.lbl_counts.setStyleSheet("font-weight: bold; color: #0284c7;")
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
        self.cmb_cat.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall("SELECT * FROM skills ORDER BY category ASC, name ASC")
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        cat = self.cmb_cat.currentText()
        filtered = []
        for it in self._all_items:
            if cat != "All Categories" and it.get("category") != cat:
                continue
            name = (it.get("name") or "").lower()
            if q and (q not in name and q not in (it.get("category") or "").lower()):
                continue
            filtered.append(it)

        self.model = SkillsTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_counts.setText(f"{len(filtered)} Skills Tracked")

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


class SkillsFormView(QWidget):
    """Detailed Skill assessment and learning plan form."""

    def __init__(self, section: SkillsSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Skill #{item_id}" if item_id else "New Skill"
        self._loading = False

        splitter = QSplitter(Qt.Orientation.Horizontal, self)
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        form = QFormLayout()

        self.txt_name = QLineEdit()
        self.txt_name.setPlaceholderText("e.g. Python, Rust, Qt/PySide6, Docker, PostgreSQL")
        form.addRow("Skill Name*:", self.txt_name)

        self.cmb_category = QComboBox()
        self.cmb_category.addItems(SKILL_CATEGORIES)
        form.addRow("Category:", self.cmb_category)

        h_levels = QHBoxLayout()
        self.cmb_current_level = QComboBox()
        self.cmb_current_level.addItems(PROFICIENCY_LEVELS)
        self.cmb_current_level.setCurrentText("Intermediate")
        h_levels.addWidget(self.cmb_current_level)

        self.cmb_target_level = QComboBox()
        self.cmb_target_level.addItems(PROFICIENCY_LEVELS)
        self.cmb_target_level.setCurrentText("Advanced")
        h_levels.addWidget(QLabel("Target Proficiency:"))
        h_levels.addWidget(self.cmb_target_level)
        form.addRow("Current & Target Level:", h_levels)

        h_prog = QHBoxLayout()
        self.spin_progress = QSpinBox()
        self.spin_progress.setRange(0, 100)
        self.spin_progress.setValue(60)
        self.spin_progress.setSuffix("%")
        h_prog.addWidget(self.spin_progress)

        self.progress_bar = QProgressBar()
        self.progress_bar.setRange(0, 100)
        self.progress_bar.setValue(60)
        h_prog.addWidget(self.progress_bar)
        form.addRow("Learning Mastery Progress:", h_prog)

        self.txt_proof = QLineEdit()
        self.txt_proof.setPlaceholderText("e.g. GitHub repos, certifications, articles written, project URLs")
        form.addRow("Proof / Project Links:", self.txt_proof)

        self.txt_notes = QTextEdit()
        self.txt_notes.setPlaceholderText("Core concepts mastered, remaining gaps to close, books read, next practice project...")
        self.txt_notes.setMinimumHeight(120)
        form.addRow("Skill Roadmap & Notes:", self.txt_notes)

        layout.addLayout(form)

        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Skill")
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

        self.panels = ItemPanelsWidget("skills", self.item_id, self.section.db, parent=self)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(splitter)

        self.txt_name.textChanged.connect(self._on_dirty)
        self.cmb_category.currentTextChanged.connect(self._on_dirty)
        self.cmb_current_level.currentTextChanged.connect(self._on_dirty)
        self.cmb_target_level.currentTextChanged.connect(self._on_dirty)
        self.spin_progress.valueChanged.connect(self._on_progress_changed)
        self.txt_proof.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _on_progress_changed(self, val: int):
        self.progress_bar.setValue(val)
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
            row = self.section.db.fetchone("SELECT * FROM skills WHERE id = ?", (self.item_id,))
            if row:
                self.txt_name.setText(row["name"] or "")
                idx_c = self.cmb_category.findText(row["category"] or "")
                if idx_c != -1:
                    self.cmb_category.setCurrentIndex(idx_c)

                idx_l = self.cmb_current_level.findText(row["proficiency_level"] or "Intermediate")
                if idx_l != -1:
                    self.cmb_current_level.setCurrentIndex(idx_l)

                idx_t = self.cmb_target_level.findText(row["target_level"] or "Advanced")
                if idx_t != -1:
                    self.cmb_target_level.setCurrentIndex(idx_t)

                prog = int(row["progress_percent"] or 0)
                self.spin_progress.setValue(prog)
                self.progress_bar.setValue(prog)

                self.txt_proof.setText(row["proof_links"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["name"] or f"Skill #{self.item_id}"

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        name = self.txt_name.text().strip()
        if not name:
            QMessageBox.warning(self, "Validation Error", "Skill Name cannot be empty.")
            return False

        category = self.cmb_category.currentText()
        current_level = self.cmb_current_level.currentText()
        target_level = self.cmb_target_level.currentText()
        progress = self.spin_progress.value()
        proof = self.txt_proof.text().strip()
        notes = self.txt_notes.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO skills 
                       (name, category, proficiency_level, progress_percent, target_level, proof_links, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (name, category, current_level, progress, target_level, proof, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = name
                self.panels.update_item_id(self.item_id)
                self.btn_delete.setVisible(True)

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, name)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE skills 
                       SET name = ?, category = ?, proficiency_level = ?, progress_percent = ?,
                           target_level = ?, proof_links = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (name, category, current_level, progress, target_level, proof, notes, self.item_id)
                )
                self.item_title = name

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Skill saved successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this skill entry?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM skills WHERE id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class SkillsSection(BaseSection):
    id = "skills"
    name = "Skills Inventory"
    icon_name = "skills"
    shortcut = "Alt+9"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS skills (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    category TEXT,
                    proficiency_level TEXT DEFAULT 'Intermediate',
                    progress_percent INTEGER DEFAULT 50,
                    target_level TEXT DEFAULT 'Advanced',
                    proof_links TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return SkillsListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return SkillsFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return SkillsFormView(self, None, parent)

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT id, name, category, notes FROM skills WHERE name LIKE ? OR category LIKE ? OR notes LIKE ?",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"Skill: {r['name']} ({r['category']})",
            "snippet": (r["notes"] or "")[:100],
            "section_id": self.id
        } for r in rows]
