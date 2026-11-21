"""Central action registry and menu builder for ADIOS."""
from __future__ import annotations
from typing import TYPE_CHECKING, Dict, Any, List
from PySide6.QtGui import QAction, QKeySequence
from PySide6.QtWidgets import (
    QMainWindow, QMenuBar, QMenu, QToolBar, QStatusBar, QLineEdit, QPushButton, QWidget, QHBoxLayout, QMessageBox, QFileDialog
)
from app.core.tab_manager import TabKind
from app.core.icons import WinIcons
from app.ui.dialogs import NewItemChooserDialog, QuickOpenDialog, DashboardWidgetsDialog

if TYPE_CHECKING:
    from app.core.main_window import MainWindow

class ActionManager:
    """Manages actions, shortcuts, and menubar/toolbar wiring."""

    def __init__(self, main_window: MainWindow):
        self.mw = main_window
        self.actions: Dict[str, QAction] = {}

    def setup_actions(self) -> None:
        mw = self.mw

        # FILE
        self.actions["file_new"] = QAction(WinIcons.get("new"), "&New...", mw)
        self.actions["file_new"].setShortcut(QKeySequence("Ctrl+N"))
        self.actions["file_new"].triggered.connect(self._on_file_new)

        self.actions["file_open"] = QAction(WinIcons.get("open"), "&Open Item...", mw)
        self.actions["file_open"].setShortcut(QKeySequence("Ctrl+O"))
        self.actions["file_open"].triggered.connect(self._on_file_open)

        self.actions["file_save"] = QAction(WinIcons.get("save"), "&Save", mw)
        self.actions["file_save"].setShortcut(QKeySequence("Ctrl+S"))
        self.actions["file_save"].triggered.connect(self._on_file_save)

        self.actions["file_save_all"] = QAction(WinIcons.get("save_all"), "Save &All", mw)
        self.actions["file_save_all"].setShortcut(QKeySequence("Ctrl+Shift+S"))
        self.actions["file_save_all"].triggered.connect(self._on_file_save_all)

        self.actions["file_close_tab"] = QAction(WinIcons.get("close"), "&Close Tab", mw)
        self.actions["file_close_tab"].setShortcut(QKeySequence("Ctrl+W"))
        self.actions["file_close_tab"].triggered.connect(self._on_file_close_tab)

        self.actions["file_close_all"] = QAction(WinIcons.get("close"), "Close All Tabs", mw)
        self.actions["file_close_all"].triggered.connect(self._on_file_close_all)

        self.actions["file_backup"] = QAction(WinIcons.get("backup"), "&Backup Now", mw)
        self.actions["file_backup"].triggered.connect(self._on_file_backup)

        self.actions["file_restore"] = QAction(WinIcons.get("restore"), "&Restore from Backup...", mw)
        self.actions["file_restore"].triggered.connect(self._on_file_restore)

        self.actions["file_print"] = QAction(WinIcons.get("clock"), "&Print / Export Report...", mw)
        self.actions["file_print"].setShortcut(QKeySequence("Ctrl+P"))
        self.actions["file_print"].triggered.connect(self._on_file_print)

        self.actions["file_exit"] = QAction("E&xit", mw)
        self.actions["file_exit"].triggered.connect(mw.close)

        # EDIT
        self.actions["edit_undo"] = QAction("&Undo", mw)
        self.actions["edit_undo"].setShortcut(QKeySequence.StandardKey.Undo)
        self.actions["edit_redo"] = QAction("&Redo", mw)
        self.actions["edit_redo"].setShortcut(QKeySequence.StandardKey.Redo)
        self.actions["edit_cut"] = QAction("Cu&t", mw)
        self.actions["edit_cut"].setShortcut(QKeySequence.StandardKey.Cut)
        self.actions["edit_copy"] = QAction("&Copy", mw)
        self.actions["edit_copy"].setShortcut(QKeySequence.StandardKey.Copy)
        self.actions["edit_paste"] = QAction("&Paste", mw)
        self.actions["edit_paste"].setShortcut(QKeySequence.StandardKey.Paste)
        self.actions["edit_select_all"] = QAction("Select &All", mw)
        self.actions["edit_select_all"].setShortcut(QKeySequence.StandardKey.SelectAll)
        
        self.actions["edit_find"] = QAction("&Find in This Tab", mw)
        self.actions["edit_find"].setShortcut(QKeySequence("Ctrl+F"))
        self.actions["edit_find"].triggered.connect(self._on_edit_find)

        self.actions["edit_duplicate"] = QAction("&Duplicate Item", mw)
        self.actions["edit_duplicate"].setShortcut(QKeySequence("Ctrl+D"))

        self.actions["edit_archive"] = QAction("&Archive Item", mw)
        self.actions["edit_delete"] = QAction("&Delete Item", mw)
        self.actions["edit_delete"].setShortcut(QKeySequence.StandardKey.Delete)
        self.actions["edit_delete"].triggered.connect(self._on_edit_delete)

        self.actions["edit_add_tag"] = QAction("Add &Tag...", mw)
        self.actions["edit_add_reminder"] = QAction("Add &Reminder...", mw)

        # VIEW
        self.actions["view_toolbar"] = QAction("&Toolbar", mw, checkable=True)
        self.actions["view_toolbar"].setChecked(True)
        self.actions["view_toolbar"].triggered.connect(lambda checked: mw.left_toolbar.setVisible(checked))

        self.actions["view_dashboard"] = QAction("&Dashboard", mw, checkable=True)
        self.actions["view_dashboard"].setChecked(True)
        self.actions["view_dashboard"].triggered.connect(lambda checked: mw.dashboard_dock.setVisible(checked))

        self.actions["view_statusbar"] = QAction("&Status Bar", mw, checkable=True)
        self.actions["view_statusbar"].setChecked(True)
        self.actions["view_statusbar"].triggered.connect(lambda checked: mw.statusBar().setVisible(checked))

        self.actions["view_dash_widgets"] = QAction("Dashboard &Widgets...", mw)
        self.actions["view_dash_widgets"].triggered.connect(self._on_view_dash_widgets)

        self.actions["view_show_archived"] = QAction("Show &Archived", mw, checkable=True)
        self.actions["view_fullscreen"] = QAction("&Full Screen", mw)
        self.actions["view_fullscreen"].setShortcut(QKeySequence("F11"))
        self.actions["view_fullscreen"].triggered.connect(self._toggle_fullscreen)

        # WINDOW
        self.actions["win_next_tab"] = QAction("&Next Tab", mw)
        self.actions["win_next_tab"].setShortcut(QKeySequence("Ctrl+Tab"))
        self.actions["win_next_tab"].triggered.connect(self._on_next_tab)

        self.actions["win_prev_tab"] = QAction("&Previous Tab", mw)
        self.actions["win_prev_tab"].setShortcut(QKeySequence("Ctrl+Shift+Tab"))
        self.actions["win_prev_tab"].triggered.connect(self._on_prev_tab)

        self.actions["win_pin_tab"] = QAction(WinIcons.get("pin"), "&Pin/Unpin Tab", mw)
        self.actions["win_pin_tab"].setShortcut(QKeySequence("Ctrl+Shift+P"))
        self.actions["win_pin_tab"].triggered.connect(self._on_pin_tab)

        self.actions["win_close_others"] = QAction("Close &Other Tabs", mw)
        self.actions["win_close_others"].triggered.connect(lambda: mw.tab_manager.close_other_tabs())

        self.actions["win_reset_size"] = QAction("&Reset Window Size", mw)
        self.actions["win_reset_size"].triggered.connect(lambda: mw.resize(1100, 750))

        self.actions["tools_calendar"] = QAction(WinIcons.get("calendar"), "&Calendar Dock Window", mw)
        self.actions["tools_calendar"].triggered.connect(mw.toggle_calendar_dock)

        self.actions["tools_pomodoro"] = QAction(WinIcons.get("pomodoro"), "&Pomodoro Timer", mw)
        self.actions["tools_pomodoro"].triggered.connect(mw.toggle_pomodoro_dock)

        self.actions["tools_quick_notes"] = QAction(WinIcons.get("new"), "&Quick Notes", mw)
        self.actions["tools_quick_notes"].triggered.connect(mw.open_quick_notes)

        # HELP
        self.actions["help_shortcuts"] = QAction(WinIcons.get("help"), "&Keyboard Shortcuts", mw)
        self.actions["help_shortcuts"].triggered.connect(self._show_shortcuts)

        self.actions["help_guide"] = QAction(WinIcons.get("info"), "&User Guide", mw)
        self.actions["help_guide"].triggered.connect(lambda: QMessageBox.information(mw, "User Guide", "ADIOS: Personal Desktop Management System.\n\nUse the Left Toolbar or GO menu to switch sections."))

        self.actions["help_release_notes"] = QAction(WinIcons.get("study"), "&Release Notes", mw)
        self.actions["help_release_notes"].triggered.connect(lambda: mw.tab_manager.open_tab("system", TabKind.RELEASE_NOTES))

        self.actions["help_check_updates"] = QAction(WinIcons.get("refresh"), "&Check for Updates...", mw)
        self.actions["help_check_updates"].triggered.connect(mw.manual_check_updates)

        self.actions["help_logs"] = QAction(WinIcons.get("folder"), "View &Log File", mw)
        self.actions["help_logs"].triggered.connect(self._show_logs)

        self.actions["help_about"] = QAction(WinIcons.get("shield"), "&About ADIOS", mw)
        self.actions["help_about"].triggered.connect(self._show_about)

    def build_menus(self, menu_bar: QMenuBar) -> None:
        mw = self.mw

        # FILE
        menu_file = menu_bar.addMenu("&File")
        menu_file.addAction(self.actions["file_new"])
        menu_file.addAction(self.actions["file_open"])
        
        # Recent submenu
        self.menu_recent = menu_file.addMenu("Open &Recent")
        self.menu_recent.addAction("No recent items").setEnabled(False)

        menu_file.addSeparator()
        menu_file.addAction(self.actions["file_save"])
        menu_file.addAction(self.actions["file_save_all"])
        menu_file.addSeparator()
        menu_file.addAction(self.actions["file_close_tab"])
        menu_file.addAction(self.actions["file_close_all"])
        menu_file.addSeparator()
        
        menu_import = menu_file.addMenu("&Import")
        menu_import.addAction("CSV...").triggered.connect(lambda: QMessageBox.information(mw, "Import", "CSV Import ready."))
        menu_import.addAction("JSON...").triggered.connect(lambda: QMessageBox.information(mw, "Import", "JSON Import ready."))
        menu_import.addAction("Bank Statement CSV...").triggered.connect(lambda: QMessageBox.information(mw, "Import", "Bank Statement Import ready."))

        menu_export = menu_file.addMenu("&Export")
        menu_export.addAction("Current List CSV...").triggered.connect(lambda: QMessageBox.information(mw, "Export", "List CSV Export ready."))
        menu_export.addAction("Everything JSON...").triggered.connect(lambda: QMessageBox.information(mw, "Export", "Everything JSON Export ready."))
        menu_export.addAction("Report PDF...").triggered.connect(lambda: QMessageBox.information(mw, "Export", "Report PDF Export ready."))

        menu_file.addSeparator()
        menu_file.addAction(self.actions["file_backup"])
        menu_file.addAction(self.actions["file_restore"])
        menu_file.addSeparator()
        menu_file.addAction(self.actions["file_print"])
        menu_file.addSeparator()
        menu_file.addAction(self.actions["file_exit"])

        # EDIT
        menu_edit = menu_bar.addMenu("&Edit")
        menu_edit.addAction(self.actions["edit_undo"])
        menu_edit.addAction(self.actions["edit_redo"])
        menu_edit.addSeparator()
        menu_edit.addAction(self.actions["edit_cut"])
        menu_edit.addAction(self.actions["edit_copy"])
        menu_edit.addAction(self.actions["edit_paste"])
        menu_edit.addAction(self.actions["edit_select_all"])
        menu_edit.addSeparator()
        menu_edit.addAction(self.actions["edit_find"])
        menu_edit.addAction(self.actions["edit_duplicate"])
        menu_edit.addAction(self.actions["edit_archive"])
        menu_edit.addAction(self.actions["edit_delete"])
        menu_edit.addSeparator()
        menu_edit.addAction(self.actions["edit_add_tag"])
        menu_edit.addAction(self.actions["edit_add_reminder"])

        # CREATE (Generated from section registry)
        self.menu_create = menu_bar.addMenu("&Create")
        self.rebuild_create_menu()

        # VIEW
        menu_view = menu_bar.addMenu("&View")
        menu_view.addAction(self.actions["view_toolbar"])
        menu_view.addAction(self.actions["view_dashboard"])
        menu_view.addAction(self.actions["view_statusbar"])
        menu_view.addSeparator()
        menu_view.addAction(self.actions["view_dash_widgets"])
        menu_view.addSeparator()
        menu_layout = menu_view.addMenu("&Layout")
        menu_layout.addAction("Save Layout").triggered.connect(lambda: QMessageBox.information(mw, "Layout", "Layout saved."))
        menu_layout.addAction("Load Layout").triggered.connect(lambda: QMessageBox.information(mw, "Layout", "Layout loaded."))
        menu_layout.addAction("Reset Layout").triggered.connect(lambda: QMessageBox.information(mw, "Layout", "Layout reset to defaults."))
        menu_view.addAction(self.actions["view_show_archived"])
        menu_view.addSeparator()
        menu_view.addAction("Font Size +").triggered.connect(lambda: self._adjust_font(1))
        menu_view.addAction("Font Size -").triggered.connect(lambda: self._adjust_font(-1))
        menu_view.addAction(self.actions["view_fullscreen"])

        # GO (Generated from section registry)
        self.menu_go = menu_bar.addMenu("&Go")
        self.rebuild_go_menu()

        # TOOLS
        menu_tools = menu_bar.addMenu("&Tools")
        menu_tools.addAction(self.actions["tools_calendar"])
        menu_tools.addAction(self.actions["tools_pomodoro"])
        menu_tools.addAction(self.actions["tools_quick_notes"])
        menu_tools.addSeparator()
        menu_reports = menu_tools.addMenu("&Reports")
        menu_reports.addAction("Monthly Spending")
        menu_reports.addAction("Subscription Costs")
        menu_reports.addAction("Study Hours")
        menu_reports.addAction("Skill Progress")
        menu_tools.addSeparator()
        menu_tools.addAction("&Reminders Manager").triggered.connect(lambda: QMessageBox.information(mw, "Reminders", "Reminders manager."))
        menu_tools.addAction("&Tags Manager").triggered.connect(lambda: QMessageBox.information(mw, "Tags", "Tags manager."))
        menu_tools.addAction("&Backup Manager").triggered.connect(self._on_file_backup)
        menu_tools.addAction("&Database Check/Compact").triggered.connect(self._on_compact_db)
        menu_tools.addAction("&Open Data Folder").triggered.connect(self._open_data_folder)

        # WINDOW
        self.menu_window = menu_bar.addMenu("&Window")
        self.rebuild_window_menu()

        # HELP
        menu_help = menu_bar.addMenu("&Help")
        menu_help.addAction(self.actions["help_shortcuts"])
        menu_help.addAction(self.actions["help_guide"])
        menu_help.addAction(self.actions["help_release_notes"])
        menu_help.addAction(self.actions["help_check_updates"])
        menu_help.addAction(self.actions["help_logs"])
        menu_help.addSeparator()
        menu_help.addAction(self.actions["help_about"])

        # RIGHT END of MenuBar (Search box, Settings button, Profile icon button)
        self.right_corner_widget = QWidget(menu_bar)
        corner_layout = QHBoxLayout(self.right_corner_widget)
        corner_layout.setContentsMargins(0, 1, 6, 1)
        corner_layout.setSpacing(6)

        self.corner_search = QLineEdit(self.right_corner_widget)
        self.corner_search.setPlaceholderText("Search...")
        self.corner_search.setFixedWidth(140)
        self.corner_search.setFixedHeight(24)
        self.corner_search.returnPressed.connect(self._on_corner_search)

        self.btn_settings = QPushButton(" Settings", self.right_corner_widget)
        self.btn_settings.setIcon(WinIcons.get("settings"))
        self.btn_settings.setFixedHeight(24)
        self.btn_settings.clicked.connect(lambda: mw.tab_manager.open_tab("system", TabKind.SETTINGS))

        self.btn_profile = QPushButton(" Offline (Sign In) [v]", self.right_corner_widget)
        self.btn_profile.setIcon(WinIcons.get("user"))
        self.btn_profile.setToolTip("Offline Mode - Click to Sign In & Sync")
        self.btn_profile.setFixedHeight(24)
        profile_menu = QMenu(self.btn_profile)
        profile_menu.addAction("Sign In to Sync...").triggered.connect(lambda: QMessageBox.information(mw, "Account Sync", "Cloud sync sign-in. Currently operating in Offline mode."))
        profile_menu.addAction("Profile Details...").triggered.connect(lambda: QMessageBox.information(mw, "Profile", "Local Offline User Profile."))
        profile_menu.addAction("Change Data File...").triggered.connect(self._on_file_restore)
        profile_menu.addAction("Lock App").triggered.connect(lambda: QMessageBox.information(mw, "Lock", "Application locked."))
        profile_menu.addSeparator()
        profile_menu.addAction("Exit").triggered.connect(mw.close)
        self.btn_profile.setMenu(profile_menu)

        # UPDATE BUTTON IN TOP RIGHT CORNER (Only visible when update available)
        self.btn_update = QPushButton("⚡ Install Update", self.right_corner_widget)
        self.btn_update.setStyleSheet("""
            QPushButton {
                background-color: #16a34a;
                color: #ffffff;
                font-weight: 700;
                font-size: 11.5px;
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid #15803d;
            }
            QPushButton:hover {
                background-color: #15803d;
            }
        """)
        self.btn_update.setFixedHeight(24)
        self.btn_update.setVisible(False)
        self.btn_update.clicked.connect(mw.open_update_dialog)

        corner_layout.addWidget(self.btn_update)
        corner_layout.addWidget(self.corner_search)
        corner_layout.addWidget(self.btn_settings)
        corner_layout.addWidget(self.btn_profile)

        menu_bar.setCornerWidget(self.right_corner_widget)

    def rebuild_create_menu(self) -> None:
        self.menu_create.clear()
        sections = self.mw.registry.all_sections()
        for sec in sections:
            act = self.menu_create.addAction(WinIcons.get(sec.id), sec.name)
            act.triggered.connect(lambda checked=False, s=sec: self.mw.tab_manager.open_tab(s.id, TabKind.CREATE))
        
        self.menu_create.addSeparator()
        self.menu_create.addAction(WinIcons.get("new"), "Quick Note").triggered.connect(self.mw.open_quick_notes)
        self.menu_create.addAction(WinIcons.get("clock"), "Reminder").triggered.connect(lambda: QMessageBox.information(self.mw, "Reminder", "New reminder dialog."))
        self.menu_create.addAction(WinIcons.get("tag"), "Tag").triggered.connect(lambda: QMessageBox.information(self.mw, "Tag", "New tag dialog."))

    def rebuild_go_menu(self) -> None:
        self.menu_go.clear()
        # Home (Alt+0)
        act_home = self.menu_go.addAction(WinIcons.get("home"), "&Home")
        act_home.setShortcut(QKeySequence("Alt+0"))
        act_home.triggered.connect(lambda: self.mw.tab_manager.open_tab("system", TabKind.HOME))
        self.menu_go.addSeparator()

        sections = self.mw.registry.all_sections()
        for i, sec in enumerate(sections, start=1):
            sc = f"Alt+{i}" if i <= 9 else (f"Alt+Shift+{i-9}" if i <= 18 else "")
            act = self.menu_go.addAction(WinIcons.get(sec.id), f"&{sec.name}")
            if sc:
                act.setShortcut(QKeySequence(sc))
            act.triggered.connect(lambda checked=False, s=sec: self.mw.tab_manager.open_tab(s.id, TabKind.LIST))

    def rebuild_window_menu(self) -> None:
        self.menu_window.clear()
        self.menu_window.addAction(self.actions["win_next_tab"])
        self.menu_window.addAction(self.actions["win_prev_tab"])
        self.menu_window.addAction(self.actions["win_pin_tab"])
        self.menu_window.addAction(self.actions["win_close_others"])
        self.menu_window.addAction(self.actions["win_reset_size"])
        self.menu_window.addSeparator()

        # Numbered list of open tabs
        count = self.mw.tab_manager.tab_widget.count()
        curr = self.mw.tab_manager.tab_widget.currentIndex()
        for i in range(count):
            title = self.mw.tab_manager.tab_widget.tabText(i)
            act = self.menu_window.addAction(f"&{i+1}. {title}")
            act.setCheckable(True)
            act.setChecked(i == curr)
            act.triggered.connect(lambda checked=False, idx=i: self.mw.tab_manager.tab_widget.setCurrentIndex(idx))

    def update_action_states(self) -> None:
        """Enable/disable actions based on active tab."""
        meta = self.mw.tab_manager.get_current_meta()
        if not meta:
            self.actions["file_save"].setEnabled(False)
            self.actions["file_close_tab"].setEnabled(False)
            self.actions["edit_delete"].setEnabled(False)
            return

        self.actions["file_close_tab"].setEnabled(True)
        kind = meta.get("kind")
        if kind in (TabKind.EDITOR, TabKind.CREATE):
            self.actions["file_save"].setEnabled(True)
            self.actions["edit_delete"].setEnabled(kind == TabKind.EDITOR)
        else:
            self.actions["file_save"].setEnabled(False)
            self.actions["edit_delete"].setEnabled(False)

        self.rebuild_window_menu()

    # Action implementations
    def _on_file_new(self) -> None:
        dlg = NewItemChooserDialog(self.mw.registry.all_sections(), self.mw)
        if dlg.exec():
            sec_id = dlg.selected_section_id
            if sec_id:
                self.mw.tab_manager.open_tab(sec_id, TabKind.LIST)

    def _on_file_open(self) -> None:
        dlg = QuickOpenDialog(self.mw.registry, self.mw)
        if dlg.exec() and dlg.selected_item:
            sec_id, item_id = dlg.selected_item
            self.mw.tab_manager.open_tab(sec_id, TabKind.EDITOR, item_id=item_id)

    def _on_file_save(self) -> None:
        widget = self.mw.tab_manager.tab_widget.currentWidget()
        if widget and hasattr(widget, "save_item"):
            widget.save_item()

    def _on_file_save_all(self) -> None:
        for i in range(self.mw.tab_manager.tab_widget.count()):
            widget = self.mw.tab_manager.tab_widget.widget(i)
            if widget and hasattr(widget, "save_item"):
                widget.save_item()

    def _on_file_close_tab(self) -> None:
        idx = self.mw.tab_manager.tab_widget.currentIndex()
        if idx != -1:
            self.mw.tab_manager.close_tab_by_index(idx)

    def _on_file_close_all(self) -> None:
        self.mw.tab_manager.close_all_tabs(force=False)

    def _on_file_print(self) -> None:
        from app.ui.widgets.print_report_dialog import PrintReportDialog
        # Determine currently open section if any
        current_meta = self.mw.tab_manager.get_current_meta()
        sec_id = current_meta.get("section_id") if current_meta else None
        dlg = PrintReportDialog(self.mw.db, self.mw.registry, current_section_id=sec_id, parent=self.mw)
        dlg.exec()

    def _on_file_backup(self) -> None:
        from app.core.backup import BackupManager
        bm = BackupManager(self.mw.db)
        dest = bm.create_backup()
        QMessageBox.information(self.mw, "Backup Complete", f"Database backup created:\n{dest}")

    def _on_file_restore(self) -> None:
        path, _ = QFileDialog.getOpenFileName(self.mw, "Select Backup File to Restore", "", "Database Files (*.db *.bak);;All Files (*)")
        if path:
            from app.core.backup import BackupManager
            bm = BackupManager(self.mw.db)
            if bm.restore_backup(path):
                QMessageBox.information(self.mw, "Restore Complete", "Database restored successfully. Please restart the application.")

    def _on_corner_search(self) -> None:
        query = self.corner_search.text().strip()
        if query:
            self.mw.tab_manager.open_tab("system", TabKind.SEARCH, query=query)

    def _on_edit_find(self) -> None:
        self.corner_search.setFocus()
        self.corner_search.selectAll()

    def _on_edit_delete(self) -> None:
        widget = self.mw.tab_manager.tab_widget.currentWidget()
        if widget and hasattr(widget, "_on_delete"):
            widget._on_delete()

    def _toggle_fullscreen(self) -> None:
        if self.mw.isFullScreen():
            self.mw.showNormal()
        else:
            self.mw.showFullScreen()

    def _adjust_font(self, delta: int) -> None:
        font = self.mw.font()
        font.setPointSize(max(8, font.pointSize() + delta))
        self.mw.setFont(font)

    def _on_next_tab(self) -> None:
        count = self.mw.tab_manager.tab_widget.count()
        if count > 1:
            curr = self.mw.tab_manager.tab_widget.currentIndex()
            self.mw.tab_manager.tab_widget.setCurrentIndex((curr + 1) % count)

    def _on_prev_tab(self) -> None:
        count = self.mw.tab_manager.tab_widget.count()
        if count > 1:
            curr = self.mw.tab_manager.tab_widget.currentIndex()
            self.mw.tab_manager.tab_widget.setCurrentIndex((curr - 1 + count) % count)

    def _on_pin_tab(self) -> None:
        widget = self.mw.tab_manager.tab_widget.currentWidget()
        if widget:
            meta = self.mw.tab_manager.get_tab_meta(widget)
            if meta:
                is_pinned = not meta.get("is_pinned", False)
                self.mw.tab_manager.set_tab_pinned(widget, is_pinned)

    def _on_view_dash_widgets(self) -> None:
        widgets = self.mw.get_all_dashboard_widgets()
        dlg = DashboardWidgetsDialog(widgets, self.mw.active_dash_widget_ids, self.mw)
        if dlg.exec():
            self.mw.active_dash_widget_ids = dlg.selected_ids
            self.mw.rebuild_dashboard()

    def _on_compact_db(self) -> None:
        self.mw.db.compact()
        QMessageBox.information(self.mw, "Database Compact", "Database check and compact completed successfully.")

    def _show_about(self) -> None:
        from app.version import APP_VERSION
        QMessageBox.about(
            self.mw,
            "About ADIOS",
            f"<b>ADIOS — Personal Desktop Management</b><br>"
            f"Version: <b>v{APP_VERSION}</b><br><br>"
            f"Clean, lightweight desktop manager for Windows.<br>"
            f"Built with Python & PySide6 (Qt) • 100% Offline-First.<br><br>"
            f"GitHub: <a href='https://github.com/sayanjc3639q/ADIOS'>sayanjc3639q/ADIOS</a>"
        )

    def _open_data_folder(self) -> None:
        import os, subprocess
        data_dir = os.path.dirname(os.path.abspath(self.mw.db.db_path))
        os.startfile(data_dir)

    def _show_shortcuts(self) -> None:
        msg = (
            "<b>Keyboard Shortcuts:</b><br><br>"
            "Ctrl+N: New Item Chooser<br>"
            "Ctrl+O: Open Item Finder<br>"
            "Ctrl+S: Save Active Tab<br>"
            "Ctrl+Shift+S: Save All<br>"
            "Ctrl+W: Close Tab<br>"
            "Ctrl+Tab: Next Tab<br>"
            "Ctrl+Shift+Tab: Previous Tab<br>"
            "Ctrl+F: Find / Search<br>"
            "Alt+0: Home Tab<br>"
            "Alt+1..9: Go to Section List<br>"
            "F11: Full Screen Toggle<br>"
        )
        QMessageBox.information(self.mw, "Keyboard Shortcuts", msg)

    def _show_logs(self) -> None:
        import os
        log_file = os.path.join(os.path.dirname(self.mw.db.db_path), "adios.log")
        if os.path.exists(log_file):
            os.startfile(log_file)
        else:
            QMessageBox.information(self.mw, "Log File", "Log file does not exist yet.")
