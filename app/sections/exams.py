"""Section 3: Exams section for ADIOS.

Fields:
- subject*
- exam_type (Quiz / Mid-sem / End-sem / Lab / Viva / Other)
- date*
- start_time
- duration (minutes)
- venue
- syllabus_notes (multiline)
- status (Upcoming / Done / Missed / Cancelled)
- marks_obtained, max_marks
- archived (0/1)

Features:
- LIST columns: Subject, Type, Date, Time, Duration, Days Left, Status, Marks
- Default sort: date ascending, Upcoming only (Show Archived respects View menu toggle)
- Row count & last saved time to status bar
- Right-click context menu (Open, Duplicate, Archive, Delete, Add Tag, Add Reminder)
- Toolbar inside tab (New, Open, Delete, Refresh)
- Past date warning dialog on create
- Default reminders on create: 7 days before, 1 day before, 8:00 AM on exam day
- "Add to Schedule" button (creates matching Schedule event)
- "Mark as Done" sets status Done and enables marks fields
- Preparation % = share of linked Study Topics marked Done
- Collapsible side panels: Tags, Linked Items, Reminders
- Dashboard widget: "Upcoming Exams" (next 3, with days left, double click opens tab)
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QTimeEdit, QSpinBox, QDoubleSpinBox, QMessageBox, 
    QHeaderView, QMenu, QToolBar, QSplitter
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate, QTime, QPoint
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.ui.widgets.item_panels import ItemPanelsWidget


EXAM_TYPES = ["Quiz", "Mid-sem", "End-sem", "Lab", "Viva", "Other"]
EXAM_STATUSES = ["Upcoming", "Done", "Missed", "Cancelled"]


class ExamsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Subject", "Type", "Date", "Time", "Duration", "Days Left", "Status", "Marks"]

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
            return item.get("subject")
        elif col == 2:
            return item.get("exam_type") or "Quiz"
        elif col == 3:
            return item.get("exam_date")
        elif col == 4:
            return item.get("exam_time") or "-"
        elif col == 5:
            dur = item.get("duration")
            return f"{dur} min" if dur else "-"
        elif col == 6:
            st = item.get("status")
            if st in ("Done", "Missed", "Cancelled"):
                return ""
            ed_str = item.get("exam_date")
            if ed_str:
                try:
                    ed = datetime.strptime(ed_str, "%Y-%m-%d").date()
                    delta = (ed - date.today()).days
                    if delta == 0:
                        return "Today!"
                    elif delta > 0:
                        return f"{delta} days"
                    else:
                        return f"Past ({abs(delta)}d)"
                except Exception:
                    pass
            return ""
        elif col == 7:
            archived = item.get("archived", 0)
            st = item.get("status") or "Upcoming"
            return f"{st} (Archived)" if archived else st
        elif col == 8:
            mo = item.get("marks_obtained")
            mm = item.get("max_marks")
            if mo is not None and mm is not None:
                return f"{mo}/{mm}"
            return "-"
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("id") or 0,
            1: lambda x: (x.get("subject") or "").lower(),
            2: lambda x: (x.get("exam_type") or "").lower(),
            3: lambda x: x.get("exam_date") or "",
            4: lambda x: x.get("exam_time") or "",
            5: lambda x: int(x.get("duration") or 0),
            6: lambda x: x.get("exam_date") or "",
            7: lambda x: (x.get("status") or "").lower(),
            8: lambda x: float(x.get("marks_obtained") or 0),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class ExamsListView(QWidget):
    """List tab for Exams with toolbar, sortable grid, context menu, and filters."""
    def __init__(self, section: ExamsSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        # Tab Toolbar
        self.tab_toolbar = QToolBar(self)
        self.tab_toolbar.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextBesideIcon)
        act_new = self.tab_toolbar.addAction("New Exam")
        act_open = self.tab_toolbar.addAction("Open")
        act_del = self.tab_toolbar.addAction("Delete")
        act_refresh = self.tab_toolbar.addAction("Refresh")
        layout.addWidget(self.tab_toolbar)

        # Filter bar
        filter_bar = QHBoxLayout()
        filter_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Subject, venue...")
        self.txt_filter.setFixedWidth(160)
        filter_bar.addWidget(self.txt_filter)

        filter_bar.addWidget(QLabel("Status:"))
        self.cmb_status = QComboBox()
        self.cmb_status.addItem("Upcoming Only")
        self.cmb_status.addItem("All Statuses")
        self.cmb_status.addItems(EXAM_STATUSES)
        filter_bar.addWidget(self.cmb_status)

        filter_bar.addWidget(QLabel("Type:"))
        self.cmb_type = QComboBox()
        self.cmb_type.addItem("All Types")
        self.cmb_type.addItems(EXAM_TYPES)
        filter_bar.addWidget(self.cmb_type)

        filter_bar.addStretch()
        self.lbl_count = QLabel("0 exams")
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
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        # Toolbar connections
        act_new.triggered.connect(self._on_new)
        act_open.triggered.connect(self._on_open_selected)
        act_del.triggered.connect(self._on_delete_selected)
        act_refresh.triggered.connect(self.refresh)

        # Signals
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_status.currentTextChanged.connect(self._apply_filter)
        self.cmb_type.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)
        self.table.customContextMenuRequested.connect(self._show_context_menu)

        self.refresh()

    def refresh(self):
        show_archived = False
        window = self.window()
        if hasattr(window, "action_manager"):
            act_arch = window.action_manager.actions.get("view_show_archived")
            if act_arch and act_arch.isChecked():
                show_archived = True

        sql = """
            SELECT id, subject, exam_type, exam_date, exam_time, duration, venue, 
                   syllabus_notes, status, marks_obtained, max_marks, archived, updated_at
            FROM exams
        """
        if not show_archived:
            sql += " WHERE archived = 0"
        sql += " ORDER BY exam_date ASC, exam_time ASC"

        rows = self.section.db.fetchall(sql)
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        st_filter = self.cmb_status.currentText()
        type_filter = self.cmb_type.currentText()

        filtered = []
        for it in self._all_items:
            st = it.get("status") or "Upcoming"
            if st_filter == "Upcoming Only":
                if st != "Upcoming":
                    continue
            elif st_filter != "All Statuses":
                if st != st_filter:
                    continue

            if type_filter != "All Types" and it.get("exam_type") != type_filter:
                continue

            if q:
                sub = (it.get("subject") or "").lower()
                ven = (it.get("venue") or "").lower()
                if q not in sub and q not in ven:
                    continue

            filtered.append(it)

        self.model = ExamsTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_count.setText(f"{len(filtered)} / {len(self._all_items)} exams")
        
        # Update main window status bar
        window = self.window()
        if hasattr(window, "status_tab_info"):
            window.status_tab_info.setText(f"Exams List: {len(filtered)} items shown")

    def _get_selected_id(self) -> Optional[int]:
        sel = self.table.selectionModel()
        if sel and sel.hasSelection():
            idx = sel.selectedRows()[0]
            return self.model._data[idx.row()]["id"]
        return None

    def _on_new(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.CREATE)

    def _on_open_selected(self):
        item_id = self._get_selected_id()
        if item_id:
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)

    def _on_delete_selected(self):
        item_id = self._get_selected_id()
        if not item_id:
            return
        reply = QMessageBox.question(
            self, "Confirm Delete", "Are you sure you want to delete this exam?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM exams WHERE id = ?", (item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'exams' AND item_id = ?", (item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, item_id)
            self.refresh()

    def _on_double_click(self, index: QModelIndex):
        if not index.isValid():
            return
        item_id = self.model._data[index.row()]["id"]
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)

    def _show_context_menu(self, pos: QPoint):
        idx = self.table.indexAt(pos)
        if not idx.isValid():
            return
        item = self.model._data[idx.row()]
        item_id = item["id"]

        menu = QMenu(self)
        act_open = menu.addAction("Open")
        act_duplicate = menu.addAction("Duplicate Item")
        act_archive = menu.addAction("Archive / Unarchive Item")
        act_delete = menu.addAction("Delete Item")
        menu.addSeparator()
        act_add_tag = menu.addAction("Add Tag...")
        act_add_rem = menu.addAction("Add Reminder...")

        chosen = menu.exec(self.table.viewport().mapToGlobal(pos))
        if chosen == act_open:
            self._on_open_selected()
        elif chosen == act_duplicate:
            with self.section.db.get_connection():
                self.section.db.execute("""
                    INSERT INTO exams (subject, exam_type, exam_date, exam_time, duration, venue, syllabus_notes, status, max_marks)
                    SELECT subject || ' (Copy)', exam_type, exam_date, exam_time, duration, venue, syllabus_notes, 'Upcoming', max_marks
                    FROM exams WHERE id = ?
                """, (item_id,))
            self.refresh()
        elif chosen == act_archive:
            new_arch = 0 if item.get("archived") else 1
            with self.section.db.get_connection():
                self.section.db.execute("UPDATE exams SET archived = ? WHERE id = ?", (new_arch, item_id))
            self.refresh()
        elif chosen == act_delete:
            self._on_delete_selected()
        elif chosen == act_add_tag:
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)
        elif chosen == act_add_rem:
            from app.ui.widgets.item_panels import AddReminderDialog
            dlg = AddReminderDialog(item["subject"], parent=self)
            if dlg.exec():
                msg, r_at = dlg.get_reminder_data()
                with self.section.db.get_connection():
                    self.section.db.execute(
                        "INSERT INTO reminders (item_type, item_id, title, remind_at) VALUES (?, ?, ?, ?)",
                        (self.section.id, item_id, msg, r_at)
                    )


class ExamsFormView(QWidget):
    """Unified Editor and Create form for Exams with collapsible side panels."""
    def __init__(self, section: ExamsSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Exam #{item_id}" if item_id else "New Exam"
        self._loading = False

        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(8, 8, 8, 8)

        splitter = QSplitter(Qt.Orientation.Horizontal)
        main_layout.addWidget(splitter)

        # Left: Main Form
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(4, 4, 4, 4)

        form = QFormLayout()
        self.txt_subject = QLineEdit()
        form.addRow("Subject*:", self.txt_subject)

        h_type_stat = QHBoxLayout()
        self.cmb_type = QComboBox()
        self.cmb_type.addItems(EXAM_TYPES)
        h_type_stat.addWidget(self.cmb_type)

        self.cmb_status = QComboBox()
        self.cmb_status.addItems(EXAM_STATUSES)
        h_type_stat.addWidget(QLabel("Status:"))
        h_type_stat.addWidget(self.cmb_status)
        h_type_stat.addStretch()
        form.addRow("Type / Status:", h_type_stat)

        h_dt = QHBoxLayout()
        self.date_exam = QDateEdit()
        self.date_exam.setCalendarPopup(True)
        self.date_exam.setDate(QDate.currentDate().addDays(7))
        h_dt.addWidget(self.date_exam)

        h_dt.addWidget(QLabel("Start Time:"))
        self.time_exam = QTimeEdit()
        self.time_exam.setTime(QTime(9, 0))
        h_dt.addWidget(self.time_exam)

        h_dt.addWidget(QLabel("Duration (min):"))
        self.spin_duration = QSpinBox()
        self.spin_duration.setRange(10, 600)
        self.spin_duration.setValue(180)
        h_dt.addWidget(self.spin_duration)
        h_dt.addStretch()
        form.addRow("Date, Time & Duration:", h_dt)

        self.txt_venue = QLineEdit()
        self.txt_venue.setPlaceholderText("Exam hall, room number, online link...")
        form.addRow("Venue:", self.txt_venue)

        # Marks Section
        h_marks = QHBoxLayout()
        self.spin_obtained = QDoubleSpinBox()
        self.spin_obtained.setRange(0.0, 1000.0)
        self.spin_obtained.setValue(0.0)
        self.spin_obtained.setEnabled(False) # Enabled when status is Done

        self.spin_max = QDoubleSpinBox()
        self.spin_max.setRange(1.0, 1000.0)
        self.spin_max.setValue(100.0)

        h_marks.addWidget(QLabel("Obtained:"))
        h_marks.addWidget(self.spin_obtained)
        h_marks.addWidget(QLabel("Max:"))
        h_marks.addWidget(self.spin_max)

        self.lbl_prep = QLabel("Preparation: 0%")
        h_marks.addWidget(self.lbl_prep)
        h_marks.addStretch()
        form.addRow("Marks & Preparation:", h_marks)

        self.txt_notes = QTextEdit()
        self.txt_notes.setPlaceholderText("Syllabus topics, allowed materials, exam rules...")
        form.addRow("Syllabus / Notes:", self.txt_notes)

        layout.addLayout(form)

        # Action Buttons
        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Exam")
        self.btn_cancel = QPushButton("Cancel")
        self.btn_mark_done = QPushButton("Mark as Done")
        self.btn_add_schedule = QPushButton("Add to Schedule")
        self.btn_delete = QPushButton("Delete")
        if not self.item_id:
            self.btn_delete.setVisible(False)

        self.btn_add_schedule.setEnabled(True)
        self.btn_add_schedule.setToolTip("Create a matching event in Schedule")

        btn_bar.addWidget(self.btn_save)
        btn_bar.addWidget(self.btn_cancel)
        btn_bar.addSpacing(10)
        btn_bar.addWidget(self.btn_mark_done)
        btn_bar.addWidget(self.btn_add_schedule)
        btn_bar.addSpacing(10)
        btn_bar.addWidget(self.btn_delete)
        btn_bar.addStretch()
        layout.addLayout(btn_bar)

        splitter.addWidget(form_container)

        # Right: Reusable Side Panels (Tags, Linked Items, Reminders)
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

        # Signal connections
        self.txt_subject.textChanged.connect(self._on_dirty)
        self.cmb_type.currentTextChanged.connect(self._on_dirty)
        self.cmb_status.currentTextChanged.connect(self._on_status_changed)
        self.date_exam.dateChanged.connect(self._on_dirty)
        self.time_exam.timeChanged.connect(self._on_dirty)
        self.spin_duration.valueChanged.connect(self._on_dirty)
        self.txt_venue.textChanged.connect(self._on_dirty)
        self.spin_obtained.valueChanged.connect(self._on_dirty)
        self.spin_max.valueChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_mark_done.clicked.connect(self._on_mark_done)
        self.btn_add_schedule.clicked.connect(self._on_add_to_schedule)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _on_status_changed(self, text: str):
        self.spin_obtained.setEnabled(text == "Done")
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
            row = self.section.db.fetchone("SELECT * FROM exams WHERE id = ?", (self.item_id,))
            if row:
                self.txt_subject.setText(row["subject"] or "")
                
                t_idx = self.cmb_type.findText(row["exam_type"] or "Quiz")
                if t_idx != -1:
                    self.cmb_type.setCurrentIndex(t_idx)

                s_idx = self.cmb_status.findText(row["status"] or "Upcoming")
                if s_idx != -1:
                    self.cmb_status.setCurrentIndex(s_idx)

                d_str = row["exam_date"]
                if d_str:
                    qd = QDate.fromString(d_str, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_exam.setDate(qd)

                t_str = row["exam_time"]
                if t_str:
                    self.time_exam.setTime(QTime.fromString(t_str, "HH:mm"))

                raw_dur = row["duration"]
                dur_val = 180
                if raw_dur is not None:
                    try:
                        dur_val = int(raw_dur)
                    except (ValueError, TypeError):
                        # Handle text like "3 hours" or "180 mins"
                        import re
                        m = re.search(r'\d+', str(raw_dur))
                        dur_val = int(m.group()) if m else 180
                        if "hour" in str(raw_dur).lower():
                            dur_val *= 60
                self.spin_duration.setValue(dur_val)
                self.txt_venue.setText(row["venue"] or "")

                if row["marks_obtained"] is not None:
                    self.spin_obtained.setValue(float(row["marks_obtained"]))
                if row["max_marks"] is not None:
                    self.spin_max.setValue(float(row["max_marks"]))

                self.spin_obtained.setEnabled((row["status"] or "") == "Done")
                self.txt_notes.setPlainText(row["syllabus_notes"] or "")
                self.item_title = row["subject"] or f"Exam #{self.item_id}"

                # Update Preparation % if linked to study topics
                self._update_prep_percentage()

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def _update_prep_percentage(self):
        if not self.item_id:
            self.lbl_prep.setText("Preparation: 0%")
            return
        # Query linked study topics
        try:
            rows = self.section.db.fetchall("""
                SELECT status FROM study_topics WHERE linked_exam_id = ?
            """, (self.item_id,))
            if rows:
                total = len(rows)
                done = sum(1 for r in rows if r["status"] == "Done")
                pct = int((done / total) * 100)
                self.lbl_prep.setText(f"Preparation: {pct}% ({done}/{total} topics)")
            else:
                self.lbl_prep.setText("Preparation: N/A")
        except Exception:
            self.lbl_prep.setText("Preparation: N/A")

    def save_item(self) -> bool:
        subject = self.txt_subject.text().strip()
        if not subject:
            QMessageBox.warning(self, "Validation Error", "Exam subject cannot be empty.")
            return False

        exam_date = self.date_exam.date().toString(Qt.DateFormat.ISODate)
        today_str = date.today().isoformat()

        # Past date warning on creation
        if self.item_id is None and exam_date < today_str:
            reply = QMessageBox.warning(
                self, "Past Exam Date", 
                "The exam date you entered is in the past. Do you want to save anyway?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No,
                QMessageBox.StandardButton.Yes
            )
            if reply != QMessageBox.StandardButton.Yes:
                return False

        exam_type = self.cmb_type.currentText()
        status = self.cmb_status.currentText()
        exam_time = self.time_exam.time().toString("HH:mm")
        duration = self.spin_duration.value()
        venue = self.txt_venue.text().strip()
        marks_obtained = self.spin_obtained.value() if status == "Done" else None
        max_marks = self.spin_max.value()
        syllabus_notes = self.txt_notes.toPlainText()
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute("""
                    INSERT INTO exams 
                    (subject, exam_type, exam_date, exam_time, duration, venue, syllabus_notes, status, marks_obtained, max_marks, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (subject, exam_type, exam_date, exam_time, duration, venue, syllabus_notes, status, marks_obtained, max_marks, now_ts, now_ts))
                self.item_id = cur.lastrowid
                self.item_title = subject

                # Create default reminders: 7 days before, 1 day before, 8:00 AM on exam day
                try:
                    ed = datetime.strptime(exam_date, "%Y-%m-%d").date()
                    r7 = (ed - timedelta(days=7)).isoformat() + " 08:00:00"
                    r1 = (ed - timedelta(days=1)).isoformat() + " 08:00:00"
                    r0 = ed.isoformat() + " 08:00:00"

                    for r_time, label in [(r7, "in 7 days"), (r1, "tomorrow"), (r0, "today")]:
                        if r_time >= now_ts:
                            self.section.db.execute("""
                                INSERT INTO reminders (item_type, item_id, title, remind_at)
                                VALUES (?, ?, ?, ?)
                            """, ("exams", self.item_id, f"Exam {label}: {subject} ({exam_time})", r_time))
                except Exception:
                    pass

            self.panels.set_item_id(self.item_id)
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, subject)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute("""
                    UPDATE exams 
                    SET subject = ?, exam_type = ?, exam_date = ?, exam_time = ?, duration = ?, 
                        venue = ?, syllabus_notes = ?, status = ?, marks_obtained = ?, max_marks = ?, updated_at = ?
                    WHERE id = ?
                """, (subject, exam_type, exam_date, exam_time, duration, venue, syllabus_notes, status, marks_obtained, max_marks, now_ts, self.item_id))
                self.item_title = subject

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Exam saved successfully.")
        return True

    def _on_mark_done(self):
        idx = self.cmb_status.findText("Done")
        if idx != -1:
            self.cmb_status.setCurrentIndex(idx)
            self.spin_obtained.setEnabled(True)
            self.spin_obtained.setFocus()
            self._on_dirty()

    def _on_add_to_schedule(self):
        subject = self.txt_subject.text().strip() or "Exam"
        event_date = self.date_exam.date().toString(Qt.DateFormat.ISODate)
        start_time = self.time_exam.time().toString("HH:mm")
        
        # Compute end time
        duration = self.spin_duration.value()
        end_qtime = self.time_exam.time().addSecs(duration * 60)
        end_time = end_qtime.toString("HH:mm")
        venue = self.txt_venue.text().strip()

        with self.section.db.get_connection():
            self.section.db.execute("""
                INSERT INTO schedule_events 
                (title, event_date, start_time, end_time, recurrence, location, notes)
                VALUES (?, ?, ?, ?, 'None', ?, ?)
            """, (f"Exam: {subject}", event_date, start_time, end_time, venue, f"Linked to Exam #{self.item_id or ''}"))

        QMessageBox.information(self, "Added", f"Added '{subject}' to Schedule on {event_date} ({start_time} - {end_time}).")
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.refresh_list_tabs("schedule")

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
            self, "Confirm Delete", "Are you sure you want to delete this exam?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM exams WHERE id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'exams' AND item_id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM item_tags WHERE item_type = 'exams' AND item_id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM links WHERE (source_type = 'exams' AND source_id = ?) OR (target_type = 'exams' AND target_id = ?)", (self.item_id, self.item_id))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class ExamsSection(BaseSection):
    id = "exams"
    name = "Exams"
    icon_name = "calendar"
    shortcut = "Alt+2"

    def __init__(self, db: Any):
        super().__init__(db)
        self.registry = None # Injected or resolved via window

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS exams (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    subject TEXT NOT NULL,
                    exam_type TEXT DEFAULT 'Quiz',
                    exam_date TEXT NOT NULL,
                    exam_time TEXT,
                    duration INTEGER DEFAULT 180,
                    venue TEXT,
                    syllabus_notes TEXT,
                    status TEXT DEFAULT 'Upcoming',
                    marks_obtained REAL,
                    max_marks REAL DEFAULT 100.0,
                    archived INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ExamsListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return ExamsFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return ExamsFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            today_str = date.today().isoformat()
            rows = self.db.fetchall("""
                SELECT id, subject, exam_type, exam_date FROM exams 
                WHERE status = 'Upcoming' AND archived = 0 AND exam_date >= ? 
                ORDER BY exam_date ASC LIMIT 3
            """, (today_str,))
            if not rows:
                l.addWidget(QLabel("No upcoming exams!"))
            else:
                for r in rows:
                    ed = datetime.strptime(r["exam_date"], "%Y-%m-%d").date()
                    days = (ed - date.today()).days
                    day_txt = "Today!" if days == 0 else (f"{days}d left" if days > 0 else "Passed")
                    btn = QPushButton(f"[{r['exam_type']}] {r['subject']} ({day_txt})")
                    item_id = r["id"]
                    btn.clicked.connect(lambda ch=False, iid=item_id: w.window().tab_manager.open_tab(self.id, TabKind.EDITOR, item_id=iid) if hasattr(w.window(), "tab_manager") else None)
                    l.addWidget(btn)
            return w

        return [{
            "id": "upcoming_exams",
            "name": "Upcoming Exams",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall("""
            SELECT id, subject, exam_type, exam_date, venue, syllabus_notes FROM exams 
            WHERE subject LIKE ? OR venue LIKE ? OR syllabus_notes LIKE ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%"))
        return [{
            "id": r["id"],
            "title": f"[{r['exam_type']}] {r['subject']} ({r['exam_date']})",
            "snippet": f"Venue: {r['venue'] or 'N/A'} - {(r['syllabus_notes'] or '')[:100]}",
            "section_id": self.id
        } for r in rows]
