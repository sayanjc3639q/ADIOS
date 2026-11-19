"""Icon Customizer Widget & Dialog for ADIOS.

Allows users to:
- View all section icons, subscription provider icons, club icons, and in-app tools
- Preview the crisp SVG icon currently applied
- Browse and upload custom SVG or image files (SVG, PNG, ICO, JPEG)
- ADD NEW ENTRIES for all categories (Sections, Subscription Providers, Clubs & Societies)
  allowing arbitrary custom provider or club mappings with uploaded SVG/image icons!
- Delete custom-added entries
- Reset any built-in icon back to the built-in SVG vector default
- Changes are persisted immediately to SQLite settings as 'icon_custom_<key>' and 'custom_icon_entries'
- Real-time refresh across the application.
"""
from __future__ import annotations
import os
import json
from typing import Any, List, Tuple
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableWidget, QTableWidgetItem, QFileDialog, QMessageBox, 
    QHeaderView, QTabWidget, QGroupBox, QDialog, QFormLayout, QLineEdit
)
from PySide6.QtGui import QIcon
from PySide6.QtCore import Qt, QSize
from app.core.svg_icons import SvgIconPack, CUSTOMIZABLE_ICONS
from app.core.icons import WinIcons


class AddNewIconEntryDialog(QDialog):
    """Dialog allowing the user to create a new customizable icon entry."""

    def __init__(self, category: str, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"Add New {category} Entry")
        self.setFixedWidth(420)
        self.category = category

        layout = QVBoxLayout(self)
        form = QFormLayout()

        # Prompt hint
        hint = QLabel(f"Create a custom icon mapping for <b>{category}</b>.<br>Provide a unique key/identifier and display label.")
        hint.setWordWrap(True)
        layout.addWidget(hint)

        self.txt_key = QLineEdit()
        default_prefix = ""
        if category == "Subscription Providers":
            default_prefix = "provider_"
            self.txt_key.setPlaceholderText("e.g. hulu, prime, notion, coursera")
        elif category == "Clubs & Societies":
            default_prefix = "club_"
            self.txt_key.setPlaceholderText("e.g. photography, astronomy, chess")
        else:
            self.txt_key.setPlaceholderText("e.g. custom_section_key")

        self.txt_label = QLineEdit()
        self.txt_label.setPlaceholderText("e.g. Hulu Streaming, Chess Club")

        self.txt_icon_path = QLineEdit()
        self.txt_icon_path.setPlaceholderText("Browse SVG or image file...")
        btn_browse = QPushButton("Browse...")
        btn_browse.clicked.connect(self._browse_file)
        
        path_box = QHBoxLayout()
        path_box.addWidget(self.txt_icon_path)
        path_box.addWidget(btn_browse)

        form.addRow("Identifier / Key:", self.txt_key)
        form.addRow("Display Name:", self.txt_label)
        form.addRow("Icon File (SVG/Image):", path_box)
        layout.addLayout(form)

        # Buttons
        btn_box = QHBoxLayout()
        self.btn_ok = QPushButton("Add Entry")
        self.btn_ok.setIcon(WinIcons.get("save"))
        self.btn_ok.clicked.connect(self._on_accept)
        self.btn_cancel = QPushButton("Cancel")
        self.btn_cancel.clicked.connect(self.reject)

        btn_box.addStretch()
        btn_box.addWidget(self.btn_ok)
        btn_box.addWidget(self.btn_cancel)
        layout.addLayout(btn_box)

    def _browse_file(self):
        f, _ = QFileDialog.getOpenFileName(
            self,
            "Select SVG or Image File",
            "",
            "Scalable Vector Graphics (*.svg);;Images (*.png *.ico *.jpg *.jpeg *.bmp);;All Files (*.*)"
        )
        if f:
            self.txt_icon_path.setText(f)

    def _on_accept(self):
        raw_key = self.txt_key.text().strip().lower().replace(" ", "_")
        label = self.txt_label.text().strip()
        icon_path = self.txt_icon_path.text().strip()

        if not raw_key:
            QMessageBox.warning(self, "Missing Key", "Please provide a key/identifier for this entry.")
            return

        if not label:
            label = raw_key.replace("_", " ").title()

        # Enforce prefix if appropriate
        if self.category == "Subscription Providers" and not raw_key.startswith("provider_"):
            key = f"provider_{raw_key}"
        elif self.category == "Clubs & Societies" and not raw_key.startswith("club_"):
            key = f"club_{raw_key}"
        else:
            key = raw_key

        self.result_entry = {
            "key": key,
            "label": label,
            "category": self.category,
            "icon_path": icon_path
        }
        self.accept()


class IconCustomizerWidget(QWidget):
    """Tab widget embedded in Settings allowing complete custom SVG/image mapping & additions."""

    def __init__(self, db: Any, tab_manager: Any = None, parent=None):
        super().__init__(parent)
        self.db = db
        self.tab_manager = tab_manager

        layout = QVBoxLayout(self)
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Header note
        info_box = QGroupBox("Custom Vector Icons & Themes")
        info_layout = QVBoxLayout(info_box)
        info_lbl = QLabel(
            "Customize and add new vector icons for application sections, subscription providers (Netflix, Spotify, GitHub, Hulu, Notion, etc.), "
            "clubs, and in-app tools. You can add new entries and upload custom .svg, .png, or .ico files to personalize your workspace.\n"
            "All default icons are crisp vector SVGs."
        )
        info_lbl.setWordWrap(True)
        info_layout.addWidget(info_lbl)
        layout.addWidget(info_box)

        # Category Filter Tabs
        self.tabs = QTabWidget(self)
        layout.addWidget(self.tabs, stretch=1)

        # Create Category Pages
        self.categories = ["Sections", "Subscription Providers", "Clubs & Societies", "In-App Tools"]
        self.tables: dict[str, QTableWidget] = {}

        for cat in self.categories:
            cat_page = QWidget()
            page_layout = QVBoxLayout(cat_page)
            page_layout.setContentsMargins(0, 8, 0, 0)
            page_layout.setSpacing(6)

            # Top toolbar for this category (with "Add New Entry" button except for In-App Tools)
            if cat != "In-App Tools":
                cat_bar = QHBoxLayout()
                btn_add = QPushButton(f"+ Add New {cat.rstrip('s')}...")
                btn_add.setIcon(WinIcons.get("new"))
                btn_add.setFixedWidth(200)
                btn_add.clicked.connect(lambda checked=False, c=cat: self._on_add_new_entry(c))
                cat_bar.addWidget(btn_add)
                cat_bar.addStretch()
                page_layout.addLayout(cat_bar)

            table = QTableWidget()
            table.setColumnCount(4)
            table.setHorizontalHeaderLabels(["Icon Preview", "Key", "Display Name", "Actions"])
            table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
            table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
            table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
            table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
            table.verticalHeader().setVisible(False)
            table.setIconSize(QSize(28, 28))
            self.tables[cat] = table
            page_layout.addWidget(table)

            self.tabs.addTab(cat_page, cat)

        # Action bar at bottom
        btn_bar = QHBoxLayout()
        self.btn_reset_all = QPushButton("Reset Built-in Icons to Vector Defaults")
        self.btn_reset_all.clicked.connect(self._reset_all_to_default)
        btn_bar.addWidget(self.btn_reset_all)
        btn_bar.addStretch()

        self.btn_refresh = QPushButton("Refresh Icons")
        self.btn_refresh.setIcon(WinIcons.get("refresh"))
        self.btn_refresh.clicked.connect(self.populate_all)
        btn_bar.addWidget(self.btn_refresh)
        layout.addLayout(btn_bar)

        self.populate_all()

    def _get_user_added_entries(self) -> List[dict]:
        """Fetch user-added entries from database settings."""
        raw = self.db.get_setting("custom_icon_entries", "[]")
        try:
            return json.loads(raw)
        except Exception:
            return []

    def _save_user_added_entries(self, entries: List[dict]):
        self.db.set_setting("custom_icon_entries", json.dumps(entries))

    def _on_add_new_entry(self, category: str):
        dlg = AddNewIconEntryDialog(category, self)
        if dlg.exec():
            res = dlg.result_entry
            key = res["key"]
            label = res["label"]
            cat = res["category"]
            path = res.get("icon_path", "")

            # Save to user-added entries list
            entries = self._get_user_added_entries()
            # Remove any existing entry with same key
            entries = [e for e in entries if e.get("key") != key]
            entries.append({"key": key, "label": label, "category": cat})
            self._save_user_added_entries(entries)

            if path and os.path.exists(path):
                self.db.set_setting(f"icon_custom_{key.lower()}", path)

            SvgIconPack.clear_cache()
            self.populate_all()

            # Refresh left toolbar if appropriate
            if self.tab_manager and hasattr(self.tab_manager, "main_window"):
                mw = self.tab_manager.main_window
                if hasattr(mw, "rebuild_left_toolbar"):
                    mw.rebuild_left_toolbar()

            QMessageBox.information(self, "Entry Added", f"New entry '{label}' ({key}) added successfully!")

    def _delete_user_entry(self, key: str):
        confirm = QMessageBox.question(
            self,
            "Delete Entry",
            f"Are you sure you want to delete custom entry '{key}'?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if confirm == QMessageBox.StandardButton.Yes:
            entries = self._get_user_added_entries()
            entries = [e for e in entries if e.get("key") != key]
            self._save_user_added_entries(entries)
            self.db.set_setting(f"icon_custom_{key.lower()}", "")
            SvgIconPack.clear_cache()
            self.populate_all()

    def populate_all(self):
        """Populate table rows for each category, including built-in and user-added entries."""
        for cat, table in self.tables.items():
            table.setRowCount(0)

        # Merge built-in customizable icons with user-added entries
        all_icons: List[Tuple[str, str, str, bool]] = []
        for k, l, c in CUSTOMIZABLE_ICONS:
            all_icons.append((k, l, c, False)) # False = built-in

        user_entries = self._get_user_added_entries()
        for u in user_entries:
            all_icons.append((u["key"], u["label"], u["category"], True)) # True = user-added

        for key, label, category, is_user_added in all_icons:
            table = self.tables.get(category)
            if not table:
                continue

            row = table.rowCount()
            table.insertRow(row)
            table.setRowHeight(row, 40)

            # Column 0: Icon Preview
            icon = SvgIconPack.get(key, size=28)
            preview_item = QTableWidgetItem(icon, "")
            preview_item.setTextAlignment(Qt.AlignmentFlag.AlignCenter)
            preview_item.setFlags(preview_item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            table.setItem(row, 0, preview_item)

            # Column 1: Key
            key_item = QTableWidgetItem(key)
            key_item.setFlags(key_item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            table.setItem(row, 1, key_item)

            # Column 2: Display Label
            custom_path = self.db.get_setting(f"icon_custom_{key}", "")
            suffix = ""
            if custom_path:
                suffix = f" [Custom: {os.path.basename(custom_path)}]"
            if is_user_added:
                suffix += " (User Added)"
            label_item = QTableWidgetItem(f"{label}{suffix}")
            label_item.setFlags(label_item.flags() & ~Qt.ItemFlag.ItemIsEditable)
            table.setItem(row, 2, label_item)

            # Column 3: Actions
            action_widget = QWidget()
            action_layout = QHBoxLayout(action_widget)
            action_layout.setContentsMargins(4, 2, 4, 2)
            action_layout.setSpacing(6)

            btn_browse = QPushButton("Upload SVG/Image...")
            btn_browse.setFixedHeight(26)
            btn_browse.clicked.connect(lambda checked=False, k=key: self._browse_custom_icon(k))
            action_layout.addWidget(btn_browse)

            if is_user_added:
                btn_del = QPushButton("Delete Entry")
                btn_del.setFixedHeight(26)
                btn_del.clicked.connect(lambda checked=False, k=key: self._delete_user_entry(k))
                action_layout.addWidget(btn_del)
            elif custom_path:
                btn_reset = QPushButton("Reset")
                btn_reset.setFixedHeight(26)
                btn_reset.clicked.connect(lambda checked=False, k=key: self._reset_icon(k))
                action_layout.addWidget(btn_reset)

            table.setCellWidget(row, 3, action_widget)

    def _browse_custom_icon(self, key: str):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            f"Select Custom Icon for '{key}'",
            "",
            "Scalable Vector Graphics (*.svg);;Images (*.png *.ico *.jpg *.jpeg *.bmp);;All Files (*.*)"
        )
        if not file_path:
            return

        self.db.set_setting(f"icon_custom_{key.lower()}", file_path)
        SvgIconPack.clear_cache()
        self.populate_all()

        if self.tab_manager and hasattr(self.tab_manager, "main_window"):
            mw = self.tab_manager.main_window
            if hasattr(mw, "rebuild_left_toolbar"):
                mw.rebuild_left_toolbar()

        QMessageBox.information(self, "Icon Updated", f"Custom icon for '{key}' updated successfully.")

    def _reset_icon(self, key: str):
        self.db.set_setting(f"icon_custom_{key.lower()}", "")
        SvgIconPack.clear_cache()
        self.populate_all()

        if self.tab_manager and hasattr(self.tab_manager, "main_window"):
            mw = self.tab_manager.main_window
            if hasattr(mw, "rebuild_left_toolbar"):
                mw.rebuild_left_toolbar()

        QMessageBox.information(self, "Icon Reset", f"Icon for '{key}' reset to vector SVG default.")

    def _reset_all_to_default(self):
        confirm = QMessageBox.question(
            self,
            "Reset All Icons",
            "Are you sure you want to reset all built-in icons to default vector SVGs?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if confirm == QMessageBox.StandardButton.Yes:
            for key, _, _ in CUSTOMIZABLE_ICONS:
                self.db.set_setting(f"icon_custom_{key.lower()}", "")
            SvgIconPack.clear_cache()
            self.populate_all()

            if self.tab_manager and hasattr(self.tab_manager, "main_window"):
                mw = self.tab_manager.main_window
                if hasattr(mw, "rebuild_left_toolbar"):
                    mw.rebuild_left_toolbar()

            QMessageBox.information(self, "Icons Reset", "All built-in icons have been reset to vector SVG defaults.")
