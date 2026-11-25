"""Quick Notes manager and dialog for ADIOS."""
from __future__ import annotations
from typing import Any
from datetime import datetime

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QLineEdit, QTextEdit, QPushButton, QListWidget, QListWidgetItem, QMessageBox
)
from PySide6.QtCore import Qt


class QuickNotesDialog(QDialog):
    """Manage and jot down quick notes."""
    def __init__(self, db: Any, parent=None):
        super().__init__(parent)
        self.db = db
        self.setWindowTitle("Quick Notes")
        self.resize(520, 420)
        self.current_note_id = None

        layout = QHBoxLayout(self)

        # Left: Note list
        left_box = QVBoxLayout()
        left_box.addWidget(QLabel("Saved Notes:"))
        self.list_notes = QListWidget()
        left_box.addWidget(self.list_notes)

        h_list_btns = QHBoxLayout()
        self.btn_new = QPushButton("+ New Note")
        self.btn_del = QPushButton("- Delete")
        h_list_btns.addWidget(self.btn_new)
        h_list_btns.addWidget(self.btn_del)
        left_box.addLayout(h_list_btns)
        layout.addLayout(left_box, 1)

        # Right: Note editor
        right_box = QVBoxLayout()
        self.txt_title = QLineEdit()
        self.txt_title.setPlaceholderText("Note Title...")
        right_box.addWidget(self.txt_title)

        self.txt_content = QTextEdit()
        self.txt_content.setPlaceholderText("Write quick note here...")
        right_box.addWidget(self.txt_content)

        h_save_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Note")
        self.btn_close = QPushButton("Close")
        h_save_bar.addWidget(self.btn_save)
        h_save_bar.addStretch()
        h_save_bar.addWidget(self.btn_close)
        right_box.addLayout(h_save_bar)
        layout.addLayout(right_box, 2)

        # Signals
        self.btn_new.clicked.connect(self._new_note)
        self.btn_del.clicked.connect(self._del_note)
        self.btn_save.clicked.connect(self._save_note)
        self.btn_close.clicked.connect(self.accept)
        self.list_notes.itemClicked.connect(self._on_note_selected)

        self.refresh()

    def refresh(self):
        self.list_notes.clear()
        notes = self.db.fetchall("SELECT id, title FROM quick_notes ORDER BY updated_at DESC")
        for n in notes:
            item = QListWidgetItem(n["title"] or "Untitled")
            item.setData(Qt.ItemDataRole.UserRole, n["id"])
            self.list_notes.addItem(item)

    def _new_note(self):
        self.current_note_id = None
        self.txt_title.clear()
        self.txt_content.clear()
        self.txt_title.setFocus()

    def _on_note_selected(self, item: QListWidgetItem):
        note_id = item.data(Qt.ItemDataRole.UserRole)
        row = self.db.fetchone("SELECT * FROM quick_notes WHERE id = ?", (note_id,))
        if row:
            self.current_note_id = note_id
            self.txt_title.setText(row["title"] or "")
            self.txt_content.setPlainText(row["content"] or "")

    def _save_note(self):
        title = self.txt_title.text().strip() or "Untitled"
        content = self.txt_content.toPlainText()
        now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with self.db.get_connection():
            if self.current_note_id is None:
                cur = self.db.execute("INSERT INTO quick_notes (title, content, created_at, updated_at) VALUES (?, ?, ?, ?)",
                                      (title, content, now_ts, now_ts))
                self.current_note_id = cur.lastrowid
            else:
                self.db.execute("UPDATE quick_notes SET title = ?, content = ?, updated_at = ? WHERE id = ?",
                                (title, content, now_ts, self.current_note_id))

        self.refresh()
        QMessageBox.information(self, "Saved", "Quick note saved.")

    def _del_note(self):
        if not self.current_note_id:
            return
        with self.db.get_connection():
            self.db.execute("DELETE FROM quick_notes WHERE id = ?", (self.current_note_id,))
        self._new_note()
        self.refresh()
