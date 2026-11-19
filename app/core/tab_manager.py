"""TabManager for ADIOS application."""
from __future__ import annotations
from enum import Enum
from typing import Optional, Dict, Tuple, Any, List
import logging
from PySide6.QtWidgets import QTabWidget, QWidget, QMessageBox
from PySide6.QtCore import Qt, Signal, QObject

logger = logging.getLogger("adios.tab_manager")

class TabKind(str, Enum):
    HOME = "HOME"
    LIST = "LIST"
    EDITOR = "EDITOR"
    CREATE = "CREATE"
    SEARCH = "SEARCH"
    SETTINGS = "SETTINGS"
    TOOLS = "TOOLS"

class TabManager(QObject):
    """
    Manages tabs in the central QTabWidget.
    Tracks tab kind, section_id, item_id, dirty state, and pinning.
    """
    tab_changed = Signal(int)
    tab_closed = Signal(str, str, object) # section_id, kind, item_id (object for Optional[int])

    def __init__(self, tab_widget: QTabWidget, registry: Any, main_window: Any):
        super().__init__()
        self.tab_widget = tab_widget
        self.registry = registry
        self.main_window = main_window

        # Map widget -> meta info dict
        self._tabs_meta: Dict[QWidget, Dict[str, Any]] = {}
        # Setup tab widget properties
        self.tab_widget.setTabsClosable(True)
        self.tab_widget.setMovable(True)
        self.tab_widget.setDocumentMode(True)
        self.tab_widget.setIconSize(self.tab_widget.iconSize().scaled(16, 16, Qt.AspectRatioMode.KeepAspectRatio))
        self.tab_widget.setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)
        
        self.tab_widget.tabCloseRequested.connect(self.close_tab_by_index)
        self.tab_widget.currentChanged.connect(self._on_current_changed)

    def _on_current_changed(self, index: int) -> None:
        self.tab_changed.emit(index)

    def get_tab_meta(self, widget: QWidget) -> Optional[Dict[str, Any]]:
        return self._tabs_meta.get(widget)

    def get_current_meta(self) -> Optional[Dict[str, Any]]:
        widget = self.tab_widget.currentWidget()
        if widget:
            return self._tabs_meta.get(widget)
        return None

    def find_open_tab_index(self, section_id: str, kind: TabKind, item_id: Optional[int] = None) -> int:
        for idx in range(self.tab_widget.count()):
            widget = self.tab_widget.widget(idx)
            meta = self._tabs_meta.get(widget)
            if meta:
                if meta["section_id"] == section_id and meta["kind"] == kind and meta["item_id"] == item_id:
                    return idx
        return -1

    def open_tab(self, section_id: str, kind: TabKind, item_id: Optional[int] = None, **kwargs) -> QWidget:
        """
        Open or focus a tab.
        If identical (section_id, kind, item_id) is already open, focus it.
        """
        # Check duplicate tab setting
        allow_dup = self.registry.db.get_setting("allow_duplicate_tabs", "0") == "1"
        if not allow_dup:
            existing_idx = self.find_open_tab_index(section_id, kind, item_id)
            if existing_idx != -1:
                self.tab_widget.setCurrentIndex(existing_idx)
                return self.tab_widget.widget(existing_idx)

        # Create new tab content
        widget = self._create_tab_widget(section_id, kind, item_id, **kwargs)
        title = self._generate_title(section_id, kind, item_id, widget)

        from app.core.icons import WinIcons
        icon = WinIcons.get(section_id)
        index = self.tab_widget.addTab(widget, icon, title)
        self._tabs_meta[widget] = {
            "section_id": section_id,
            "kind": kind,
            "item_id": item_id,
            "is_dirty": False,
            "is_pinned": False,
            "title": title,
            "kwargs": kwargs
        }

        self.tab_widget.setCurrentIndex(index)
        return widget

    def _create_tab_widget(self, section_id: str, kind: TabKind, item_id: Optional[int] = None, **kwargs) -> QWidget:
        if kind == TabKind.HOME:
            from app.ui.widgets.home_view import HomeView
            return HomeView(self.registry, self)
        
        if kind == TabKind.SEARCH:
            from app.ui.widgets.search_view import SearchView
            query = kwargs.get("query", "")
            return SearchView(self.registry, self, query=query)

        if kind == TabKind.SETTINGS:
            from app.ui.widgets.settings_view import SettingsView
            return SettingsView(self.registry.db, self)

        section = self.registry.get(section_id)
        if not section:
            from PySide6.QtWidgets import QLabel
            return QLabel(f"Section '{section_id}' not found.")

        if kind == TabKind.LIST:
            return section.list_view(parent=self.tab_widget)
        elif kind == TabKind.EDITOR:
            if item_id is None:
                raise ValueError("item_id required for EDITOR tab")
            return section.editor_view(item_id, parent=self.tab_widget)
        elif kind == TabKind.CREATE:
            return section.create_view(parent=self.tab_widget)
        
        from PySide6.QtWidgets import QLabel
        return QLabel(f"Unknown tab type: {kind}")

    def _generate_title(self, section_id: str, kind: TabKind, item_id: Optional[int], widget: QWidget) -> str:
        if kind == TabKind.HOME:
            return "Home"
        if kind == TabKind.SEARCH:
            return "Search Results"
        if kind == TabKind.SETTINGS:
            return "Settings"

        section = self.registry.get(section_id)
        sec_name = section.name if section else section_id

        if kind == TabKind.LIST:
            return sec_name
        elif kind == TabKind.CREATE:
            return f"{sec_name} Create"
        elif kind == TabKind.EDITOR:
            # Check if widget has an item_title property or title
            title_prop = getattr(widget, "item_title", None)
            if title_prop:
                return f"{sec_name}: {title_prop}"
            return f"{sec_name}: #{item_id}"
        
        return f"{sec_name}"

    def set_tab_dirty(self, widget: QWidget, is_dirty: bool) -> None:
        meta = self._tabs_meta.get(widget)
        if not meta or meta["is_dirty"] == is_dirty:
            return
        meta["is_dirty"] = is_dirty
        idx = self.tab_widget.indexOf(widget)
        if idx != -1:
            base_title = meta["title"]
            new_title = f"{base_title} *" if is_dirty else base_title
            self.tab_widget.setTabText(idx, new_title)

    def set_tab_pinned(self, widget: QWidget, is_pinned: bool) -> None:
        meta = self._tabs_meta.get(widget)
        if not meta:
            return
        meta["is_pinned"] = is_pinned
        # In classic Windows style, pinned can be indicated in tab text or disabled close button
        idx = self.tab_widget.indexOf(widget)
        if idx != -1:
            base_title = meta["title"]
            prefix = "[P] " if is_pinned else ""
            self.tab_widget.setTabText(idx, f"{prefix}{base_title}")

    def convert_create_to_editor(self, widget: QWidget, item_id: int, new_title: Optional[str] = None) -> None:
        """Convert a CREATE tab into an EDITOR tab for the newly saved item."""
        meta = self._tabs_meta.get(widget)
        if not meta:
            return
        sec_name = self.registry.get(meta["section_id"]).name
        meta["kind"] = TabKind.EDITOR
        meta["item_id"] = item_id
        meta["is_dirty"] = False
        display_title = f"{sec_name}: {new_title}" if new_title else f"{sec_name}: #{item_id}"
        meta["title"] = display_title
        
        idx = self.tab_widget.indexOf(widget)
        if idx != -1:
            self.tab_widget.setTabText(idx, display_title)

        # Refresh any open LIST tab for this section
        self.refresh_list_tabs(meta["section_id"])

    def refresh_list_tabs(self, section_id: str) -> None:
        """Find any open list tabs for section_id and call refresh()."""
        for widget, meta in self._tabs_meta.items():
            if meta["section_id"] == section_id and meta["kind"] == TabKind.LIST:
                if hasattr(widget, "refresh"):
                    widget.refresh()

    def close_editor_for_item(self, section_id: str, item_id: int) -> None:
        """Close editor tab for a deleted item."""
        idx = self.find_open_tab_index(section_id, TabKind.EDITOR, item_id)
        if idx != -1:
            widget = self.tab_widget.widget(idx)
            # Remove dirty flag so it doesn't prompt
            if widget in self._tabs_meta:
                self._tabs_meta[widget]["is_dirty"] = False
            self.close_tab_by_index(idx)
        self.refresh_list_tabs(section_id)

    def close_tab_by_index(self, index: int) -> bool:
        widget = self.tab_widget.widget(index)
        if not widget:
            return False
        meta = self._tabs_meta.get(widget)
        if meta and meta.get("is_dirty", False):
            # Prompt user
            reply = QMessageBox.question(
                self.tab_widget,
                "Unsaved Changes",
                f"The tab '{meta.get('title')}' has unsaved changes. Do you want to save before closing?",
                QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel,
                QMessageBox.StandardButton.Save
            )
            if reply == QMessageBox.StandardButton.Save:
                if hasattr(widget, "save_item"):
                    success = widget.save_item()
                    if not success:
                        return False
                else:
                    return False
            elif reply == QMessageBox.StandardButton.Cancel:
                return False

        sec_id = meta["section_id"] if meta else ""
        kind = meta["kind"] if meta else ""
        item_id = meta.get("item_id") if meta else None

        self.tab_widget.removeTab(index)
        if widget in self._tabs_meta:
            del self._tabs_meta[widget]
        widget.deleteLater()

        self.tab_closed.emit(sec_id, str(kind), item_id)
        return True

    def close_all_tabs(self, force: bool = False) -> None:
        """Close all tabs except pinned ones (unless force=True)."""
        idx = self.tab_widget.count() - 1
        while idx >= 0:
            widget = self.tab_widget.widget(idx)
            meta = self._tabs_meta.get(widget)
            if not force and meta and meta.get("is_pinned", False):
                idx -= 1
                continue
            if not self.close_tab_by_index(idx):
                # User cancelled
                break
            idx = self.tab_widget.count() - 1

    def close_other_tabs(self) -> None:
        curr = self.tab_widget.currentWidget()
        if not curr:
            return
        idx = self.tab_widget.count() - 1
        while idx >= 0:
            widget = self.tab_widget.widget(idx)
            if widget != curr:
                meta = self._tabs_meta.get(widget)
                if meta and meta.get("is_pinned", False):
                    idx -= 1
                    continue
                self.close_tab_by_index(idx)
            idx -= 1
