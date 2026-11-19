"""Theme manager for ADIOS (Light Mode & Dark Mode).

Provides high-contrast, clean Fusion palettes and stylesheets for:
- Light Mode (Crisp early-2000s native / Fusion look)
- Dark Mode (Professional dark charcoal theme with accessible contrast and styled controls)
"""
from __future__ import annotations
from PySide6.QtWidgets import QApplication
from PySide6.QtGui import QPalette, QColor
from PySide6.QtCore import Qt


DARK_PALETTE = {
    QPalette.ColorRole.Window: QColor(36, 39, 46),
    QPalette.ColorRole.WindowText: QColor(220, 224, 232),
    QPalette.ColorRole.Base: QColor(26, 29, 35),
    QPalette.ColorRole.AlternateBase: QColor(32, 35, 42),
    QPalette.ColorRole.ToolTipBase: QColor(220, 224, 232),
    QPalette.ColorRole.ToolTipText: QColor(26, 29, 35),
    QPalette.ColorRole.Text: QColor(230, 235, 245),
    QPalette.ColorRole.Button: QColor(46, 50, 60),
    QPalette.ColorRole.ButtonText: QColor(230, 235, 245),
    QPalette.ColorRole.BrightText: QColor(255, 100, 100),
    QPalette.ColorRole.Link: QColor(77, 148, 255),
    QPalette.ColorRole.Highlight: QColor(59, 130, 246),
    QPalette.ColorRole.HighlightedText: QColor(255, 255, 255),
}

DARK_STYLESHEET = """
QToolTip { 
    color: #ffffff; 
    background-color: #2b2b2b; 
    border: 1px solid #767676; 
}
QTableView {
    gridline-color: #3e4451;
    background-color: #1e2227;
    alternate-background-color: #242930;
    color: #e6ebf5;
    selection-background-color: #2563eb;
    selection-color: #ffffff;
}
QHeaderView::section {
    background-color: #282c34;
    color: #abb2bf;
    padding: 4px;
    border: 1px solid #3e4451;
}
QTabBar::tab {
    background: #282c34;
    color: #abb2bf;
    padding: 6px 14px;
    border: 1px solid #3e4451;
    border-bottom: none;
    margin-right: 2px;
}
QTabBar::tab:selected {
    background: #1e2227;
    color: #ffffff;
    font-weight: bold;
    border-bottom: 2px solid #3b82f6;
}
QGroupBox {
    border: 1px solid #3e4451;
    margin-top: 10px;
    padding-top: 10px;
    font-weight: bold;
}
QGroupBox::title {
    subcontrol-origin: margin;
    subcontrol-position: top left;
    padding: 0 4px;
    color: #60a5fa;
}
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox {
    background-color: #1e2227;
    color: #e6ebf5;
    border: 1px solid #3e4451;
    padding: 3px 5px;
    border-radius: 2px;
}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus {
    border: 1px solid #3b82f6;
}
QPushButton {
    background-color: #2c313a;
    color: #e6ebf5;
    border: 1px solid #3e4451;
    padding: 4px 12px;
    border-radius: 2px;
}
QPushButton:hover {
    background-color: #3b4048;
    border-color: #4b5263;
}
QPushButton:pressed {
    background-color: #1e2227;
}
QDockWidget {
    color: #e6ebf5;
    titlebar-close-icon: url(close.png);
    titlebar-normal-icon: url(float.png);
}
QDockWidget::title {
    background: #282c34;
    padding-left: 6px;
    padding-top: 4px;
    padding-bottom: 4px;
    border-bottom: 1px solid #3e4451;
}
QStatusBar {
    background: #21252b;
    color: #abb2bf;
    border-top: 1px solid #3e4451;
}
QMenuBar {
    background-color: #21252b;
    color: #e6ebf5;
}
QMenuBar::item:selected {
    background-color: #3e4451;
}
QMenu {
    background-color: #21252b;
    color: #e6ebf5;
    border: 1px solid #3e4451;
}
QMenu::item:selected {
    background-color: #2563eb;
    color: #ffffff;
}
"""


class ThemeManager:
    """Manages application-wide theme switching."""

    @classmethod
    def apply_theme(cls, theme_name: str) -> None:
        app = QApplication.instance()
        if not app:
            return

        theme_lower = theme_name.lower()
        if "dark" in theme_lower:
            # Build dark palette
            palette = QPalette()
            for role, color in DARK_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(DARK_STYLESHEET)
        else:
            # Revert to standard Fusion Light palette and empty custom stylesheet
            app.setPalette(app.style().standardPalette())
            app.setStyleSheet("")
