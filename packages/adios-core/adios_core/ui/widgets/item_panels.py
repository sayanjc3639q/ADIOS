"""Reusable side panels for Forms (Tags, Linked Items, Reminders).

Shared across all sections as collapsible QGroupBoxes:
- Tags: view, add, remove tags for (item_type, item_id)
- Linked Items: view links, Add Link dialog (section picker + item picker)
- Reminders: view reminders, Add Reminder dialog
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QGroupBox, QListWidget, QListWidgetItem, QDialog, QComboBox, 
    QLineEdit, QDateEdit, QTimeEdit, QMessageBox
)
from PySide6.QtCore import Qt, QDate, QTime


class LinkPickerDialog(QDialog):
    """Dialog to pick a target section and item to link."""
    def __init__(self, registry: Any, current_section: str, current_id: Optional[int], parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Link to Item")
        self.resize(380, 320)
        self.registry = registry
        self.current_section = current_section
        self.current_id = current_id
        self.selected_target: Optional[tuple[str, int, str]] = None # (section_id, item_id, title)

        layout = QVBoxLayout(self)
        
        # Section chooser
        h_sec = QHBoxLayout()
        h_sec.addWidget(QLabel("Section:"))
        self.cmb_section = QComboBox()
        for sec in self.registry.all_sections():
            self.cmb_section.addItem(sec.name, sec.id)
        h_sec.addWidget(self.cmb_section)
        layout.addLayout(h_sec)

        # Filter and Item list
        layout.addWidget(QLabel("Select Item:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Filter items...")
        layout.addWidget(self.txt_filter)

        self.list_items = QListWidget()
        layout.addWidget(self.list_items)

        btn_box = QHBoxLayout()
        self.btn_ok = QPushButton("Link Item")
        self.btn_cancel = QPushButton("Cancel")
        btn_box.addStretch()
        btn_box.addWidget(self.btn_ok)
        btn_box.addWidget(self.btn_cancel)
        layout.addLayout(btn_box)

        self.cmb_section.currentIndexChanged.connect(self._populate_items)
        self.txt_filter.textChanged.connect(self._filter_items)
        self.list_items.itemDoubleClicked.connect(self._on_accept)
        self.btn_ok.clicked.connect(self._on_accept)
        self.btn_cancel.clicked.connect(self.reject)

        self._all_items = []
        self._populate_items()

    def _populate_items(self):
        sec_id = self.cmb_section.currentData()
        self._all_items = []
        if not sec_id:
            return
        sec = self.registry.get(sec_id)
        if sec:
            try:
                # Query recent items from section's search or directly
                results = sec.search("")
                for it in results:
                    # Don't link to self
                    if sec_id == self.current_section and it["id"] == self.current_id:
                        continue
                    self._all_items.append((sec_id, it["id"], it["title"]))
            except Exception:
                pass
        self._filter_items()

    def _filter_items(self):
        q = self.txt_filter.text().strip().lower()
        self.list_items.clear()
        for sec_id, item_id, title in self._all_items:
            if q and q not in title.lower():
                continue
            item = QListWidgetItem(f"#{item_id} - {title}")
            item.setData(Qt.ItemDataRole.UserRole, (sec_id, item_id, title))
            self.list_items.addItem(item)

    def _on_accept(self):
        cur = self.list_items.currentItem()
        if cur:
            self.selected_target = cur.data(Qt.ItemDataRole.UserRole)
            self.accept()


class AddReminderDialog(QDialog):
    """Dialog to create a reminder for an item."""
    def __init__(self, item_title: str, default_date: Optional[QDate] = None, parent=None):
        super().__init__(parent)
        self.setWindowTitle("Add Reminder")
        self.resize(320, 200)

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Reminder Message:"))
        self.txt_msg = QLineEdit(f"Reminder: {item_title}")
        layout.addWidget(self.txt_msg)

        h_dt = QHBoxLayout()
        self.date_edit = QDateEdit()
        self.date_edit.setCalendarPopup(True)
        self.date_edit.setDate(default_date or QDate.currentDate())
        h_dt.addWidget(self.date_edit)

        self.time_edit = QTimeEdit()
        self.time_edit.setTime(QTime(9, 0))
        h_dt.addWidget(self.time_edit)
        layout.addLayout(h_dt)

        btn_box = QHBoxLayout()
        btn_ok = QPushButton("Add")
        btn_cancel = QPushButton("Cancel")
        btn_box.addStretch()
        btn_box.addWidget(btn_ok)
        btn_box.addWidget(btn_cancel)
        layout.addLayout(btn_box)

        btn_ok.clicked.connect(self.accept)
        btn_cancel.clicked.connect(self.reject)

    def get_reminder_data(self) -> tuple[str, str]:
        remind_at = f"{self.date_edit.date().toString(Qt.DateFormat.ISODate)} {self.time_edit.time().toString('HH:mm:ss')}"
        return self.txt_msg.text().strip(), remind_at


class ItemPanelsWidget(QWidget):
    """
    Standard three collapsible side panels:
    1. Tags
    2. Linked Items
    3. Reminders
    """
    def __init__(self, *args, **kwargs):
        # Flexible signature supporting both:
        # (db, registry, section_id, item_id, on_dirty_cb, parent=...)
        # and
        # (section_id, item_id, db, on_dirty_cb=None, parent=...)
        parent = kwargs.pop("parent", None)
        super().__init__(parent)

        if len(args) >= 3 and isinstance(args[0], str):
            # Form: ItemPanelsWidget("skills", item_id, db, on_dirty_cb=..., parent=...)
            self.section_id = args[0]
            self.item_id = args[1] if len(args) > 1 else None
            self.db = args[2] if len(args) > 2 else kwargs.get("db")
            self.on_dirty_cb = args[3] if len(args) > 3 else kwargs.get("on_dirty_cb")
            self.registry = kwargs.get("registry")
            if not self.registry and hasattr(self.db, "registry"):
                self.registry = self.db.registry
        else:
            # Form: ItemPanelsWidget(db, registry, section_id, item_id, on_dirty_cb, parent=...)
            self.db = kwargs.get("db", args[0] if len(args) > 0 else None)
            self.registry = kwargs.get("registry", args[1] if len(args) > 1 else None)
            self.section_id = kwargs.get("section_id", args[2] if len(args) > 2 else "item")
            self.item_id = kwargs.get("item_id", args[3] if len(args) > 3 else None)
            self.on_dirty_cb = kwargs.get("on_dirty_cb", args[4] if len(args) > 4 else None)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(6)

        # 1. TAGS PANEL
        self.box_tags = QGroupBox("Tags")
        l_tags = QVBoxLayout(self.box_tags)
        self.list_tags = QListWidget()
        self.list_tags.setMaximumHeight(70)
        h_tag_ctrl = QHBoxLayout()
        self.txt_new_tag = QLineEdit()
        self.txt_new_tag.setPlaceholderText("Add tag...")
        self.btn_add_tag = QPushButton("+")
        self.btn_add_tag.setFixedWidth(28)
        self.btn_del_tag = QPushButton("-")
        self.btn_del_tag.setFixedWidth(28)
        h_tag_ctrl.addWidget(self.txt_new_tag)
        h_tag_ctrl.addWidget(self.btn_add_tag)
        h_tag_ctrl.addWidget(self.btn_del_tag)
        l_tags.addWidget(self.list_tags)
        l_tags.addLayout(h_tag_ctrl)
        layout.addWidget(self.box_tags)

        # 2. LINKED ITEMS PANEL
        self.box_links = QGroupBox("Linked Items")
        l_links = QVBoxLayout(self.box_links)
        self.list_links = QListWidget()
        self.list_links.setMaximumHeight(85)
        h_link_ctrl = QHBoxLayout()
        self.btn_add_link = QPushButton("Add Link...")
        self.btn_del_link = QPushButton("Remove Link")
        h_link_ctrl.addWidget(self.btn_add_link)
        h_link_ctrl.addWidget(self.btn_del_link)
        l_links.addWidget(self.list_links)
        l_links.addLayout(h_link_ctrl)
        layout.addWidget(self.box_links)

        # 3. REMINDERS PANEL
        self.box_reminders = QGroupBox("Reminders")
        l_rem = QVBoxLayout(self.box_reminders)
        self.list_rem = QListWidget()
        self.list_rem.setMaximumHeight(75)
        h_rem_ctrl = QHBoxLayout()
        self.btn_add_rem = QPushButton("Add Reminder...")
        self.btn_del_rem = QPushButton("Dismiss")
        h_rem_ctrl.addWidget(self.btn_add_rem)
        h_rem_ctrl.addWidget(self.btn_del_rem)
        l_rem.addWidget(self.list_rem)
        l_rem.addLayout(h_rem_ctrl)
        layout.addWidget(self.box_reminders)

        # Signals
        self.btn_add_tag.clicked.connect(self._add_tag)
        self.txt_new_tag.returnPressed.connect(self._add_tag)
        self.btn_del_tag.clicked.connect(self._del_tag)

        self.btn_add_link.clicked.connect(self._add_link)
        self.btn_del_link.clicked.connect(self._del_link)
        self.list_links.itemDoubleClicked.connect(self._open_linked_item)

        self.btn_add_rem.clicked.connect(self._add_reminder)
        self.btn_del_rem.clicked.connect(self._del_reminder)

        self.refresh()

    def set_item_id(self, new_id: int):
        self.item_id = new_id
        self.refresh()

    def update_item_id(self, new_id: int):
        self.set_item_id(new_id)

    def refresh(self):
        self.list_tags.clear()
        self.list_links.clear()
        self.list_rem.clear()
        if not self.item_id:
            return

        # Load Tags
        rows_tags = self.db.fetchall("""
            SELECT t.id, t.name FROM tags t
            JOIN item_tags it ON t.id = it.tag_id
            WHERE it.item_type = ? AND it.item_id = ?
            ORDER BY t.name ASC
        """, (self.section_id, self.item_id))
        for r in rows_tags:
            item = QListWidgetItem(r["name"])
            item.setData(Qt.ItemDataRole.UserRole, r["id"])
            self.list_tags.addItem(item)

        # Load Links (bi-directional check)
        rows_links = self.db.fetchall("""
            SELECT id, source_type, source_id, target_type, target_id, relationship
            FROM links
            WHERE (source_type = ? AND source_id = ?) OR (target_type = ? AND target_id = ?)
        """, (self.section_id, self.item_id, self.section_id, self.item_id))
        
        for r in rows_links:
            if r["source_type"] == self.section_id and r["source_id"] == self.item_id:
                other_sec, other_id = r["target_type"], r["target_id"]
            else:
                other_sec, other_id = r["source_type"], r["source_id"]
            
            # Fetch other title
            sec_obj = self.registry.get(other_sec)
            sec_name = sec_obj.name if sec_obj else other_sec
            title = f"{sec_name} #{other_id}"
            if sec_obj:
                res = sec_obj.search("")
                for it in res:
                    if it["id"] == other_id:
                        title = f"{sec_name}: {it['title']}"
                        break
            
            l_item = QListWidgetItem(title)
            l_item.setData(Qt.ItemDataRole.UserRole, (r["id"], other_sec, other_id))
            self.list_links.addItem(l_item)

        # Load Reminders
        rows_rem = self.db.fetchall("""
            SELECT id, title, remind_at, is_dismissed FROM reminders
            WHERE item_type = ? AND item_id = ? AND is_dismissed = 0
            ORDER BY remind_at ASC
        """, (self.section_id, self.item_id))
        for r in rows_rem:
            item = QListWidgetItem(f"{r['remind_at']} - {r['title']}")
            item.setData(Qt.ItemDataRole.UserRole, r["id"])
            self.list_rem.addItem(item)

    def _add_tag(self):
        tag_name = self.txt_new_tag.text().strip()
        if not tag_name:
            return
        if not self.item_id:
            QMessageBox.information(self, "Notice", "Please save the item first before adding tags.")
            return

        with self.db.get_connection():
            # Get or create tag
            cur = self.db.execute("SELECT id FROM tags WHERE name = ?", (tag_name,))
            row = cur.fetchone()
            if row:
                tag_id = row[0]
            else:
                cur = self.db.execute("INSERT INTO tags (name) VALUES (?)", (tag_name,))
                tag_id = cur.lastrowid
            
            try:
                self.db.execute(
                    "INSERT INTO item_tags (item_type, item_id, tag_id) VALUES (?, ?, ?)",
                    (self.section_id, self.item_id, tag_id)
                )
            except Exception:
                pass # Already tagged

        self.txt_new_tag.clear()
        self.refresh()
        if self.on_dirty_cb:
            self.on_dirty_cb()

    def _del_tag(self):
        cur = self.list_tags.currentItem()
        if not cur or not self.item_id:
            return
        tag_id = cur.data(Qt.ItemDataRole.UserRole)
        with self.db.get_connection():
            self.db.execute(
                "DELETE FROM item_tags WHERE item_type = ? AND item_id = ? AND tag_id = ?",
                (self.section_id, self.item_id, tag_id)
            )
        self.refresh()
        if self.on_dirty_cb:
            self.on_dirty_cb()

    def _add_link(self):
        if not self.item_id:
            QMessageBox.information(self, "Notice", "Please save the item first before linking items.")
            return

        dlg = LinkPickerDialog(self.registry, self.section_id, self.item_id, self)
        if dlg.exec() and dlg.selected_target:
            target_sec, target_id, title = dlg.selected_target
            with self.db.get_connection():
                try:
                    self.db.execute("""
                        INSERT INTO links (source_type, source_id, target_type, target_id, relationship)
                        VALUES (?, ?, ?, ?, ?)
                    """, (self.section_id, self.item_id, target_sec, target_id, "related"))
                except Exception:
                    pass
            self.refresh()

    def _del_link(self):
        cur = self.list_links.currentItem()
        if not cur:
            return
        link_id, _, _ = cur.data(Qt.ItemDataRole.UserRole)
        with self.db.get_connection():
            self.db.execute("DELETE FROM links WHERE id = ?", (link_id,))
        self.refresh()

    def _open_linked_item(self, item: QListWidgetItem):
        data = item.data(Qt.ItemDataRole.UserRole)
        if not data:
            return
        _, sec_id, other_id = data
        window = self.window()
        if hasattr(window, "tab_manager"):
            from app.core.tab_manager import TabKind
            window.tab_manager.open_tab(sec_id, TabKind.VIEW, item_id=other_id)

    def _add_reminder(self):
        if not self.item_id:
            QMessageBox.information(self, "Notice", "Please save the item first before adding reminders.")
            return
        
        dlg = AddReminderDialog(f"{self.section_id} #{self.item_id}", parent=self)
        if dlg.exec():
            msg, remind_at = dlg.get_reminder_data()
            if msg:
                with self.db.get_connection():
                    self.db.execute(
                        "INSERT INTO reminders (item_type, item_id, title, remind_at) VALUES (?, ?, ?, ?)",
                        (self.section_id, self.item_id, msg, remind_at)
                    )
                self.refresh()

    def _del_reminder(self):
        cur = self.list_rem.currentItem()
        if not cur:
            return
        rem_id = cur.data(Qt.ItemDataRole.UserRole)
        with self.db.get_connection():
            self.db.execute("UPDATE reminders SET is_dismissed = 1 WHERE id = ?", (rem_id,))
        self.refresh()
