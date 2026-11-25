"""Comprehensive Settings Tab View for ADIOS with Custom Icon Customization.

Settings:
- General & Localization (Currency mode, Date format, Data folder)
- Tabs & Workspace Behavior (Tab duplication policy, Startup behavior)
- Reminders & Storage (Default lead time, Max backups retained)
- Custom Vector Icons & Themes (Upload custom SVGs/images for sections, subscription providers, clubs, tools)
"""
from __future__ import annotations
from typing import Any
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QFormLayout, QLineEdit, QSpinBox, QComboBox, 
    QCheckBox, QPushButton, QMessageBox, QHBoxLayout, QGroupBox, QTabWidget
)
from app.ui.widgets.icon_customizer import IconCustomizerWidget
from app.core.icons import WinIcons
from app.core.theme_manager import THEME_NAMES, ThemeManager


class GeneralSettingsWidget(QWidget):
    """General preferences sub-view."""
    def __init__(self, db: Any, parent=None):
        super().__init__(parent)
        self.db = db

        layout = QVBoxLayout(self)
        layout.setContentsMargins(15, 15, 15, 15)

        # 1. Appearance & Theme Group
        grp_theme = QGroupBox("Appearance & Theme")
        f_theme = QFormLayout(grp_theme)

        self.combo_theme = QComboBox()
        self.combo_theme.addItems(THEME_NAMES)
        self.combo_theme.currentTextChanged.connect(self._on_theme_changed)
        f_theme.addRow("Theme:", self.combo_theme)
        layout.addWidget(grp_theme)

        # 2. General & Localization Group
        grp_gen = QGroupBox("General & Localization")
        f_gen = QFormLayout(grp_gen)

        self.combo_currency = QComboBox()
        self.combo_currency.addItems(["INR (Rs.)", "USD ($)", "EUR (Euro)", "GBP (Pound)", "CAD ($)", "AUD ($)"])
        f_gen.addRow("Currency Mode:", self.combo_currency)

        self.combo_date_format = QComboBox()
        self.combo_date_format.addItems(["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"])
        f_gen.addRow("Date Format:", self.combo_date_format)

        self.input_data_folder = QLineEdit()
        f_gen.addRow("Data Folder:", self.input_data_folder)
        layout.addWidget(grp_gen)

        # 2. Workspace & Tab Behavior Group
        grp_tabs = QGroupBox("Tabs & Workspace Behavior")
        f_tabs = QFormLayout(grp_tabs)

        self.chk_allow_duplicate_tabs = QCheckBox("Allow opening duplicate tabs for the same item")
        f_tabs.addRow("Tab Duplication:", self.chk_allow_duplicate_tabs)

        self.combo_startup = QComboBox()
        self.combo_startup.addItems(["Restore Open Tabs", "Open Home Tab Only"])
        f_tabs.addRow("Startup Behavior:", self.combo_startup)
        layout.addWidget(grp_tabs)

        # 3. Reminders & Backups Group
        grp_rem = QGroupBox("Reminders & Storage")
        f_rem = QFormLayout(grp_rem)

        self.combo_default_reminder = QComboBox()
        self.combo_default_reminder.addItems([
            "10 minutes before",
            "15 minutes before",
            "30 minutes before",
            "1 hour before",
            "1 day before",
            "None"
        ])
        f_rem.addRow("Default Reminder Lead Time:", self.combo_default_reminder)

        self.spin_backup_count = QSpinBox()
        self.spin_backup_count.setRange(1, 100)
        self.spin_backup_count.setValue(10)
        f_rem.addRow("Max Backups Retained:", self.spin_backup_count)
        layout.addWidget(grp_rem)

        # Save Button
        btn_box = QHBoxLayout()
        self.btn_save = QPushButton("Save Preferences")
        self.btn_save.setIcon(WinIcons.get("save"))
        self.btn_save.setFixedWidth(160)
        btn_box.addWidget(self.btn_save)
        btn_box.addStretch()
        layout.addLayout(btn_box)

        layout.addStretch()

        self.btn_save.clicked.connect(self.save_settings)
        self.load_settings()

    def _on_theme_changed(self, theme_text: str):
        ThemeManager.apply_theme(theme_text)

    def load_settings(self):
        # Theme
        theme = self.db.get_setting("theme_mode", "Light Mode")
        idx_t = self.combo_theme.findText(theme)
        if idx_t != -1:
            self.combo_theme.setCurrentIndex(idx_t)

        # Currency
        curr = self.db.get_setting("currency_mode", "INR (Rs.)")
        idx_c = self.combo_currency.findText(curr)
        if idx_c != -1:
            self.combo_currency.setCurrentIndex(idx_c)

        # Date Format
        d_fmt = self.db.get_setting("date_format", "YYYY-MM-DD")
        idx_d = self.combo_date_format.findText(d_fmt)
        if idx_d != -1:
            self.combo_date_format.setCurrentIndex(idx_d)

        # Data Folder
        folder = self.db.get_setting("data_folder", self.db.db_path)
        self.input_data_folder.setText(folder)

        # Tab duplicates
        dup = self.db.get_setting("allow_duplicate_tabs", "0")
        self.chk_allow_duplicate_tabs.setChecked(dup == "1")

        # Startup
        startup = self.db.get_setting("startup_behavior", "Restore Open Tabs")
        idx_st = self.combo_startup.findText(startup)
        if idx_st != -1:
            self.combo_startup.setCurrentIndex(idx_st)

        # Reminder lead time
        rem = self.db.get_setting("default_reminder_lead", "15 minutes before")
        idx_r = self.combo_default_reminder.findText(rem)
        if idx_r != -1:
            self.combo_default_reminder.setCurrentIndex(idx_r)

        # Backup count
        count = int(self.db.get_setting("backup_count", "10"))
        self.spin_backup_count.setValue(count)

    def save_settings(self):
        theme_val = self.combo_theme.currentText()
        self.db.set_setting("theme_mode", theme_val)
        ThemeManager.apply_theme(theme_val)

        self.db.set_setting("currency_mode", self.combo_currency.currentText())
        self.db.set_setting("date_format", self.combo_date_format.currentText())
        self.db.set_setting("data_folder", self.input_data_folder.text().strip())
        self.db.set_setting("allow_duplicate_tabs", "1" if self.chk_allow_duplicate_tabs.isChecked() else "0")
        self.db.set_setting("startup_behavior", self.combo_startup.currentText())
        self.db.set_setting("default_reminder_lead", self.combo_default_reminder.currentText())
        self.db.set_setting("backup_count", str(self.spin_backup_count.value()))

        QMessageBox.information(self, "Settings Saved", "Preferences have been successfully saved.")


class SettingsView(QWidget):
    """Main Settings workspace tab containing Preferences and Custom Icon Customizer."""

    def __init__(self, db: Any, tab_manager: Any, parent=None):
        super().__init__(parent)
        self.db = db
        self.tab_manager = tab_manager

        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)

        # Tab widget separating Preferences from Icon Customization
        self.tabs = QTabWidget(self)
        self.general_widget = GeneralSettingsWidget(db, self)
        self.icon_widget = IconCustomizerWidget(db, tab_manager, self)

        self.tabs.addTab(self.general_widget, WinIcons.get("settings"), "General Preferences")
        self.tabs.addTab(self.icon_widget, WinIcons.get("tag"), "Custom Icons & Themes")

        layout.addWidget(self.tabs)

    def select_icons_tab(self):
        """Helper to navigate directly to the Custom Icons tab."""
        self.tabs.setCurrentIndex(1)
