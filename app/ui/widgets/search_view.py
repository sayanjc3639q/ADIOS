"""Search tab view."""
from __future__ import annotations
from typing import Any
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QPushButton, QListWidget, QListWidgetItem
)
from PySide6.QtCore import Qt

class SearchView(QWidget):
    def __init__(self, registry: Any, tab_manager: Any, query: str = "", parent=None):
        super().__init__(parent)
        self.registry = registry
        self.tab_manager = tab_manager

        layout = QVBoxLayout(self)
        top_bar = QHBoxLayout()
        self.input_query = QLineEdit(query)
        self.btn_search = QPushButton("Search")
        top_bar.addWidget(QLabel("Query:"))
        top_bar.addWidget(self.input_query)
        top_bar.addWidget(self.btn_search)
        layout.addLayout(top_bar)

        self.list_widget = QListWidget()
        layout.addWidget(self.list_widget)

        self.btn_search.clicked.connect(self.perform_search)
        self.input_query.returnPressed.connect(self.perform_search)
        self.list_widget.itemDoubleClicked.connect(self._on_item_double_clicked)

        if query:
            self.perform_search()

    def perform_search(self):
        query = self.input_query.text().strip()
        self.list_widget.clear()
        if not query:
            return

        for section in self.registry.all_sections():
            try:
                results = section.search(query)
                for item in results:
                    item_text = f"[{section.name}] #{item['id']} - {item['title']}\n  {item.get('snippet', '')}"
                    list_item = QListWidgetItem(item_text)
                    list_item.setData(Qt.ItemDataRole.UserRole, (section.id, item["id"]))
                    self.list_widget.addItem(list_item)
            except Exception as e:
                pass

    def _on_item_double_clicked(self, item: QListWidgetItem):
        data = item.data(Qt.ItemDataRole.UserRole)
        if data:
            sec_id, item_id = data
            from app.core.tab_manager import TabKind
            self.tab_manager.open_tab(sec_id, TabKind.VIEW, item_id=item_id)
