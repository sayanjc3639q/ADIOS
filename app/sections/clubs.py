"""Section 9: Clubs & Societies for ADIOS.

Tables:
- clubs: (id, name*, my_role, description, meeting_schedule, notes, archived, created_at, updated_at)
- club_tasks: (id, club_id*, task*, deadline, status [To Do/Doing/Blocked/Done], priority [Low/Medium/High], assigned_by, related_event, notes, archived, created_at, updated_at)
- club_subtasks: (id, task_id*, text*, is_done [0/1])

Features:
- LIST: grouped-by-club toggle, filters for club and status, overdue tasks shown with an "OVERDUE" text marker in a Flag column (text, not colour styling).
- EDITOR/CREATE: Form for Club and Form for Task with subtasks checklist (add, toggle done, delete subtasks).
- Toolbar: New Task, New Club, Open, Delete, Refresh.
- Right-click context menu: Open, Duplicate, Archive, Delete, Add Tag, Add Reminder.
- Collapsible side panels: Tags, Linked Items, Reminders.
- Dashboard widget: "Club Tasks Due This Week".
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QCheckBox, QMessageBox, QHeaderView, QMenu, 
    QToolBar, QSplitter, QDialog, QListWidget, QListWidgetItem, QGroupBox
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate, QPoint
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget


TASK_STATUSES = ["To Do", "Doing", "Blocked", "Done"]
TASK_PRIORITIES = ["Low", "Medium", "High"]


class ClubTasksTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Club", "Task", "Deadline", "Flag", "Status", "Priority", "Subtasks"]

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
            from app.core.svg_icons import SvgIconPack
            club_name = (item.get("club_name") or "").lower()
            clean_token = "".join(ch for ch in club_name if ch.isalnum() or ch == '_')
            possible_key = f"club_{clean_token}"
            matched_icon = SvgIconPack.get(possible_key, size=18)
            if not matched_icon.isNull():
                return matched_icon

            if "robot" in club_name or "code" in club_name or "tech" in club_name:
                return SvgIconPack.get("club_robotics", size=18)
            elif "debate" in club_name or "mun" in club_name or "orator" in club_name:
                return SvgIconPack.get("club_debate", size=18)
            elif "music" in club_name or "drama" in club_name or "dance" in club_name:
                return SvgIconPack.get("club_music", size=18)
            elif "sport" in club_name or "athletic" in club_name or "football" in club_name:
                return SvgIconPack.get("club_sports", size=18)
            elif "art" in club_name or "design" in club_name:
                return SvgIconPack.get("club_arts", size=18)
            return SvgIconPack.get("club_general", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None
        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("club_name") or "-"
        elif col == 2:
            return item.get("task")
        elif col == 3:
            return item.get("deadline") or "-"
        elif col == 4:
            # Overdue flag (text only)
            st = item.get("status")
            dl = item.get("deadline")
            if st != "Done" and dl:
                today_str = date.today().isoformat()
                if dl < today_str:
                    return "OVERDUE"
                elif dl == today_str:
                    return "DUE TODAY"
            return ""
        elif col == 5:
            return item.get("status")
        elif col == 6:
            return item.get("priority")
        elif col == 7:
            tot = item.get("subtask_total", 0)
            done = item.get("subtask_done", 0)
            return f"{done}/{tot}" if tot > 0 else "-"
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("id") or 0,
            1: lambda x: (x.get("club_name") or "").lower(),
            2: lambda x: (x.get("task") or "").lower(),
            3: lambda x: x.get("deadline") or "9999",
            4: lambda x: 0 if (x.get("deadline") or "9999") < date.today().isoformat() and x.get("status") != "Done" else 1,
            5: lambda x: (x.get("status") or "").lower(),
            6: lambda x: (x.get("priority") or "").lower(),
            7: lambda x: x.get("subtask_total", 0),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class ClubsListView(QWidget):
    """List tab for Clubs & Societies tasks with grouped toggle and filters."""
    def __init__(self, section: ClubsSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        # Tab Toolbar
        self.tab_toolbar = QToolBar(self)
        self.tab_toolbar.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextBesideIcon)
        act_new_task = self.tab_toolbar.addAction("New Task")
        act_manage_clubs = self.tab_toolbar.addAction("Manage Clubs...")
        act_open = self.tab_toolbar.addAction("Open")
        act_del = self.tab_toolbar.addAction("Delete")
        act_refresh = self.tab_toolbar.addAction("Refresh")
        layout.addWidget(self.tab_toolbar)

        # Filter bar
        filter_bar = QHBoxLayout()
        filter_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Task or notes...")
        self.txt_filter.setFixedWidth(160)
        filter_bar.addWidget(self.txt_filter)

        filter_bar.addWidget(QLabel("Club:"))
        self.cmb_club_filter = QComboBox()
        self.cmb_club_filter.addItem("All Clubs", None)
        filter_bar.addWidget(self.cmb_club_filter)

        filter_bar.addWidget(QLabel("Status:"))
        self.cmb_status_filter = QComboBox()
        self.cmb_status_filter.addItem("All (Active)")
        self.cmb_status_filter.addItem("All Statuses")
        self.cmb_status_filter.addItems(TASK_STATUSES)
        filter_bar.addWidget(self.cmb_status_filter)

        self.chk_group_club = QCheckBox("Group by Club")
        filter_bar.addWidget(self.chk_group_club)

        filter_bar.addStretch()
        self.lbl_count = QLabel("0 tasks")
        filter_bar.addWidget(self.lbl_count)
        layout.addLayout(filter_bar)

        # Table View
        self.table = QTableView()
        self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self.table.setSortingEnabled(True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(True)
        self.table.verticalHeader().setDefaultSectionSize(26)
        self.table.verticalHeader().setVisible(False)
        self.table.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        # Signals
        act_new_task.triggered.connect(self._on_new_task)
        act_manage_clubs.triggered.connect(self._on_manage_clubs)
        act_open.triggered.connect(self._on_open_selected)
        act_del.triggered.connect(self._on_delete_selected)
        act_refresh.triggered.connect(self.refresh)

        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_club_filter.currentIndexChanged.connect(self._apply_filter)
        self.cmb_status_filter.currentTextChanged.connect(self._apply_filter)
        self.chk_group_club.stateChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)
        self.table.customContextMenuRequested.connect(self._show_context_menu)

        self.refresh()

    def _populate_clubs_filter(self):
        cur_data = self.cmb_club_filter.currentData()
        self.cmb_club_filter.blockSignals(True)
        self.cmb_club_filter.clear()
        self.cmb_club_filter.addItem("All Clubs", None)
        clubs = self.section.db.fetchall("SELECT id, name FROM clubs WHERE archived = 0 ORDER BY name ASC")
        for c in clubs:
            self.cmb_club_filter.addItem(c["name"], c["id"])
        
        # Restore selection if exists
        idx = self.cmb_club_filter.findData(cur_data)
        if idx != -1:
            self.cmb_club_filter.setCurrentIndex(idx)
        self.cmb_club_filter.blockSignals(False)

    def refresh(self):
        self._populate_clubs_filter()
        rows = self.section.db.fetchall("""
            SELECT t.id, t.club_id, t.task, t.deadline, t.status, t.priority, t.assigned_by, t.notes, t.archived,
                   c.name as club_name,
                   (SELECT COUNT(*) FROM club_subtasks s WHERE s.task_id = t.id) as subtask_total,
                   (SELECT COUNT(*) FROM club_subtasks s WHERE s.task_id = t.id AND s.is_done = 1) as subtask_done
            FROM club_tasks t
            LEFT JOIN clubs c ON t.club_id = c.id
            WHERE t.archived = 0
            ORDER BY t.deadline ASC, t.id DESC
        """)
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        club_id = self.cmb_club_filter.currentData()
        st_mode = self.cmb_status_filter.currentText()
        group_by_club = self.chk_group_club.isChecked()

        filtered = []
        for it in self._all_items:
            if club_id is not None and it.get("club_id") != club_id:
                continue

            st = it.get("status")
            if st_mode == "All (Active)":
                if st == "Done":
                    continue
            elif st_mode != "All Statuses":
                if st != st_mode:
                    continue

            if q:
                task_txt = (it.get("task") or "").lower()
                notes_txt = (it.get("notes") or "").lower()
                club_txt = (it.get("club_name") or "").lower()
                if q not in task_txt and q not in notes_txt and q not in club_txt:
                    continue

            filtered.append(it)

        if group_by_club:
            filtered.sort(key=lambda x: ((x.get("club_name") or "").lower(), x.get("deadline") or "9999"))

        self.model = ClubTasksTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_count.setText(f"{len(filtered)} / {len(self._all_items)} tasks")

        window = self.window()
        if hasattr(window, "status_tab_info"):
            window.status_tab_info.setText(f"Clubs & Societies: {len(filtered)} tasks listed")

    def _get_selected_id(self) -> Optional[int]:
        sel = self.table.selectionModel()
        if sel and sel.hasSelection():
            idx = sel.selectedRows()[0]
            return self.model._data[idx.row()]["id"]
        return None

    def _on_new_task(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.CREATE)

    def _on_manage_clubs(self):
        dlg = ManageClubsDialog(self.section.db, self)
        dlg.exec()
        self.refresh()

    def _on_open_selected(self):
        item_id = self._get_selected_id()
        if item_id:
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)

    def _on_double_click(self, index: QModelIndex):
        self._on_open_selected()

    def _on_delete_selected(self):
        item_id = self._get_selected_id()
        if not item_id:
            return
        reply = QMessageBox.question(
            self, "Confirm Delete", "Are you sure you want to delete this club task?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM club_tasks WHERE id = ?", (item_id,))
                self.section.db.execute("DELETE FROM club_subtasks WHERE task_id = ?", (item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'clubs' AND item_id = ?", (item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, item_id)
            self.refresh()

    def _show_context_menu(self, pos: QPoint):
        idx = self.table.indexAt(pos)
        if not idx.isValid():
            return
        item = self.model._data[idx.row()]
        item_id = item["id"]

        menu = QMenu(self)
        act_open = menu.addAction("Open")
        act_dup = menu.addAction("Duplicate Item")
        act_archive = menu.addAction("Archive / Unarchive Item")
        act_del = menu.addAction("Delete Item")
        menu.addSeparator()
        act_tag = menu.addAction("Add Tag...")
        act_rem = menu.addAction("Add Reminder...")

        chosen = menu.exec(self.table.viewport().mapToGlobal(pos))
        if chosen == act_open:
            self._on_open_selected()
        elif chosen == act_dup:
            with self.section.db.get_connection():
                self.section.db.execute("""
                    INSERT INTO club_tasks (club_id, task, deadline, status, priority, assigned_by, notes)
                    SELECT club_id, task || ' (Copy)', deadline, 'To Do', priority, assigned_by, notes
                    FROM club_tasks WHERE id = ?
                """, (item_id,))
            self.refresh()
        elif chosen == act_archive:
            new_arch = 0 if item.get("archived") else 1
            with self.section.db.get_connection():
                self.section.db.execute("UPDATE club_tasks SET archived = ? WHERE id = ?", (new_arch, item_id))
            self.refresh()
        elif chosen == act_del:
            self._on_delete_selected()
        elif chosen == act_tag or chosen == act_rem:
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)


class ManageClubsDialog(QDialog):
    """Dialog to manage clubs list (Add, Edit, Delete)."""
    def __init__(self, db: Any, parent=None):
        super().__init__(parent)
        self.db = db
        self.setWindowTitle("Manage Clubs & Societies")
        self.resize(450, 360)

        layout = QVBoxLayout(self)
        self.list_clubs = QListWidget()
        layout.addWidget(self.list_clubs)

        form = QFormLayout()
        self.txt_name = QLineEdit()
        self.txt_role = QLineEdit()
        self.txt_notes = QLineEdit()
        form.addRow("Club Name*:", self.txt_name)
        form.addRow("My Role:", self.txt_role)
        form.addRow("Notes / Meeting:", self.txt_notes)
        layout.addLayout(form)

        btn_box = QHBoxLayout()
        self.btn_add = QPushButton("Add Club")
        self.btn_del = QPushButton("Delete Selected Club")
        btn_close = QPushButton("Close")
        btn_box.addWidget(self.btn_add)
        btn_box.addWidget(self.btn_del)
        btn_box.addStretch()
        btn_box.addWidget(btn_close)
        layout.addLayout(btn_box)

        self.btn_add.clicked.connect(self._add_club)
        self.btn_del.clicked.connect(self._del_club)
        btn_close.clicked.connect(self.accept)

        self.refresh()

    def refresh(self):
        self.list_clubs.clear()
        clubs = self.db.fetchall("SELECT id, name, my_role FROM clubs WHERE archived = 0 ORDER BY name ASC")
        for c in clubs:
            role = f" ({c['my_role']})" if c['my_role'] else ""
            item = QListWidgetItem(f"{c['name']}{role}")
            item.setData(Qt.ItemDataRole.UserRole, c["id"])
            self.list_clubs.addItem(item)

    def _add_club(self):
        name = self.txt_name.text().strip()
        if not name:
            QMessageBox.warning(self, "Error", "Club name cannot be empty.")
            return
        role = self.txt_role.text().strip()
        notes = self.txt_notes.text().strip()
        with self.db.get_connection():
            self.db.execute("INSERT INTO clubs (name, my_role, notes) VALUES (?, ?, ?)", (name, role, notes))
        self.txt_name.clear()
        self.txt_role.clear()
        self.txt_notes.clear()
        self.refresh()

    def _del_club(self):
        cur = self.list_clubs.currentItem()
        if not cur:
            return
        club_id = cur.data(Qt.ItemDataRole.UserRole)
        # Check if tasks exist
        count = self.db.fetchone("SELECT COUNT(*) FROM club_tasks WHERE club_id = ?", (club_id,))[0]
        if count > 0:
            QMessageBox.warning(self, "Cannot Delete", f"This club has {count} active tasks. Remove or reassign them first.")
            return
        with self.db.get_connection():
            self.db.execute("DELETE FROM clubs WHERE id = ?", (club_id,))
        self.refresh()


class ClubsFormView(QWidget):
    """Unified Editor and Create form for Club Tasks with Subtasks checklist and side panels."""
    def __init__(self, section: ClubsSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Task #{item_id}" if item_id else "New Club Task"
        self._loading = False

        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(8, 8, 8, 8)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)

        # Form Container
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(4, 4, 4, 4)

        form = QFormLayout()

        # Club Chooser
        h_club = QHBoxLayout()
        self.cmb_club = QComboBox()
        self._populate_clubs()
        h_club.addWidget(self.cmb_club)
        self.btn_new_club_quick = QPushButton("+ New Club")
        self.btn_new_club_quick.setFixedWidth(90)
        h_club.addWidget(self.btn_new_club_quick)
        form.addRow("Club / Society*:", h_club)

        self.txt_task = QLineEdit()
        form.addRow("Task Name*:", self.txt_task)

        h_stat = QHBoxLayout()
        self.cmb_status = QComboBox()
        self.cmb_status.addItems(TASK_STATUSES)
        h_stat.addWidget(self.cmb_status)

        self.cmb_priority = QComboBox()
        self.cmb_priority.addItems(TASK_PRIORITIES)
        self.cmb_priority.setCurrentText("Medium")
        h_stat.addWidget(QLabel("Priority:"))
        h_stat.addWidget(self.cmb_priority)
        h_stat.addStretch()
        form.addRow("Status & Priority:", h_stat)

        h_date = QHBoxLayout()
        self.date_deadline = QDateEdit()
        self.date_deadline.setCalendarPopup(True)
        self.date_deadline.setDate(QDate.currentDate().addDays(3))
        h_date.addWidget(self.date_deadline)

        self.txt_assigned_by = QLineEdit()
        self.txt_assigned_by.setPlaceholderText("President, Lead, self...")
        h_date.addWidget(QLabel("Assigned By:"))
        h_date.addWidget(self.txt_assigned_by)
        form.addRow("Deadline / Assigned:", h_date)

        self.txt_related_event = QLineEdit()
        self.txt_related_event.setPlaceholderText("Annual Fest, Weekly Meet, Hackathon...")
        form.addRow("Related Event:", self.txt_related_event)

        # SUBTASKS CHECKLIST
        self.box_subtasks = QGroupBox("Checklist / Subtasks")
        l_sub = QVBoxLayout(self.box_subtasks)
        self.list_subtasks = QListWidget()
        self.list_subtasks.setMaximumHeight(110)
        
        h_sub_in = QHBoxLayout()
        self.txt_new_sub = QLineEdit()
        self.txt_new_sub.setPlaceholderText("Add subtask item...")
        self.btn_add_sub = QPushButton("+ Add Subtask")
        self.btn_del_sub = QPushButton("- Remove")
        h_sub_in.addWidget(self.txt_new_sub)
        h_sub_in.addWidget(self.btn_add_sub)
        h_sub_in.addWidget(self.btn_del_sub)

        l_sub.addWidget(self.list_subtasks)
        l_sub.addLayout(h_sub_in)
        form.addRow(self.box_subtasks)

        self.txt_notes = QTextEdit()
        self.txt_notes.setMaximumHeight(70)
        form.addRow("Notes:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Task")
        self.btn_cancel = QPushButton("Cancel")
        self.btn_delete = QPushButton("Delete")
        if not self.item_id:
            self.btn_delete.setVisible(False)

        btn_bar.addWidget(self.btn_save)
        btn_bar.addWidget(self.btn_cancel)
        btn_bar.addSpacing(15)
        btn_bar.addWidget(self.btn_delete)
        btn_bar.addStretch()
        layout.addLayout(btn_bar)

        splitter.addWidget(form_container)

        # Right: Reusable Side Panels
        self.panels = ItemPanelsWidget(
            db=self.section.db,
            registry=self.section.registry,
            section_id=self.section.id,
            item_id=self.item_id,
            on_dirty_cb=self._on_dirty,
            parent=self
        )
        self.panels.setFixedWidth(240)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        # Signals
        self.btn_new_club_quick.clicked.connect(self._on_quick_new_club)
        self.txt_task.textChanged.connect(self._on_dirty)
        self.cmb_club.currentIndexChanged.connect(self._on_dirty)
        self.cmb_status.currentTextChanged.connect(self._on_dirty)
        self.cmb_priority.currentTextChanged.connect(self._on_dirty)
        self.date_deadline.dateChanged.connect(self._on_dirty)
        self.txt_assigned_by.textChanged.connect(self._on_dirty)
        self.txt_related_event.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_add_sub.clicked.connect(self._add_subtask)
        self.txt_new_sub.returnPressed.connect(self._add_subtask)
        self.btn_del_sub.clicked.connect(self._del_subtask)
        self.list_subtasks.itemChanged.connect(self._on_subtask_checked)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _populate_clubs(self):
        self.cmb_club.clear()
        clubs = self.section.db.fetchall("SELECT id, name FROM clubs WHERE archived = 0 ORDER BY name ASC")
        for c in clubs:
            self.cmb_club.addItem(c["name"], c["id"])
        if self.cmb_club.count() == 0:
            self.cmb_club.addItem("General Club", 1)

    def _on_quick_new_club(self):
        dlg = ManageClubsDialog(self.section.db, self)
        dlg.exec()
        self._populate_clubs()

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM club_tasks WHERE id = ?", (self.item_id,))
            if row:
                self.txt_task.setText(row["task"] or "")
                idx_c = self.cmb_club.findData(row["club_id"])
                if idx_c != -1:
                    self.cmb_club.setCurrentIndex(idx_c)

                s_idx = self.cmb_status.findText(row["status"] or "To Do")
                if s_idx != -1:
                    self.cmb_status.setCurrentIndex(s_idx)

                p_idx = self.cmb_priority.findText(row["priority"] or "Medium")
                if p_idx != -1:
                    self.cmb_priority.setCurrentIndex(p_idx)

                if row["deadline"]:
                    self.date_deadline.setDate(QDate.fromString(row["deadline"], Qt.DateFormat.ISODate))

                self.txt_assigned_by.setText(row["assigned_by"] or "")
                self.txt_related_event.setText(row["related_event"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["task"] or f"Task #{self.item_id}"

                self._load_subtasks()

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def _load_subtasks(self):
        self.list_subtasks.clear()
        if not self.item_id:
            return
        subs = self.section.db.fetchall("SELECT id, text, is_done FROM club_subtasks WHERE task_id = ? ORDER BY id ASC", (self.item_id,))
        for s in subs:
            it = QListWidgetItem(s["text"])
            it.setData(Qt.ItemDataRole.UserRole, s["id"])
            it.setFlags(it.flags() | Qt.ItemFlag.ItemIsUserCheckable)
            it.setCheckState(Qt.CheckState.Checked if s["is_done"] else Qt.CheckState.Unchecked)
            self.list_subtasks.addItem(it)

    def _add_subtask(self):
        text = self.txt_new_sub.text().strip()
        if not text:
            return
        if not self.item_id:
            # Add temporary row
            it = QListWidgetItem(text)
            it.setData(Qt.ItemDataRole.UserRole, None)
            it.setFlags(it.flags() | Qt.ItemFlag.ItemIsUserCheckable)
            it.setCheckState(Qt.CheckState.Unchecked)
            self.list_subtasks.addItem(it)
        else:
            with self.section.db.get_connection():
                self.section.db.execute("INSERT INTO club_subtasks (task_id, text, is_done) VALUES (?, ?, 0)", (self.item_id, text))
            self._load_subtasks()
        self.txt_new_sub.clear()
        self._on_dirty()

    def _del_subtask(self):
        cur = self.list_subtasks.currentItem()
        if not cur:
            return
        sub_id = cur.data(Qt.ItemDataRole.UserRole)
        if sub_id:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM club_subtasks WHERE id = ?", (sub_id,))
        self.list_subtasks.takeItem(self.list_subtasks.row(cur))
        self._on_dirty()

    def _on_subtask_checked(self, item: QListWidgetItem):
        sub_id = item.data(Qt.ItemDataRole.UserRole)
        if sub_id:
            is_done = 1 if item.checkState() == Qt.CheckState.Checked else 0
            with self.section.db.get_connection():
                self.section.db.execute("UPDATE club_subtasks SET is_done = ? WHERE id = ?", (is_done, sub_id))
        self._on_dirty()

    def save_item(self) -> bool:
        task = self.txt_task.text().strip()
        if not task:
            QMessageBox.warning(self, "Validation Error", "Task name cannot be empty.")
            return False

        club_id = self.cmb_club.currentData() or 1
        status = self.cmb_status.currentText()
        priority = self.cmb_priority.currentText()
        deadline = self.date_deadline.date().toString(Qt.DateFormat.ISODate)
        assigned_by = self.txt_assigned_by.text().strip()
        related_event = self.txt_related_event.text().strip()
        notes = self.txt_notes.toPlainText()
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute("""
                    INSERT INTO club_tasks 
                    (club_id, task, deadline, status, priority, assigned_by, related_event, notes, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (club_id, task, deadline, status, priority, assigned_by, related_event, notes, now_ts, now_ts))
                self.item_id = cur.lastrowid
                self.item_title = task

                # Save pending subtasks
                for i in range(self.list_subtasks.count()):
                    it = self.list_subtasks.item(i)
                    is_d = 1 if it.checkState() == Qt.CheckState.Checked else 0
                    self.section.db.execute(
                        "INSERT INTO club_subtasks (task_id, text, is_done) VALUES (?, ?, ?)",
                        (self.item_id, it.text(), is_d)
                    )

                # Deadline reminder 1 day before
                try:
                    dl_dt = (datetime.strptime(deadline, "%Y-%m-%d").date() - timedelta(days=1)).isoformat() + " 09:00:00"
                    if dl_dt >= now_ts:
                        self.section.db.execute("""
                            INSERT INTO reminders (item_type, item_id, title, remind_at)
                            VALUES (?, ?, ?, ?)
                        """, ("clubs", self.item_id, f"Club Task Due Tomorrow: {task}", dl_dt))
                except Exception:
                    pass

            self.panels.set_item_id(self.item_id)
            self._load_subtasks()
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, task)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute("""
                    UPDATE club_tasks 
                    SET club_id = ?, task = ?, deadline = ?, status = ?, priority = ?, 
                        assigned_by = ?, related_event = ?, notes = ?, updated_at = ?
                    WHERE id = ?
                """, (club_id, task, deadline, status, priority, assigned_by, related_event, notes, now_ts, self.item_id))
                self.item_title = task

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Club task saved successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this club task?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM club_tasks WHERE id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM club_subtasks WHERE task_id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'clubs' AND item_id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class ClubsSection(BaseSection):
    id = "clubs"
    name = "Clubs & Societies"
    icon_name = "group"
    shortcut = "Alt+8"

    def __init__(self, db: Any):
        super().__init__(db)
        self.registry = None

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS clubs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT UNIQUE NOT NULL,
                    my_role TEXT,
                    description TEXT,
                    meeting_schedule TEXT,
                    notes TEXT,
                    archived INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS club_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    club_id INTEGER NOT NULL,
                    task TEXT NOT NULL,
                    deadline TEXT,
                    status TEXT DEFAULT 'To Do',
                    priority TEXT DEFAULT 'Medium',
                    assigned_by TEXT,
                    related_event TEXT,
                    notes TEXT,
                    archived INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(club_id) REFERENCES clubs(id) ON DELETE CASCADE
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS club_subtasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    task_id INTEGER NOT NULL,
                    text TEXT NOT NULL,
                    is_done INTEGER DEFAULT 0,
                    FOREIGN KEY(task_id) REFERENCES club_tasks(id) ON DELETE CASCADE
                );
            """)

            # Seed default clubs if empty
            count = self.db.fetchone("SELECT COUNT(*) FROM clubs")[0]
            if count == 0:
                self.db.execute("INSERT INTO clubs (name, my_role, notes) VALUES (?, ?, ?)",
                                ("Coding & Robotics Club", "Tech Lead", "Meets every Wednesday 5 PM"))
                self.db.execute("INSERT INTO clubs (name, my_role, notes) VALUES (?, ?, ?)",
                                ("Debate Society", "Member", "Weekly training sessions"))

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ClubsListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return ClubsFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ClubsFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            today_str = date.today().isoformat()
            week_ahead = (date.today() + timedelta(days=7)).isoformat()
            rows = self.db.fetchall("""
                SELECT t.id, t.task, t.deadline, c.name as club_name
                FROM club_tasks t
                LEFT JOIN clubs c ON t.club_id = c.id
                WHERE t.status != 'Done' AND t.archived = 0 AND t.deadline >= ? AND t.deadline <= ?
                ORDER BY t.deadline ASC LIMIT 4
            """, (today_str, week_ahead))
            if not rows:
                l.addWidget(QLabel("No club tasks due this week."))
            else:
                for r in rows:
                    btn = QPushButton(f"[{r['club_name']}] {r['task']} (Due {r['deadline']})")
                    tid = r["id"]
                    btn.clicked.connect(lambda ch=False, x=tid: w.window().tab_manager.open_tab(self.id, TabKind.EDITOR, item_id=x) if hasattr(w.window(), "tab_manager") else None)
                    l.addWidget(btn)
            return w

        return [{
            "id": "club_tasks_due",
            "name": "Club Tasks Due This Week",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall("""
            SELECT t.id, t.task, t.deadline, t.notes, c.name as club_name 
            FROM club_tasks t
            LEFT JOIN clubs c ON t.club_id = c.id
            WHERE t.task LIKE ? OR t.notes LIKE ? OR c.name LIKE ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%"))
        return [{
            "id": r["id"],
            "title": f"[{r['club_name']}] {r['task']}",
            "snippet": f"Deadline: {r['deadline'] or 'N/A'} - {(r['notes'] or '')[:90]}",
            "section_id": self.id
        } for r in rows]
