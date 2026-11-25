"""Base Section class for ADIOS pluggable sections."""
from __future__ import annotations
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Callable
from PySide6.QtWidgets import QWidget
from PySide6.QtGui import QIcon

class BaseSection(ABC):
    """Abstract base class for all ADIOS sections."""

    id: str = ""
    name: str = ""
    icon_name: str = "folder"
    shortcut: str = "" # e.g. "Alt+1"

    def __init__(self, db: Any):
        self.db = db

    @abstractmethod
    def init_schema(self) -> None:
        """Initialize database tables for this section."""
        pass

    @abstractmethod
    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        """Create and return the LIST view widget."""
        pass

    @abstractmethod
    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        """Create and return the EDITOR view widget for an existing item."""
        pass

    @abstractmethod
    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        """Create and return the CREATE view widget for a new item."""
        pass

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        """Return list of dicts: [{'id': str, 'name': str, 'widget_factory': Callable[[], QWidget]}]."""
        return []

    def search(self, query: str) -> List[Dict[str, Any]]:
        """Search items in this section. Returns [{'id': int, 'title': str, 'snippet': str, 'section_id': str}]."""
        return []

    def reminder_rules(self) -> List[Dict[str, Any]]:
        """Return scheduled or upcoming reminders from this section."""
        return []
