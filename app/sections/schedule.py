"""Section 4: Schedule (one-time and recurring events) for ADIOS.

Fields:
- title*
- category (Class / Club / Study / Personal / Other)
- start date+time*
- end date+time*
- all_day flag (0/1)
- location
- notes
- repeat settings (iCalendar RRULE string generated via python-dateutil)
- reminder (none / 5 / 10 / 30 / 60 minutes before)
- archived (0/1), created_at, updated_at

Exceptions & Occurrences:
- Occurrences are expanded ON THE FLY for a date range (NOT stored as rows).
- Exceptions: schedule_exceptions table for skipped dates and per-occurrence overrides.

Views (inside the LIST tab, switchable with radio buttons):
- Day List: date picker plus Prev / Today / Next buttons.
- Week List: 7 columns or grouped by day, same navigation.
- All Events: plain table of base events.
- Read-only Exams with dates also appear in Day/Week views.

Workflow:
- Editing a recurring event asks: "This occurrence only / This and following / All occurrences".
- Deleting asks the same.
- On save, detect time overlaps with other events in the next 30 days; show conflict warning.
- Dashboard widget: "Today's Schedule" (time, title, location).
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any, Tuple
from datetime import datetime, date, timedelta, time
import calendar
from dateutil import rrule

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QTimeEdit, QCheckBox, QMessageBox, QHeaderView, 
    QRadioButton, QButtonGroup, QMenu, QToolBar, QSplitter, 
    QDialog, QGroupBox, QSpinBox
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate, QTime, QPoint
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget


EVENT_CATEGORIES = ["Class", "Club", "Study", "Personal", "Other"]
REMINDER_OPTIONS = [("None", 0), ("5 min before", 5), ("10 min before", 10), ("30 min before", 30), ("60 min before", 60)]
DAYS_OF_WEEK = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]
DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


class OccurrencesTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["Date", "Time", "Title", "Category", "Location", "Source"]

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
            return item.get("occ_date")
        elif col == 1:
            if item.get("all_day"):
                return "All Day"
            return f"{item.get('start_time', '')} - {item.get('end_time', '')}"
        elif col == 2:
            return item.get("title")
        elif col == 3:
            return item.get("category")
        elif col == 4:
            return item.get("location") or "-"
        elif col == 5:
            return item.get("source_type") or "Schedule"
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("occ_date") or "",
            1: lambda x: x.get("start_time") or "",
            2: lambda x: (x.get("title") or "").lower(),
            3: lambda x: (x.get("category") or "").lower(),
            4: lambda x: (x.get("location") or "").lower(),
            5: lambda x: (x.get("source_type") or "").lower(),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class BaseEventsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Title", "Start Date", "Time", "Recurrence", "Category", "Location"]

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
            return item.get("start_date")
        elif col == 3:
            if item.get("all_day"):
                return "All Day"
            return f"{item.get('start_time', '')} - {item.get('end_time', '')}"
        elif col == 4:
            return item.get("repeat_type") or "None"
        elif col == 5:
            return item.get("category")
        elif col == 6:
            return item.get("location") or "-"
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
            2: lambda x: x.get("start_date") or "",
            3: lambda x: x.get("start_time") or "",
            4: lambda x: (x.get("repeat_type") or "").lower(),
            5: lambda x: (x.get("category") or "").lower(),
            6: lambda x: (x.get("location") or "").lower(),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class ScheduleListView(QWidget):
    """
    List tab for Schedule with Day List, Week List, and All Events views.
    Includes date navigation (Prev / Today / Next).
    """
    def __init__(self, section: ScheduleSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.current_focus_date = date.today()

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        # Tab Toolbar
        self.tab_toolbar = QToolBar(self)
        self.tab_toolbar.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextBesideIcon)
        act_new = self.tab_toolbar.addAction("New Event")
        act_open = self.tab_toolbar.addAction("Open")
        act_del = self.tab_toolbar.addAction("Delete")
        act_refresh = self.tab_toolbar.addAction("Refresh")
        layout.addWidget(self.tab_toolbar)

        # Control and Navigation Bar
        nav_bar = QHBoxLayout()
        self.btn_day = QRadioButton("Day View")
        self.btn_week = QRadioButton("Week View")
        self.btn_all = QRadioButton("All Events")
        self.btn_week.setChecked(True)

        self.grp_view = QButtonGroup(self)
        self.grp_view.addButton(self.btn_day)
        self.grp_view.addButton(self.btn_week)
        self.grp_view.addButton(self.btn_all)

        nav_bar.addWidget(QLabel("View:"))
        nav_bar.addWidget(self.btn_day)
        nav_bar.addWidget(self.btn_week)
        nav_bar.addWidget(self.btn_all)
        nav_bar.addSpacing(20)

        self.btn_prev = QPushButton("< Prev")
        self.btn_today = QPushButton("Today")
        self.btn_next = QPushButton("Next >")
        nav_bar.addWidget(self.btn_prev)
        nav_bar.addWidget(self.btn_today)
        nav_bar.addWidget(self.btn_next)

        self.date_picker = QDateEdit()
        self.date_picker.setCalendarPopup(True)
        self.date_picker.setDate(QDate.currentDate())
        nav_bar.addWidget(self.date_picker)

        nav_bar.addStretch()
        self.lbl_count = QLabel("0 events")
        nav_bar.addWidget(self.lbl_count)
        layout.addLayout(nav_bar)

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

        # Connections
        act_new.triggered.connect(self._on_new)
        act_open.triggered.connect(self._on_open_selected)
        act_del.triggered.connect(self._on_delete_selected)
        act_refresh.triggered.connect(self.refresh)

        self.btn_prev.clicked.connect(self._nav_prev)
        self.btn_today.clicked.connect(self._nav_today)
        self.btn_next.clicked.connect(self._nav_next)
        self.date_picker.dateChanged.connect(self._on_date_changed)
        self.grp_view.buttonClicked.connect(self.refresh)
        self.table.doubleClicked.connect(self._on_double_click)
        self.table.customContextMenuRequested.connect(self._show_context_menu)

        self.refresh()

    def _nav_prev(self):
        delta = 1 if self.btn_day.isChecked() else 7
        self.current_focus_date -= timedelta(days=delta)
        self.date_picker.setDate(QDate(self.current_focus_date.year, self.current_focus_date.month, self.current_focus_date.day))

    def _nav_today(self):
        self.current_focus_date = date.today()
        self.date_picker.setDate(QDate.currentDate())

    def _nav_next(self):
        delta = 1 if self.btn_day.isChecked() else 7
        self.current_focus_date += timedelta(days=delta)
        self.date_picker.setDate(QDate(self.current_focus_date.year, self.current_focus_date.month, self.current_focus_date.day))

    def _on_date_changed(self, qd: QDate):
        self.current_focus_date = qd.toPython()
        self.refresh()

    def refresh(self):
        if self.btn_all.isChecked():
            # Base events table
            rows = self.section.db.fetchall("""
                SELECT id, title, start_date, start_time, end_time, all_day, repeat_type, rrule_str, category, location, archived
                FROM schedule_events WHERE archived = 0 ORDER BY start_date ASC, start_time ASC
            """)
            data = [dict(r) for r in rows]
            self.model = BaseEventsTableModel(data)
            self.table.setModel(self.model)
            self.lbl_count.setText(f"{len(data)} base events")
        else:
            # Expand occurrences for Day or Week
            if self.btn_day.isChecked():
                start_range = self.current_focus_date
                end_range = self.current_focus_date
            else:
                # Week view: Mon to Sun
                start_range = self.current_focus_date - timedelta(days=self.current_focus_date.weekday())
                end_range = start_range + timedelta(days=6)

            occurrences = self.section.expand_occurrences(start_range, end_range)
            self.model = OccurrencesTableModel(occurrences)
            self.table.setModel(self.model)
            self.lbl_count.setText(f"{len(occurrences)} occurrences ({start_range} to {end_range})")

        # Update main window status
        window = self.window()
        if hasattr(window, "status_tab_info"):
            window.status_tab_info.setText(f"Schedule: {self.lbl_count.text()}")

    def _get_selected_item(self) -> Optional[Dict[str, Any]]:
        sel = self.table.selectionModel()
        if sel and sel.hasSelection():
            idx = sel.selectedRows()[0]
            return self.model._data[idx.row()]
        return None

    def _on_new(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.CREATE)

    def _on_open_selected(self):
        item = self._get_selected_item()
        if not item:
            return
        # If from Exams, open Exams editor
        if item.get("source_type") == "Exam":
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab("exams", TabKind.EDITOR, item_id=item["event_id"])
            return

        event_id = item.get("id") or item.get("event_id")
        occ_date = item.get("occ_date")

        # If recurring, ask workflow
        rep_type = item.get("repeat_type")
        if rep_type and rep_type != "None" and occ_date:
            dlg = RecurringPromptDialog("Edit Recurring Event", self)
            if dlg.exec():
                choice = dlg.selected_choice
                if choice == "this_only":
                    # Create exception override
                    self._create_occurrence_override(event_id, occ_date)
                    return
                elif choice == "this_and_following":
                    self._split_recurring_event(event_id, occ_date)
                    return
                # "all" continues to open base editor

        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=event_id)

    def _on_double_click(self, index: QModelIndex):
        self._on_open_selected()

    def _on_delete_selected(self):
        item = self._get_selected_item()
        if not item:
            return
        if item.get("source_type") == "Exam":
            QMessageBox.information(self, "Notice", "This is an exam. Please delete it from the Exams tab.")
            return

        event_id = item.get("id") or item.get("event_id")
        occ_date = item.get("occ_date")
        rep_type = item.get("repeat_type")

        if rep_type and rep_type != "None" and occ_date:
            dlg = RecurringPromptDialog("Delete Recurring Event", self)
            if dlg.exec():
                choice = dlg.selected_choice
                if choice == "this_only":
                    # Add to skipped dates
                    self.section.add_skip_date(event_id, occ_date)
                    self.refresh()
                    return
                elif choice == "this_and_following":
                    self.section.truncate_until_date(event_id, occ_date)
                    self.refresh()
                    return

        # Delete all occurrences
        reply = QMessageBox.question(
            self, "Confirm Delete", "Are you sure you want to delete this event?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM schedule_events WHERE id = ?", (event_id,))
                self.section.db.execute("DELETE FROM schedule_exceptions WHERE event_id = ?", (event_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'schedule' AND item_id = ?", (event_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, event_id)
            self.refresh()

    def _create_occurrence_override(self, event_id: int, occ_date: str):
        # Add to skipped dates of original, and create single detached event
        row = self.section.db.fetchone("SELECT * FROM schedule_events WHERE id = ?", (event_id,))
        if not row:
            return
        self.section.add_skip_date(event_id, occ_date)
        with self.section.db.get_connection():
            cur = self.section.db.execute("""
                INSERT INTO schedule_events 
                (title, category, start_date, end_date, start_time, end_time, all_day, location, notes, repeat_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'None')
            """, (f"{row['title']} (Override)", row["category"], occ_date, occ_date, row["start_time"], row["end_time"], row["all_day"], row["location"], row["notes"]))
            new_id = cur.lastrowid
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=new_id)

    def _split_recurring_event(self, event_id: int, split_date: str):
        # Truncate original to day before split_date
        prev_day = (datetime.strptime(split_date, "%Y-%m-%d").date() - timedelta(days=1)).isoformat()
        self.section.truncate_until_date(event_id, split_date)
        # Create new recurring branch starting from split_date
        row = self.section.db.fetchone("SELECT * FROM schedule_events WHERE id = ?", (event_id,))
        if not row:
            return
        with self.section.db.get_connection():
            cur = self.section.db.execute("""
                INSERT INTO schedule_events 
                (title, category, start_date, end_date, start_time, end_time, all_day, location, notes, repeat_type, rrule_str)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (row["title"], row["category"], split_date, split_date, row["start_time"], row["end_time"], row["all_day"], row["location"], row["notes"], row["repeat_type"], row["rrule_str"]))
            new_id = cur.lastrowid
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=new_id)

    def _show_context_menu(self, pos: QPoint):
        idx = self.table.indexAt(pos)
        if not idx.isValid():
            return
        item = self.model._data[idx.row()]
        menu = QMenu(self)
        act_open = menu.addAction("Open")
        act_del = menu.addAction("Delete")
        menu.addSeparator()
        act_add_tag = menu.addAction("Add Tag...")
        act_add_rem = menu.addAction("Add Reminder...")

        chosen = menu.exec(self.table.viewport().mapToGlobal(pos))
        if chosen == act_open:
            self._on_open_selected()
        elif chosen == act_del:
            self._on_delete_selected()
        elif chosen == act_add_tag or chosen == act_add_rem:
            ev_id = item.get("id") or item.get("event_id")
            if ev_id:
                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=ev_id)


class RecurringPromptDialog(QDialog):
    """Prompt for 'This occurrence only / This and following / All occurrences'."""
    def __init__(self, action_title: str, parent=None):
        super().__init__(parent)
        self.setWindowTitle(action_title)
        self.resize(320, 180)
        self.selected_choice = "all"

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("This is a recurring event. Apply action to:"))

        self.rb_this = QRadioButton("This occurrence only")
        self.rb_following = QRadioButton("This and following occurrences")
        self.rb_all = QRadioButton("All occurrences")
        self.rb_all.setChecked(True)

        layout.addWidget(self.rb_this)
        layout.addWidget(self.rb_following)
        layout.addWidget(self.rb_all)

        btn_box = QHBoxLayout()
        btn_ok = QPushButton("OK")
        btn_cancel = QPushButton("Cancel")
        btn_box.addStretch()
        btn_box.addWidget(btn_ok)
        btn_box.addWidget(btn_cancel)
        layout.addLayout(btn_box)

        btn_ok.clicked.connect(self._on_ok)
        btn_cancel.clicked.connect(self.reject)

    def _on_ok(self):
        if self.rb_this.isChecked():
            self.selected_choice = "this_only"
        elif self.rb_following.isChecked():
            self.selected_choice = "this_and_following"
        else:
            self.selected_choice = "all"
        self.accept()


class ScheduleFormView(QWidget):
    """Unified Editor and Create form for Schedule with RRULE configuration & side panels."""
    def __init__(self, section: ScheduleSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Event #{item_id}" if item_id else "New Event"
        self._loading = False

        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(8, 8, 8, 8)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)

        # Form side
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(4, 4, 4, 4)

        form = QFormLayout()
        self.txt_title = QLineEdit()
        form.addRow("Title*:", self.txt_title)

        h_cat_all = QHBoxLayout()
        self.cmb_category = QComboBox()
        self.cmb_category.addItems(EVENT_CATEGORIES)
        h_cat_all.addWidget(self.cmb_category)

        self.chk_all_day = QCheckBox("All-day event")
        h_cat_all.addWidget(self.chk_all_day)
        h_cat_all.addStretch()
        form.addRow("Category / Mode:", h_cat_all)

        h_start = QHBoxLayout()
        self.date_start = QDateEdit()
        self.date_start.setCalendarPopup(True)
        self.date_start.setDate(QDate.currentDate())
        h_start.addWidget(self.date_start)

        self.time_start = QTimeEdit()
        self.time_start.setTime(QTime(10, 0))
        h_start.addWidget(self.time_start)
        h_start.addStretch()
        form.addRow("Start Date & Time*:", h_start)

        h_end = QHBoxLayout()
        self.date_end = QDateEdit()
        self.date_end.setCalendarPopup(True)
        self.date_end.setDate(QDate.currentDate())
        h_end.addWidget(self.date_end)

        self.time_end = QTimeEdit()
        self.time_end.setTime(QTime(11, 0))
        h_end.addWidget(self.time_end)
        h_end.addStretch()
        form.addRow("End Date & Time*:", h_end)

        self.txt_location = QLineEdit()
        self.txt_location.setPlaceholderText("Classroom, Zoom link, building...")
        form.addRow("Location:", self.txt_location)

        # REPEAT SETTINGS GROUP
        self.grp_repeat = QGroupBox("Recurrence (RRULE)")
        l_rep = QVBoxLayout(self.grp_repeat)
        h_rep_type = QHBoxLayout()
        self.cmb_repeat = QComboBox()
        self.cmb_repeat.addItems(["None", "Daily", "Weekly", "Monthly", "Custom (Days)"])
        h_rep_type.addWidget(QLabel("Frequency:"))
        h_rep_type.addWidget(self.cmb_repeat)
        h_rep_type.addStretch()
        l_rep.addLayout(h_rep_type)

        # Weekly checkboxes
        self.w_weekdays = QWidget()
        l_wk = QHBoxLayout(self.w_weekdays)
        l_wk.setContentsMargins(0, 0, 0, 0)
        self.chk_days: Dict[str, QCheckBox] = {}
        for code, name in zip(DAYS_OF_WEEK, DAY_NAMES):
            cb = QCheckBox(name)
            self.chk_days[code] = cb
            l_wk.addWidget(cb)
        l_wk.addStretch()
        self.w_weekdays.setVisible(False)
        l_rep.addWidget(self.w_weekdays)

        # Monthly options
        self.w_monthly = QWidget()
        l_mo = QHBoxLayout(self.w_monthly)
        l_mo.setContentsMargins(0, 0, 0, 0)
        self.rb_month_dom = QRadioButton("Day of month")
        self.rb_month_nth = QRadioButton("nth Weekday")
        self.rb_month_dom.setChecked(True)
        l_mo.addWidget(self.rb_month_dom)
        l_mo.addWidget(self.rb_month_nth)
        l_mo.addStretch()
        self.w_monthly.setVisible(False)
        l_rep.addWidget(self.w_monthly)

        # Ends group: Never / On date / After N
        h_ends = QHBoxLayout()
        self.cmb_ends = QComboBox()
        self.cmb_ends.addItems(["Never", "On date", "After count"])
        h_ends.addWidget(QLabel("Ends:"))
        h_ends.addWidget(self.cmb_ends)

        self.date_until = QDateEdit()
        self.date_until.setCalendarPopup(True)
        self.date_until.setDate(QDate.currentDate().addDays(90))
        self.date_until.setVisible(False)
        h_ends.addWidget(self.date_until)

        self.spin_count = QSpinBox()
        self.spin_count.setRange(1, 365)
        self.spin_count.setValue(10)
        self.spin_count.setVisible(False)
        h_ends.addWidget(self.spin_count)
        h_ends.addStretch()
        l_rep.addLayout(h_ends)

        form.addRow(self.grp_repeat)

        # Reminder setting
        h_rem = QHBoxLayout()
        self.cmb_reminder = QComboBox()
        for label, mins in REMINDER_OPTIONS:
            self.cmb_reminder.addItem(label, mins)
        h_rem.addWidget(self.cmb_reminder)
        h_rem.addStretch()
        form.addRow("Reminder Alert:", h_rem)

        self.txt_notes = QTextEdit()
        self.txt_notes.setMaximumHeight(70)
        form.addRow("Notes:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Event")
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
        self.txt_title.textChanged.connect(self._on_dirty)
        self.cmb_category.currentTextChanged.connect(self._on_dirty)
        self.chk_all_day.stateChanged.connect(self._on_all_day_toggled)
        self.date_start.dateChanged.connect(self._on_start_date_changed)
        self.time_start.timeChanged.connect(self._on_dirty)
        self.date_end.dateChanged.connect(self._on_dirty)
        self.time_end.timeChanged.connect(self._on_dirty)
        self.txt_location.textChanged.connect(self._on_dirty)
        self.cmb_repeat.currentTextChanged.connect(self._on_repeat_changed)
        self.cmb_ends.currentTextChanged.connect(self._on_ends_changed)
        self.date_until.dateChanged.connect(self._on_dirty)
        self.spin_count.valueChanged.connect(self._on_dirty)
        self.cmb_reminder.currentIndexChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)
        for cb in self.chk_days.values():
            cb.stateChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _on_all_day_toggled(self, state: int):
        is_all = (state == Qt.CheckState.Checked.value)
        self.time_start.setEnabled(not is_all)
        self.time_end.setEnabled(not is_all)
        self._on_dirty()

    def _on_start_date_changed(self, qd: QDate):
        if self.date_end.date() < qd:
            self.date_end.setDate(qd)
        self._on_dirty()

    def _on_repeat_changed(self, text: str):
        self.w_weekdays.setVisible(text == "Weekly")
        self.w_monthly.setVisible(text == "Monthly")
        self._on_dirty()

    def _on_ends_changed(self, text: str):
        self.date_until.setVisible(text == "On date")
        self.spin_count.setVisible(text == "After count")
        self._on_dirty()

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _build_rrule_str(self) -> str:
        freq = self.cmb_repeat.currentText()
        if freq == "None":
            return ""

        parts = []
        if freq == "Daily":
            parts.append("FREQ=DAILY")
        elif freq == "Weekly":
            parts.append("FREQ=WEEKLY")
            selected_days = [code for code, cb in self.chk_days.items() if cb.isChecked()]
            if selected_days:
                parts.append("BYDAY=" + ",".join(selected_days))
        elif freq == "Monthly":
            parts.append("FREQ=MONTHLY")
            if self.rb_month_nth.isChecked():
                st_date = self.date_start.date().toPython()
                weekday_code = DAYS_OF_WEEK[st_date.weekday()]
                nth = (st_date.day - 1) // 7 + 1
                parts.append(f"BYDAY=+{nth}{weekday_code}")
        elif freq == "Custom (Days)":
            parts.append("FREQ=DAILY;INTERVAL=3")

        ends = self.cmb_ends.currentText()
        if ends == "On date":
            until_dt = self.date_until.date().toString("yyyyMMdd") + "T235959"
            parts.append(f"UNTIL={until_dt}")
        elif ends == "After count":
            parts.append(f"COUNT={self.spin_count.value()}")

        return ";".join(parts)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM schedule_events WHERE id = ?", (self.item_id,))
            if row:
                self.txt_title.setText(row["title"] or "")
                
                c_idx = self.cmb_category.findText(row["category"] or "Other")
                if c_idx != -1:
                    self.cmb_category.setCurrentIndex(c_idx)

                all_day = bool(row["all_day"])
                self.chk_all_day.setChecked(all_day)
                self.time_start.setEnabled(not all_day)
                self.time_end.setEnabled(not all_day)

                if row["start_date"]:
                    self.date_start.setDate(QDate.fromString(row["start_date"], Qt.DateFormat.ISODate))
                if row["end_date"]:
                    self.date_end.setDate(QDate.fromString(row["end_date"], Qt.DateFormat.ISODate))

                if row["start_time"]:
                    self.time_start.setTime(QTime.fromString(row["start_time"], "HH:mm"))
                if row["end_time"]:
                    self.time_end.setTime(QTime.fromString(row["end_time"], "HH:mm"))

                self.txt_location.setText(row["location"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["title"] or f"Event #{self.item_id}"

                # Parse repeat settings
                rep_type = row["repeat_type"] or "None"
                r_idx = self.cmb_repeat.findText(rep_type)
                if r_idx != -1:
                    self.cmb_repeat.setCurrentIndex(r_idx)
                self._on_repeat_changed(rep_type)

                # Parse reminder
                lead_mins = int(row["reminder_mins"] or 0)
                for i in range(self.cmb_reminder.count()):
                    if self.cmb_reminder.itemData(i) == lead_mins:
                        self.cmb_reminder.setCurrentIndex(i)
                        break

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        title = self.txt_title.text().strip()
        if not title:
            QMessageBox.warning(self, "Validation Error", "Event title cannot be empty.")
            return False

        start_date = self.date_start.date().toString(Qt.DateFormat.ISODate)
        end_date = self.date_end.date().toString(Qt.DateFormat.ISODate)
        all_day = 1 if self.chk_all_day.isChecked() else 0
        start_time = "00:00" if all_day else self.time_start.time().toString("HH:mm")
        end_time = "23:59" if all_day else self.time_end.time().toString("HH:mm")

        if not all_day and start_date == end_date and start_time >= end_time:
            QMessageBox.warning(self, "Validation Error", "Start time must be before end time.")
            return False

        # Detect conflicts across next 30 days
        s_date_obj = self.date_start.date().toPython()
        conflicts = self.section.detect_conflicts(s_date_obj, start_time, end_time, ignore_id=self.item_id)
        if conflicts:
            c_text = "\n".join([f"• {c['occ_date']} {c['start_time']}-{c['end_time']}: {c['title']}" for c in conflicts[:5]])
            reply = QMessageBox.warning(
                self, "Schedule Conflicts Detected",
                f"Warning: This event overlaps with existing events in the next 30 days:\n\n{c_text}\n\nDo you want to save anyway?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
                QMessageBox.StandardButton.No
            )
            if reply != QMessageBox.StandardButton.Yes:
                return False

        category = self.cmb_category.currentText()
        location = self.txt_location.text().strip()
        notes = self.txt_notes.toPlainText()
        repeat_type = self.cmb_repeat.currentText()
        rrule_str = self._build_rrule_str()
        reminder_mins = self.cmb_reminder.currentData() or 0
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute("""
                    INSERT INTO schedule_events 
                    (title, category, event_date, start_date, end_date, start_time, end_time, all_day, location, notes, repeat_type, rrule_str, reminder_mins, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (title, category, start_date, start_date, end_date, start_time, end_time, all_day, location, notes, repeat_type, rrule_str, reminder_mins, now_ts, now_ts))
                self.item_id = cur.lastrowid
                self.item_title = title

                # Setup reminder
                if reminder_mins > 0:
                    try:
                        ev_dt = datetime.strptime(f"{start_date} {start_time}", "%Y-%m-%d %H:%M")
                        rem_dt = (ev_dt - timedelta(minutes=reminder_mins)).strftime("%Y-%m-%d %H:%M:%S")
                        self.section.db.execute("""
                            INSERT INTO reminders (item_type, item_id, title, remind_at)
                            VALUES (?, ?, ?, ?)
                        """, ("schedule", self.item_id, f"Upcoming: {title} in {reminder_mins} mins", rem_dt))
                    except Exception:
                        pass

            self.panels.set_item_id(self.item_id)
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, title)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute("""
                    UPDATE schedule_events 
                    SET title = ?, category = ?, event_date = ?, start_date = ?, end_date = ?, start_time = ?, end_time = ?, 
                        all_day = ?, location = ?, notes = ?, repeat_type = ?, rrule_str = ?, reminder_mins = ?, updated_at = ?
                    WHERE id = ?
                """, (title, category, start_date, start_date, end_date, start_time, end_time, all_day, location, notes, repeat_type, rrule_str, reminder_mins, now_ts, self.item_id))
                self.item_title = title

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Schedule event saved successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this event?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM schedule_events WHERE id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM schedule_exceptions WHERE event_id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'schedule' AND item_id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class ScheduleSection(BaseSection):
    id = "schedule"
    name = "Schedule"
    icon_name = "clock"
    shortcut = "Alt+3"

    def __init__(self, db: Any):
        super().__init__(db)
        self.registry = None

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS schedule_events (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    category TEXT DEFAULT 'Other',
                    event_date TEXT,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    start_time TEXT NOT NULL,
                    end_time TEXT NOT NULL,
                    all_day INTEGER DEFAULT 0,
                    location TEXT,
                    notes TEXT,
                    repeat_type TEXT DEFAULT 'None',
                    rrule_str TEXT,
                    reminder_mins INTEGER DEFAULT 0,
                    archived INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS schedule_exceptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id INTEGER NOT NULL,
                    exception_date TEXT NOT NULL,
                    is_skipped INTEGER DEFAULT 1,
                    override_start_time TEXT,
                    override_end_time TEXT,
                    notes TEXT,
                    FOREIGN KEY(event_id) REFERENCES schedule_events(id) ON DELETE CASCADE,
                    UNIQUE(event_id, exception_date)
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ScheduleListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return ScheduleFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ScheduleFormView(self, None, parent)

    def add_skip_date(self, event_id: int, skip_date: str) -> None:
        with self.db.get_connection():
            self.db.execute("""
                INSERT OR REPLACE INTO schedule_exceptions (event_id, exception_date, is_skipped)
                VALUES (?, ?, 1)
            """, (event_id, skip_date))

    def truncate_until_date(self, event_id: int, until_date_str: str) -> None:
        # Stop recurrences before until_date_str (naive local format)
        dt = (datetime.strptime(until_date_str, "%Y-%m-%d").date() - timedelta(days=1)).strftime("%Y%m%d") + "T235959"
        row = self.db.fetchone("SELECT rrule_str FROM schedule_events WHERE id = ?", (event_id,))
        if row and row["rrule_str"]:
            clean_parts = [p for p in row["rrule_str"].split(";") if not p.startswith("UNTIL=") and not p.startswith("COUNT=")]
            clean_parts.append(f"UNTIL={dt}")
            new_rrule = ";".join(clean_parts)
            with self.db.get_connection():
                self.db.execute("UPDATE schedule_events SET rrule_str = ? WHERE id = ?", (new_rrule, event_id))

    def expand_occurrences(self, start_range: date, end_range: date) -> List[Dict[str, Any]]:
        """Expand all event occurrences dynamically between start_range and end_range."""
        occurrences: List[Dict[str, Any]] = []

        # Load exceptions map: (event_id, date_str) -> exception row
        exc_rows = self.db.fetchall("SELECT * FROM schedule_exceptions")
        exceptions = {(r["event_id"], r["exception_date"]): dict(r) for r in exc_rows}

        # Query all active schedule events
        events = self.db.fetchall("SELECT * FROM schedule_events WHERE archived = 0")
        for ev in events:
            ev_id = ev["id"]
            st_date = datetime.strptime(ev["start_date"], "%Y-%m-%d").date()
            rep_type = ev["repeat_type"]
            rrule_str = ev["rrule_str"]

            if rep_type == "None" or not rrule_str:
                # Single occurrence
                if start_range <= st_date <= end_range:
                    exc = exceptions.get((ev_id, st_date.isoformat()))
                    if not (exc and exc.get("is_skipped")):
                        occurrences.append({
                            "event_id": ev_id,
                            "occ_date": st_date.isoformat(),
                            "title": ev["title"],
                            "category": ev["category"],
                            "start_time": exc.get("override_start_time") if exc else ev["start_time"],
                            "end_time": exc.get("override_end_time") if exc else ev["end_time"],
                            "all_day": ev["all_day"],
                            "location": ev["location"],
                            "repeat_type": "None",
                            "source_type": "Schedule"
                        })
            else:
                # Recurring event: expand via python-dateutil
                try:
                    dtstart = datetime.combine(st_date, time(0, 0))
                    rule_obj = rrule.rrulestr(rrule_str, dtstart=dtstart)
                    start_dt = datetime.combine(start_range, time(0, 0))
                    end_dt = datetime.combine(end_range, time(23, 59, 59))
                    matches = rule_obj.between(start_dt, end_dt, inc=True)

                    for m in matches:
                        occ_d = m.date()
                        exc = exceptions.get((ev_id, occ_d.isoformat()))
                        if exc and exc.get("is_skipped"):
                            continue # Skipped exception
                        
                        occurrences.append({
                            "event_id": ev_id,
                            "occ_date": occ_d.isoformat(),
                            "title": ev["title"],
                            "category": ev["category"],
                            "start_time": exc.get("override_start_time") if exc else ev["start_time"],
                            "end_time": exc.get("override_end_time") if exc else ev["end_time"],
                            "all_day": ev["all_day"],
                            "location": ev["location"],
                            "repeat_type": rep_type,
                            "source_type": "Schedule"
                        })
                except Exception:
                    pass

        # Also pull exams as read-only occurrences
        try:
            exam_rows = self.db.fetchall("""
                SELECT id, subject, exam_date, exam_time, venue FROM exams 
                WHERE status = 'Upcoming' AND archived = 0 AND exam_date >= ? AND exam_date <= ?
            """, (start_range.isoformat(), end_range.isoformat()))
            for ex in exam_rows:
                occurrences.append({
                    "event_id": ex["id"],
                    "occ_date": ex["exam_date"],
                    "title": f"Exam: {ex['subject']}",
                    "category": "Study",
                    "start_time": ex["exam_time"] or "09:00",
                    "end_time": "12:00",
                    "all_day": 0,
                    "location": ex["venue"] or "Exam Hall",
                    "repeat_type": "None",
                    "source_type": "Exam"
                })
        except Exception:
            pass

        # Sort occurrences by date and start_time
        occurrences.sort(key=lambda x: (x["occ_date"], x["start_time"]))
        return occurrences

    def detect_conflicts(self, focus_date: date, start_time: str, end_time: str, ignore_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Check for time conflicts over the next 30 days."""
        end_check = focus_date + timedelta(days=30)
        all_occs = self.expand_occurrences(focus_date, end_check)
        conflicts = []
        for occ in all_occs:
            if occ.get("event_id") == ignore_id:
                continue
            if occ.get("all_day"):
                continue
            # Overlap condition: not (occ_end <= start_time or occ_start >= end_time)
            o_st = occ.get("start_time", "")
            o_et = occ.get("end_time", "")
            if not (o_et <= start_time or o_st >= end_time):
                conflicts.append(occ)
        return conflicts

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            today = date.today()
            today_occs = self.expand_occurrences(today, today)
            if not today_occs:
                l.addWidget(QLabel("No events scheduled for today."))
            else:
                for occ in today_occs[:4]:
                    t_str = "All Day" if occ.get("all_day") else occ.get("start_time")
                    btn = QPushButton(f"{t_str} - {occ['title']}")
                    ev_id = occ.get("event_id")
                    is_exam = occ.get("source_type") == "Exam"
                    if is_exam:
                        btn.clicked.connect(lambda ch=False, x=ev_id: w.window().tab_manager.open_tab("exams", TabKind.EDITOR, item_id=x) if hasattr(w.window(), "tab_manager") else None)
                    else:
                        btn.clicked.connect(lambda ch=False, x=ev_id: w.window().tab_manager.open_tab(self.id, TabKind.EDITOR, item_id=x) if hasattr(w.window(), "tab_manager") else None)
                    l.addWidget(btn)
            return w

        return [{
            "id": "schedule_today",
            "name": "Today's Schedule",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall("""
            SELECT id, title, start_date, location, notes FROM schedule_events 
            WHERE title LIKE ? OR location LIKE ? OR notes LIKE ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%"))
        return [{
            "id": r["id"],
            "title": f"Event: {r['title']} ({r['start_date']})",
            "snippet": f"Location: {r['location'] or 'N/A'} - {(r['notes'] or '')[:100]}",
            "section_id": self.id
        } for r in rows]
