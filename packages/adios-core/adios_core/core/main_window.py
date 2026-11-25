"""Main window implementation for ADIOS."""
from __future__ import annotations
import os
import json
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging

from PySide6.QtWidgets import (
    QMainWindow, QTabWidget, QToolBar, QDockWidget, QStatusBar, QLabel,
    QWidget, QVBoxLayout, QMenu, QMessageBox, QScrollArea, QFrame
)
from PySide6.QtCore import Qt, QPoint, QDate
from PySide6.QtGui import QAction, QIcon, QKeySequence

from app.core.db import DatabaseManager
from app.core.registry import SectionRegistry
from app.core.tab_manager import TabManager, TabKind
from app.core.actions import ActionManager
from app.core.backup import BackupManager
from app.core.reminders import ReminderSystem
from app.core.icons import WinIcons

logger = logging.getLogger("adios.main_window")

class MainWindow(QMainWindow):
    """
    Main Application Window with 5 primary regions:
    1. Menu Bar (top) with search, settings, profile dropdown
    2. Left ToolBar (vertical, toggleable)
    3. Central Tab Widget (QTabWidget workspace)
    4. Right Dashboard (QDockWidget, floatable/resizable)
    5. Status Bar (bottom)
    """

    def __init__(self, db_path: Optional[str] = None):
        super().__init__()
        self.setWindowTitle("ADIOS - Personal Desktop Manager")
        self.resize(1150, 750)

        # 1. Initialize DB and Core Services
        self.db = DatabaseManager(db_path)
        self.registry = SectionRegistry(self.db)
        self.backup_mgr = BackupManager(self.db)

        # Dashboard widgets tracking
        self.active_dash_widget_ids: List[str] = [
            "linkedin_summary", 
            "upcoming_exams", 
            "schedule_today", 
            "money_monthly_summary", 
            "sub_renewals",
            "club_tasks_due"
        ]

        # 2. Setup Central Workspace (Region 3)
        self.tab_widget = QTabWidget(self)
        self.setCentralWidget(self.tab_widget)
        self.tab_manager = TabManager(self.tab_widget, self.registry, self)

        # 3. Setup Actions and Menus (Region 1)
        self.action_manager = ActionManager(self)
        self.action_manager.setup_actions()
        self.action_manager.build_menus(self.menuBar())

        # 4. Setup Left Toolbar (Region 2)
        self.setup_left_toolbar()

        # Setup Right Docks (Dashboard, Calendar, Pomodoro)
        self.setDockOptions(QMainWindow.DockOption.AnimatedDocks | QMainWindow.DockOption.AllowTabbedDocks)
        self.setTabPosition(Qt.DockWidgetArea.RightDockWidgetArea, QTabWidget.TabPosition.East)

        # 5. Setup Right Docks
        self.setup_right_docks()

        # 6. Setup Status Bar (Region 5)
        self.setup_status_bar()

        # 7. Wire Tab Signals
        self.tab_widget.customContextMenuRequested.connect(self._show_tab_context_menu)
        self.tab_manager.tab_changed.connect(self._on_tab_changed)
        self.tab_manager.tab_closed.connect(self._on_tab_closed)

        # 8. Start Background Services
        self.reminders = ReminderSystem(self)
        self.reminders.start()

        # Update info storage
        self.latest_update_info: Optional[Dict[str, str]] = None
        self._start_update_check()

        # 9. Restore Tabs or open Home
        self.restore_startup_state()

    def setup_left_toolbar(self) -> None:
        self.left_toolbar = QToolBar("Sections", self)
        self.left_toolbar.setOrientation(Qt.Orientation.Vertical)
        self.left_toolbar.setMovable(False)
        self.left_toolbar.setFloatable(False)
        self.left_toolbar.setIconSize(self.left_toolbar.iconSize().scaled(20, 20, Qt.AspectRatioMode.KeepAspectRatio))
        self.left_toolbar.setToolButtonStyle(Qt.ToolButtonStyle.ToolButtonTextBesideIcon)
        # Ensure buttons and icons are cleanly left-aligned with consistent indent
        self.left_toolbar.setStyleSheet("""
            QToolBar {
                spacing: 4px;
                padding: 4px;
            }
            QToolButton {
                text-align: left;
                padding-left: 6px;
                padding-right: 8px;
                padding-top: 4px;
                padding-bottom: 4px;
                min-width: 130px;
            }
        """)
        self.addToolBar(Qt.ToolBarArea.LeftToolBarArea, self.left_toolbar)
        self.rebuild_left_toolbar()

    def rebuild_left_toolbar(self) -> None:
        self.left_toolbar.clear()
        
        # Home action
        act_home = QAction(WinIcons.get("home"), "Home", self)
        act_home.triggered.connect(lambda: self.tab_manager.open_tab("system", TabKind.HOME))
        self.left_toolbar.addAction(act_home)
        self.left_toolbar.addSeparator()

        for sec in self.registry.all_sections():
            act = QAction(WinIcons.get(sec.id), sec.name, self)
            act.setToolTip(f"Open {sec.name} ({sec.shortcut})")
            act.triggered.connect(lambda checked=False, s=sec: self.tab_manager.open_tab(s.id, TabKind.LIST))
            self.left_toolbar.addAction(act)

    def setup_right_docks(self) -> None:
        from app.ui.widgets.calendar_dock import CalendarDockWidget
        from app.ui.widgets.pomodoro_dock import PomodoroWidget

        # 1. Main Dashboard Dock
        self.dashboard_dock = QDockWidget("Dashboard", self)
        self.dashboard_dock.setObjectName("DashboardDock")
        self.dashboard_dock.setAllowedAreas(Qt.DockWidgetArea.LeftDockWidgetArea | Qt.DockWidgetArea.RightDockWidgetArea)
        self.dashboard_dock.setFeatures(
            QDockWidget.DockWidgetFeature.DockWidgetMovable |
            QDockWidget.DockWidgetFeature.DockWidgetFloatable |
            QDockWidget.DockWidgetFeature.DockWidgetClosable
        )
        self.dashboard_scroll = QScrollArea()
        self.dashboard_scroll.setWidgetResizable(True)
        self.dashboard_container = QWidget()
        self.dashboard_layout = QVBoxLayout(self.dashboard_container)
        self.dashboard_layout.setAlignment(Qt.AlignmentFlag.AlignTop)
        self.dashboard_scroll.setWidget(self.dashboard_container)
        self.dashboard_dock.setWidget(self.dashboard_scroll)
        self.addDockWidget(Qt.DockWidgetArea.RightDockWidgetArea, self.dashboard_dock)

        # 2. Calendar Dock Window
        self.calendar_dock = QDockWidget("Calendar", self)
        self.calendar_dock.setObjectName("CalendarDock")
        self.calendar_dock.setAllowedAreas(Qt.DockWidgetArea.LeftDockWidgetArea | Qt.DockWidgetArea.RightDockWidgetArea)
        self.calendar_dock.setFeatures(
            QDockWidget.DockWidgetFeature.DockWidgetMovable |
            QDockWidget.DockWidgetFeature.DockWidgetFloatable |
            QDockWidget.DockWidgetFeature.DockWidgetClosable
        )
        self.calendar_widget = CalendarDockWidget(self.registry, self.db, self)
        self.calendar_dock.setWidget(self.calendar_widget)
        self.addDockWidget(Qt.DockWidgetArea.RightDockWidgetArea, self.calendar_dock)

        # 3. Pomodoro Dock Window
        self.pomodoro_dock = QDockWidget("Pomodoro Timer", self)
        self.pomodoro_dock.setObjectName("PomodoroDock")
        self.pomodoro_dock.setAllowedAreas(Qt.DockWidgetArea.LeftDockWidgetArea | Qt.DockWidgetArea.RightDockWidgetArea)
        self.pomodoro_dock.setFeatures(
            QDockWidget.DockWidgetFeature.DockWidgetMovable |
            QDockWidget.DockWidgetFeature.DockWidgetFloatable |
            QDockWidget.DockWidgetFeature.DockWidgetClosable
        )
        self.pomodoro_widget = PomodoroWidget(self)
        self.pomodoro_dock.setWidget(self.pomodoro_widget)
        self.addDockWidget(Qt.DockWidgetArea.RightDockWidgetArea, self.pomodoro_dock)

        # By default tab calendar and pomodoro with dashboard (like Adobe Illustrator right panel tabs)
        self.tabifyDockWidget(self.dashboard_dock, self.calendar_dock)
        self.tabifyDockWidget(self.calendar_dock, self.pomodoro_dock)
        self.dashboard_dock.raise_()

        self.rebuild_dashboard()

    def toggle_calendar_dock(self):
        if self.calendar_dock.isVisible():
            self.calendar_dock.hide()
        else:
            self.calendar_dock.show()
            self.calendar_dock.raise_()

    def toggle_pomodoro_dock(self):
        if self.pomodoro_dock.isVisible():
            self.pomodoro_dock.hide()
        else:
            self.pomodoro_dock.show()
            self.pomodoro_dock.raise_()

    def open_quick_notes(self):
        from app.ui.widgets.quick_notes import QuickNotesDialog
        dlg = QuickNotesDialog(self.db, self)
        dlg.exec()

    def get_all_dashboard_widgets(self) -> List[Dict[str, Any]]:
        all_widgets = []
        for sec in self.registry.all_sections():
            try:
                all_widgets.extend(sec.dashboard_widgets())
            except Exception as e:
                logger.error("Error loading widgets from %s: %s", sec.id, e)
        return all_widgets

    def rebuild_dashboard(self) -> None:
        # Clear existing widgets
        while self.dashboard_layout.count():
            item = self.dashboard_layout.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        all_widgets = {w["id"]: w for w in self.get_all_dashboard_widgets()}
        
        for wid in self.active_dash_widget_ids:
            if wid in all_widgets:
                try:
                    w = all_widgets[wid]["widget_factory"]()
                    # Wrap in frame
                    frame = QFrame()
                    frame.setFrameShape(QFrame.Shape.StyledPanel)
                    f_layout = QVBoxLayout(frame)
                    f_layout.setContentsMargins(4, 4, 4, 4)
                    
                    lbl_title = QLabel(f"<b>{all_widgets[wid]['name']}</b>")
                    f_layout.addWidget(lbl_title)
                    f_layout.addWidget(w)
                    self.dashboard_layout.addWidget(frame)
                except Exception as e:
                    logger.error("Failed to build dashboard widget %s: %s", wid, e)

        self.dashboard_layout.addStretch()

    def setup_status_bar(self) -> None:
        sb = self.statusBar()
        
        # Left: active tab info
        self.status_tab_info = QLabel("Ready")
        sb.addWidget(self.status_tab_info, 1)

        # Middle: today's date
        today_str = datetime.now().strftime("%A, %B %d, %Y")
        self.status_date = QLabel(today_str)
        sb.addPermanentWidget(self.status_date)

        # Right: upcoming reminder
        self.status_reminder = QLabel("Next Reminder: None")
        sb.addPermanentWidget(self.status_reminder)

        self.update_status_bar()

    def update_status_bar(self) -> None:
        meta = self.tab_manager.get_current_meta()
        if meta:
            kind = meta.get("kind")
            sec_id = meta.get("section_id")
            self.status_tab_info.setText(f"Active: [{kind}] {sec_id}")
        else:
            self.status_tab_info.setText("No open tabs")

        # Query next reminder
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        row = self.db.fetchone(
            "SELECT title, remind_at FROM reminders WHERE is_dismissed = 0 AND remind_at >= ? ORDER BY remind_at ASC LIMIT 1",
            (now_str,)
        )
        if row:
            self.status_reminder.setText(f"Next Reminder: {row['title']} ({row['remind_at']})")
        else:
            self.status_reminder.setText("Next Reminder: None")

    def _show_tab_context_menu(self, pos: QPoint) -> None:
        tab_idx = self.tab_widget.tabBar().tabAt(pos)
        if tab_idx == -1:
            return

        menu = QMenu(self)
        act_close = menu.addAction(WinIcons.get("delete"), "Close Tab")
        act_close_others = menu.addAction("Close Other Tabs")
        
        # Check current pinned state
        target_widget = self.tab_widget.widget(tab_idx)
        target_meta = self.tab_manager.get_tab_meta(target_widget) if target_widget else None
        is_pinned = target_meta.get("is_pinned", False) if target_meta else False
        act_pin = menu.addAction(WinIcons.get("pin"), "Unpin Tab" if is_pinned else "Pin Tab")
        act_duplicate = menu.addAction("Duplicate Tab")

        chosen = menu.exec(self.tab_widget.mapToGlobal(pos))
        if chosen == act_close:
            self.tab_manager.close_tab_by_index(tab_idx)
        elif chosen == act_close_others:
            self.tab_manager.close_other_tabs()
        elif chosen == act_pin:
            widget = self.tab_widget.widget(tab_idx)
            meta = self.tab_manager.get_tab_meta(widget)
            if meta:
                self.tab_manager.set_tab_pinned(widget, not meta.get("is_pinned", False))
        elif chosen == act_duplicate:
            widget = self.tab_widget.widget(tab_idx)
            meta = self.tab_manager.get_tab_meta(widget)
            if meta:
                self.tab_manager.open_tab(meta["section_id"], meta["kind"], meta.get("item_id"))

    def _on_tab_changed(self, index: int) -> None:
        self.action_manager.update_action_states()
        self.update_status_bar()

    def _on_tab_closed(self, section_id: str, kind: str, item_id: Optional[int]) -> None:
        self.action_manager.update_action_states()
        self.update_status_bar()

    def restore_startup_state(self) -> None:
        from app.version import APP_VERSION
        last_seen_ver = self.db.get_setting("last_seen_version", "")
        is_first_run_of_version = (last_seen_ver != APP_VERSION)

        behavior = self.db.get_setting("startup_behavior", "Restore Open Tabs")
        if behavior == "Restore Open Tabs":
            saved_tabs_json = self.db.get_setting("open_tabs_state", "[]")
            try:
                tabs_data = json.loads(saved_tabs_json)
                if tabs_data:
                    for t in tabs_data:
                        try:
                            kind = TabKind(t["kind"])
                            self.tab_manager.open_tab(t["section_id"], kind, t.get("item_id"))
                        except Exception:
                            pass
            except Exception:
                pass

        # If freshly updated or installed, open the Release Notes tab automatically
        if is_first_run_of_version:
            self.tab_manager.open_tab("system", TabKind.RELEASE_NOTES)
            self.db.set_setting("last_seen_version", APP_VERSION)

        if self.tab_widget.count() == 0:
            self.tab_manager.open_tab("system", TabKind.HOME)

    def save_state(self) -> None:
        """Persist open tabs and active tab on exit."""
        tabs_state = []
        for i in range(self.tab_widget.count()):
            widget = self.tab_widget.widget(i)
            meta = self.tab_manager.get_tab_meta(widget)
            if meta:
                tabs_state.append({
                    "section_id": meta["section_id"],
                    "kind": str(meta["kind"]),
                    "item_id": meta.get("item_id")
                })
        self.db.set_setting("open_tabs_state", json.dumps(tabs_state))

    def closeEvent(self, event) -> None:
        # Prompt for unsaved changes across all tabs
        for i in range(self.tab_widget.count() - 1, -1, -1):
            widget = self.tab_widget.widget(i)
            meta = self.tab_manager.get_tab_meta(widget)
            if meta and meta.get("is_dirty", False):
                self.tab_widget.setCurrentIndex(i)
                reply = QMessageBox.question(
                    self,
                    "Unsaved Changes",
                    f"The tab '{meta.get('title')}' has unsaved changes. Do you want to save before closing?",
                    QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel,
                    QMessageBox.StandardButton.Save
                )
                if reply == QMessageBox.StandardButton.Save:
                    if hasattr(widget, "save_item"):
                        if not widget.save_item():
                            event.ignore()
                            return
                elif reply == QMessageBox.StandardButton.Cancel:
                    event.ignore()
                    return

        # Save open tabs
        self.save_state()

        # Auto backup database on exit
        try:
            self.backup_mgr.create_backup()
        except Exception as e:
            logger.error("Auto backup on exit failed: %s", e)

        self.db.close()
        event.accept()

    def _start_update_check(self) -> None:
        """Starts background GitHub release check without stalling startup."""
        from app.core.updater import CheckUpdateThread
        self.update_thread = CheckUpdateThread(self)
        self.update_thread.update_available.connect(self._on_update_available)
        self.update_thread.start()

    def _on_update_available(self, version: str, download_url: str, release_notes: str) -> None:
        self.latest_update_info = {
            "version": version,
            "download_url": download_url,
            "release_notes": release_notes
        }
        # Reveal prominent Install Update button in top-right corner of menubar
        if hasattr(self, "action_manager") and hasattr(self.action_manager, "btn_update"):
            self.action_manager.btn_update.setText(f"⚡ Update v{version}")
            self.action_manager.btn_update.setVisible(True)

    def manual_check_updates(self) -> None:
        """Called by Help -> Check for Updates."""
        from app.version import APP_VERSION
        from app.core.updater import CheckUpdateThread

        self.status_tab_info.setText("Checking GitHub for updates...")
        thread = CheckUpdateThread(self)

        def on_avail(version, url, notes):
            self._on_update_available(version, url, notes)
            self.open_update_dialog()

        def on_none():
            QMessageBox.information(
                self,
                "Check for Updates",
                f"You are running the latest version of ADIOS (v{APP_VERSION})."
            )

        def on_fail(err):
            QMessageBox.warning(
                self,
                "Check for Updates",
                f"Could not reach update server. You may be offline or rate-limited.\n\nError: {err}"
            )

        thread.update_available.connect(on_avail)
        thread.no_update.connect(on_none)
        thread.check_failed.connect(on_fail)
        thread.start()
        self._manual_thread = thread

    def open_update_dialog(self) -> None:
        """Opens dialog to download update and restart."""
        if not self.latest_update_info:
            self.manual_check_updates()
            return

        from app.core.updater import UpdateDialog
        dlg = UpdateDialog(
            version=self.latest_update_info["version"],
            download_url=self.latest_update_info["download_url"],
            release_notes=self.latest_update_info["release_notes"],
            parent=self
        )
        dlg.exec()
