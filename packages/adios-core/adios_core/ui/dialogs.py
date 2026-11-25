"""Modal dialogs for ADIOS."""
from __future__ import annotations
from typing import List, Optional
from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QListWidget, QListWidgetItem, QPushButton, QLineEdit
)
from PySide6.QtCore import Qt

class NewItemChooserDialog(QDialog):
    """File -> New (Ctrl+N) chooser listing all available sections to open their LIST view tab."""
    def __init__(self, sections: List[any], parent=None):
        super().__init__(parent)
        self.setWindowTitle("New View - Choose Section")
        self.resize(350, 400)
        self.selected_section_id: Optional[str] = None

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Select a section tab to open:"))

        self.list_widget = QListWidget()
        for sec in sections:
            item = QListWidgetItem(f"{sec.name} ({sec.id})")
            item.setData(Qt.ItemDataRole.UserRole, sec.id)
            self.list_widget.addItem(item)

        layout.addWidget(self.list_widget)

        btn_box = QHBoxLayout()
        self.btn_open = QPushButton("Open Tab")
        self.btn_cancel = QPushButton("Cancel")
        btn_box.addStretch()
        btn_box.addWidget(self.btn_open)
        btn_box.addWidget(self.btn_cancel)
        layout.addLayout(btn_box)

        self.btn_open.clicked.connect(self._on_accept)
        self.btn_cancel.clicked.connect(self.reject)
        self.list_widget.itemDoubleClicked.connect(self._on_accept)

        if self.list_widget.count() > 0:
            self.list_widget.setCurrentRow(0)

    def _on_accept(self):
        item = self.list_widget.currentItem()
        if item:
            self.selected_section_id = item.data(Qt.ItemDataRole.UserRole)
            self.accept()


class QuickOpenDialog(QDialog):
    """Quick open dialog (Ctrl+O) across all sections."""
    def __init__(self, registry: any, parent=None):
        super().__init__(parent)
        self.registry = registry
        self.setWindowTitle("Open Item...")
        self.resize(450, 350)
        self.selected_item = None # (section_id, item_id)

        layout = QVBoxLayout(self)
        top = QHBoxLayout()
        top.addWidget(QLabel("Search:"))
        self.search_edit = QLineEdit()
        top.addWidget(self.search_edit)
        layout.addLayout(top)

        self.list_widget = QListWidget()
        layout.addWidget(self.list_widget)

        btn_box = QHBoxLayout()
        self.btn_open = QPushButton("Open")
        self.btn_cancel = QPushButton("Cancel")
        btn_box.addStretch()
        btn_box.addWidget(self.btn_open)
        btn_box.addWidget(self.btn_cancel)
        layout.addLayout(btn_box)

        self.search_edit.textChanged.connect(self._filter)
        self.btn_open.clicked.connect(self._on_open)
        self.btn_cancel.clicked.connect(self.reject)
        self.list_widget.itemDoubleClicked.connect(self._on_open)

    def _filter(self, text: str):
        self.list_widget.clear()
        query = text.strip()
        if not query:
            return
        for sec in self.registry.all_sections():
            try:
                results = sec.search(query)
                for res in results:
                    item = QListWidgetItem(f"[{sec.name}] #{res['id']} {res['title']}")
                    item.setData(Qt.ItemDataRole.UserRole, (sec.id, res["id"]))
                    self.list_widget.addItem(item)
            except Exception:
                pass

    def _on_open(self):
        item = self.list_widget.currentItem()
        if item:
            self.selected_item = item.data(Qt.ItemDataRole.UserRole)
            self.accept()


class DashboardWidgetsDialog(QDialog):
    """Manage enabled/disabled dashboard widgets."""
    def __init__(self, available_widgets: List[dict], active_widget_ids: List[str], parent=None):
        super().__init__(parent)
        self.setWindowTitle("Dashboard Widgets")
        self.resize(350, 400)
        self.available_widgets = available_widgets
        self.selected_ids: List[str] = list(active_widget_ids)

        layout = QVBoxLayout(self)
        layout.addWidget(QLabel("Select active dashboard widgets:"))

        self.list_widget = QListWidget()
        for w in available_widgets:
            item = QListWidgetItem(w["name"])
            item.setData(Qt.ItemDataRole.UserRole, w["id"])
            item.setCheckState(Qt.CheckState.Checked if w["id"] in self.selected_ids else Qt.CheckState.Unchecked)
            self.list_widget.addItem(item)

        layout.addWidget(self.list_widget)

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
        self.selected_ids = []
        for i in range(self.list_widget.count()):
            item = self.list_widget.item(i)
            if item.checkState() == Qt.CheckState.Checked:
                self.selected_ids.append(item.data(Qt.ItemDataRole.UserRole))
        self.accept()
