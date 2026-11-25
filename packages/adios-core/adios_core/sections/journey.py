"""Section 11: Development Journey for ADIOS.

Tables:
- journey_entries: (id, entry_date, title, milestone_type [Achievement/Breakthrough/Course Completed/Bug Solved/Career/Personal], impact_rating [1-5], reflection, learnings, created_at, updated_at)

Features:
- LIST: Chronological timeline list of career and learning journey milestones.
- CREATE / EDITOR: Detailed milestone entry form (Date, Title, Milestone Type, Impact Rating 1-5, Core Learnings, Detailed Reflection / Journal).
- Side panels: Tags, Reminders.
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QSpinBox, QMessageBox, QHeaderView, QSplitter
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget
from app.core.svg_icons import SvgIconPack
from app.core.icons import WinIcons


JOURNEY_TYPES = ["Major Achievement", "Technical Breakthrough", "Certification / Course", "Tough Bug Solved", "Career / Opportunity", "Personal Milestone"]


class JourneyTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Date", "Milestone Title", "Type", "Impact", "Key Learnings"]

    def rowCount(self, parent=QModelIndex()):
        return len(self._data)

    def columnCount(self, parent=QModelIndex()):
        return len(self._headers)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid():
            return None
        item = self._data[index.row()]
        col = index.column()

        if role == Qt.ItemDataRole.DecorationRole and col == 2:
            icon_key = item.get("icon_key")
            if icon_key:
                return SvgIconPack.get(icon_key, size=18)
            # Match by type keywords
            mtype = (item.get("milestone_type") or "").lower()
            if "award" in mtype or "honor" in mtype:
                return SvgIconPack.get("journey_award", size=18)
            elif "promot" in mtype:
                return SvgIconPack.get("journey_promotion", size=18)
            elif "launch" in mtype or "release" in mtype:
                return SvgIconPack.get("journey_launch", size=18)
            elif "cert" in mtype:
                return SvgIconPack.get("journey_cert", size=18)
            return SvgIconPack.get("journey", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None

        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("entry_date") or "-"
        elif col == 2:
            return item.get("title") or "-"
        elif col == 3:
            return item.get("milestone_type") or "-"
        elif col == 4:
            imp = item.get("impact_rating", 3)
            return "★" * imp
        elif col == 5:
            learn = item.get("learnings") or ""
            return learn[:45] + ("..." if len(learn) > 45 else "")
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None


class JourneyListView(QWidget):
    def __init__(self, section: JourneySection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(8, 8, 8, 8)
        layout.setSpacing(6)

        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Journey Entry")
        self.btn_new.setIcon(WinIcons.get("new"))
        self.btn_refresh = QPushButton("Refresh")
        self.btn_refresh.setIcon(WinIcons.get("refresh"))
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Filter journey entries...")
        self.txt_filter.setFixedWidth(200)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Type:"))
        self.cmb_type = QComboBox()
        self.cmb_type.addItem("All Types")
        self.cmb_type.addItems(JOURNEY_TYPES)
        top_bar.addWidget(self.cmb_type)

        top_bar.addStretch()
        self.lbl_counts = QLabel("0 Journey Milestones")
        self.lbl_counts.setStyleSheet("font-weight: bold; color: #0d9488;")
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
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_type.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall("SELECT * FROM journey_entries ORDER BY entry_date DESC, id DESC")
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        t = self.cmb_type.currentText()
        filtered = []
        for it in self._all_items:
            if t != "All Types" and it.get("milestone_type") != t:
                continue
            title = (it.get("title") or "").lower()
            learn = (it.get("learnings") or "").lower()
            if q and (q not in title and q not in learn):
                continue
            filtered.append(it)

        self.model = JourneyTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_counts.setText(f"{len(filtered)} Milestones Recorded")

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


class JourneyFormView(QWidget):
    """Detailed form for journey reflections and breakthrough logs."""

    def __init__(self, section: JourneySection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Journey #{item_id}" if item_id else "New Journey Milestone"
        self._loading = False

        splitter = QSplitter(Qt.Orientation.Horizontal, self)
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        form = QFormLayout()

        # Icon preset dropdown
        h_icon = QHBoxLayout()
        self.cmb_icon = QComboBox()
        self._populate_journey_icons()
        h_icon.addWidget(self.cmb_icon)
        self.lbl_icon_preview = QLabel()
        self.lbl_icon_preview.setFixedSize(22, 22)
        h_icon.addWidget(self.lbl_icon_preview)
        h_icon.addStretch()
        form.addRow("Milestone Vector Icon:", h_icon)

        self.txt_title = QLineEdit()
        self.txt_title.setPlaceholderText("e.g. Mastered PySide6 Architecture, Deployed First Production Service")
        form.addRow("Milestone Title*:", self.txt_title)

        h_meta = QHBoxLayout()
        self.date_entry = QDateEdit()
        self.date_entry.setCalendarPopup(True)
        self.date_entry.setDate(QDate.currentDate())
        h_meta.addWidget(self.date_entry)

        self.cmb_type = QComboBox()
        self.cmb_type.addItems(JOURNEY_TYPES)
        h_meta.addWidget(QLabel("Milestone Type:"))
        h_meta.addWidget(self.cmb_type)

        self.spin_impact = QSpinBox()
        self.spin_impact.setRange(1, 5)
        self.spin_impact.setValue(5)
        self.spin_impact.setPrefix("★ ")
        h_meta.addWidget(QLabel("Personal Impact (1-5):"))
        h_meta.addWidget(self.spin_impact)
        h_meta.addStretch()
        form.addRow("Date & Impact:", h_meta)

        self.txt_learnings = QLineEdit()
        self.txt_learnings.setPlaceholderText("Core technical insight or personal takeaway in 1 sentence")
        form.addRow("Key Learning:", self.txt_learnings)

        self.txt_reflection = QTextEdit()
        self.txt_reflection.setPlaceholderText("What went well, challenges faced, how this moves your career/goals forward...")
        self.txt_reflection.setMinimumHeight(140)
        form.addRow("Detailed Journal & Reflection:", self.txt_reflection)

        layout.addLayout(form)

        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Journey Entry")
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

        self.panels = ItemPanelsWidget("journey", self.item_id, self.section.db, parent=self)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(splitter)

        self.cmb_icon.currentIndexChanged.connect(self._on_icon_changed)
        self.txt_title.textChanged.connect(self._on_title_changed)
        self.cmb_type.currentTextChanged.connect(self._on_dirty)
        self.spin_impact.valueChanged.connect(self._on_dirty)
        self.txt_learnings.textChanged.connect(self._on_dirty)
        self.txt_reflection.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _populate_journey_icons(self):
        import json
        self.cmb_icon.clear()
        self.cmb_icon.addItem(SvgIconPack.get("journey", size=20), "Default Journey Icon", "journey")

        from app.core.svg_icons import CUSTOMIZABLE_ICONS
        for key, label, cat in CUSTOMIZABLE_ICONS:
            if cat == "Journey Milestones":
                self.cmb_icon.addItem(SvgIconPack.get(key, size=20), label, key)

        # Load user-added journey icons from settings
        try:
            raw = self.section.db.get_setting("custom_icon_entries", "[]")
            entries = json.loads(raw)
            for e in entries:
                if e.get("category") == "Journey Milestones":
                    k = e["key"]
                    l = e["label"]
                    self.cmb_icon.addItem(SvgIconPack.get(k, size=20), l, k)
        except Exception:
            pass

    def _on_icon_changed(self):
        key = self.cmb_icon.currentData() or "journey"
        pix = SvgIconPack.get(key, size=22).pixmap(22, 22)
        self.lbl_icon_preview.setPixmap(pix)
        self._on_dirty()

    def _on_title_changed(self):
        current_key = self.cmb_icon.currentData()
        title_lower = self.txt_title.text().strip().lower()
        if current_key == "journey":
            for i in range(self.cmb_icon.count()):
                k = self.cmb_icon.itemData(i) or ""
                kw = k.replace("journey_", "").lower()
                if kw and kw in title_lower:
                    self.cmb_icon.setCurrentIndex(i)
                    break
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
            row = self.section.db.fetchone("SELECT * FROM journey_entries WHERE id = ?", (self.item_id,))
            if row:
                self.txt_title.setText(row["title"] or "")
                
                e_date = row["entry_date"]
                if e_date:
                    qd = QDate.fromString(e_date, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_entry.setDate(qd)

                idx_t = self.cmb_type.findText(row["milestone_type"] or "")
                if idx_t != -1:
                    self.cmb_type.setCurrentIndex(idx_t)

                # Set icon if saved
                icon_k = row["icon_key"] if "icon_key" in row.keys() else "journey"
                if icon_k:
                    idx_ic = self.cmb_icon.findData(icon_k)
                    if idx_ic != -1:
                        self.cmb_icon.setCurrentIndex(idx_ic)
                self._on_icon_changed()

                self.spin_impact.setValue(int(row["impact_rating"] or 5))
                self.txt_learnings.setText(row["learnings"] or "")
                self.txt_reflection.setPlainText(row["reflection"] or "")
                self.item_title = row["title"] or f"Journey #{self.item_id}"

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        title = self.txt_title.text().strip()
        if not title:
            QMessageBox.warning(self, "Validation Error", "Milestone Title cannot be empty.")
            return False

        entry_date = self.date_entry.date().toString(Qt.DateFormat.ISODate)
        m_type = self.cmb_type.currentText()
        impact = self.spin_impact.value()
        icon_key = self.cmb_icon.currentData() or "journey"
        learnings = self.txt_learnings.text().strip()
        reflection = self.txt_reflection.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO journey_entries 
                       (title, entry_date, milestone_type, impact_rating, icon_key, learnings, reflection)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (title, entry_date, m_type, impact, icon_key, learnings, reflection)
                )
                self.item_id = cur.lastrowid
                self.item_title = title
                self.panels.update_item_id(self.item_id)
                self.btn_delete.setVisible(True)

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, title)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE journey_entries 
                       SET title = ?, entry_date = ?, milestone_type = ?, impact_rating = ?,
                           icon_key = ?, learnings = ?, reflection = ?, updated_at = CURRENT_TIMESTAMP
                       WHERE id = ?""",
                    (title, entry_date, m_type, impact, icon_key, learnings, reflection, self.item_id)
                )
                self.item_title = title

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Journey milestone saved successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this journey entry?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM journey_entries WHERE id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class JourneySection(BaseSection):
    id = "journey"
    name = "Development Journey"
    icon_name = "journey"
    shortcut = "Alt+0"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS journey_entries (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    entry_date TEXT,
                    milestone_type TEXT DEFAULT 'Major Achievement',
                    impact_rating INTEGER DEFAULT 5,
                    icon_key TEXT DEFAULT 'journey',
                    learnings TEXT,
                    reflection TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur = self.db.execute("PRAGMA table_info(journey_entries)")
            cols = [c[1] for c in cur.fetchall()]
            if "icon_key" not in cols:
                self.db.execute("ALTER TABLE journey_entries ADD COLUMN icon_key TEXT DEFAULT 'journey'")

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return JourneyListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return JourneyFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return JourneyFormView(self, None, parent)

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT id, title, learnings, reflection FROM journey_entries WHERE title LIKE ? OR learnings LIKE ? OR reflection LIKE ?",
            (f"%{query}%", f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"Journey: {r['title']}",
            "snippet": (r["learnings"] or r["reflection"] or "")[:100],
            "section_id": self.id
        } for r in rows]
