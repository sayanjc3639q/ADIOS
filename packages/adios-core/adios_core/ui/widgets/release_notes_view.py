"""Release Notes Viewer Tab Widget for ADIOS."""
from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel, QTextBrowser, QHBoxLayout, QPushButton
from PySide6.QtCore import Qt
from app.version import RELEASE_NOTES, APP_VERSION

class ReleaseNotesView(QWidget):
    """Clean tab showing full version release notes and update history."""

    def __init__(self, parent=None):
        super().__init__(parent)
        layout = QVBoxLayout(self)
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        header = QLabel(f"<h2 style='margin:0; color:#0284c7;'>ADIOS Version {APP_VERSION} Release Notes</h2>")
        layout.addWidget(header)

        self.browser = QTextBrowser()
        self.browser.setMarkdown(RELEASE_NOTES)
        self.browser.setStyleSheet("""
            QTextBrowser {
                background-color: #ffffff;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 16px;
                font-size: 13px;
                color: #0f172a;
            }
        """)
        layout.addWidget(self.browser)
