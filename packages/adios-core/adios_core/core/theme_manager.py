"""Theme manager for ADIOS with rich color themes.

Themes supported:
- Light Mode (Clean, consistent native light styling with seamless matching menubar)
- Dark Classic (VS Code / Charcoal dark theme)
- Monokai (Iconic high-contrast dark with warm olive/yellow and magenta accents)
- Tokyo Night (Sleek deep navy blue with cyan, purple, and neon accents)
- High Contrast (Accessibility-focused pure black and ultra-high contrast borders)
- Kimbie Dark (Warm retro espresso brown with amber, rust, and gold tones)
"""
from __future__ import annotations
from typing import Dict, Any, List
from PySide6.QtWidgets import QApplication, QWidget, QLabel, QPushButton, QLineEdit
from PySide6.QtGui import QPalette, QColor
from PySide6.QtCore import Qt

THEME_NAMES: List[str] = [
    "Light Mode",
    "Dark Classic",
    "Monokai",
    "Tokyo Night",
    "High Contrast",
    "Kimbie Dark"
]

# ----------------- PALETTES -----------------

DARK_CLASSIC_PALETTE = {
    QPalette.ColorRole.Window: QColor(30, 30, 30),
    QPalette.ColorRole.WindowText: QColor(220, 220, 220),
    QPalette.ColorRole.Base: QColor(24, 24, 24),
    QPalette.ColorRole.AlternateBase: QColor(36, 36, 36),
    QPalette.ColorRole.ToolTipBase: QColor(220, 220, 220),
    QPalette.ColorRole.ToolTipText: QColor(30, 30, 30),
    QPalette.ColorRole.Text: QColor(225, 225, 225),
    QPalette.ColorRole.Button: QColor(45, 45, 48),
    QPalette.ColorRole.ButtonText: QColor(225, 225, 225),
    QPalette.ColorRole.BrightText: QColor(255, 110, 110),
    QPalette.ColorRole.Link: QColor(78, 160, 255),
    QPalette.ColorRole.Highlight: QColor(14, 99, 156),
    QPalette.ColorRole.HighlightedText: QColor(255, 255, 255),
}

MONOKAI_PALETTE = {
    QPalette.ColorRole.Window: QColor(39, 40, 34),
    QPalette.ColorRole.WindowText: QColor(248, 248, 242),
    QPalette.ColorRole.Base: QColor(30, 31, 26),
    QPalette.ColorRole.AlternateBase: QColor(49, 51, 44),
    QPalette.ColorRole.ToolTipBase: QColor(248, 248, 242),
    QPalette.ColorRole.ToolTipText: QColor(39, 40, 34),
    QPalette.ColorRole.Text: QColor(248, 248, 242),
    QPalette.ColorRole.Button: QColor(54, 56, 48),
    QPalette.ColorRole.ButtonText: QColor(248, 248, 242),
    QPalette.ColorRole.BrightText: QColor(249, 38, 114),
    QPalette.ColorRole.Link: QColor(102, 217, 239),
    QPalette.ColorRole.Highlight: QColor(249, 38, 114),
    QPalette.ColorRole.HighlightedText: QColor(255, 255, 255),
}

TOKYO_NIGHT_PALETTE = {
    QPalette.ColorRole.Window: QColor(26, 27, 38),
    QPalette.ColorRole.WindowText: QColor(192, 202, 245),
    QPalette.ColorRole.Base: QColor(19, 20, 29),
    QPalette.ColorRole.AlternateBase: QColor(36, 40, 59),
    QPalette.ColorRole.ToolTipBase: QColor(192, 202, 245),
    QPalette.ColorRole.ToolTipText: QColor(26, 27, 38),
    QPalette.ColorRole.Text: QColor(192, 202, 245),
    QPalette.ColorRole.Button: QColor(41, 46, 66),
    QPalette.ColorRole.ButtonText: QColor(192, 202, 245),
    QPalette.ColorRole.BrightText: QColor(247, 118, 142),
    QPalette.ColorRole.Link: QColor(122, 162, 247),
    QPalette.ColorRole.Highlight: QColor(122, 162, 247),
    QPalette.ColorRole.HighlightedText: QColor(26, 27, 38),
}

HIGH_CONTRAST_PALETTE = {
    QPalette.ColorRole.Window: QColor(0, 0, 0),
    QPalette.ColorRole.WindowText: QColor(255, 255, 255),
    QPalette.ColorRole.Base: QColor(0, 0, 0),
    QPalette.ColorRole.AlternateBase: QColor(20, 20, 20),
    QPalette.ColorRole.ToolTipBase: QColor(255, 255, 255),
    QPalette.ColorRole.ToolTipText: QColor(0, 0, 0),
    QPalette.ColorRole.Text: QColor(255, 255, 255),
    QPalette.ColorRole.Button: QColor(25, 25, 25),
    QPalette.ColorRole.ButtonText: QColor(255, 255, 255),
    QPalette.ColorRole.BrightText: QColor(255, 255, 0),
    QPalette.ColorRole.Link: QColor(0, 255, 255),
    QPalette.ColorRole.Highlight: QColor(26, 115, 232),
    QPalette.ColorRole.HighlightedText: QColor(255, 255, 255),
}

KIMBIE_PALETTE = {
    QPalette.ColorRole.Window: QColor(34, 26, 20),
    QPalette.ColorRole.WindowText: QColor(220, 185, 140),
    QPalette.ColorRole.Base: QColor(25, 19, 15),
    QPalette.ColorRole.AlternateBase: QColor(45, 35, 28),
    QPalette.ColorRole.ToolTipBase: QColor(220, 185, 140),
    QPalette.ColorRole.ToolTipText: QColor(34, 26, 20),
    QPalette.ColorRole.Text: QColor(220, 185, 140),
    QPalette.ColorRole.Button: QColor(54, 42, 33),
    QPalette.ColorRole.ButtonText: QColor(220, 185, 140),
    QPalette.ColorRole.BrightText: QColor(220, 57, 50),
    QPalette.ColorRole.Link: QColor(240, 140, 60),
    QPalette.ColorRole.Highlight: QColor(165, 85, 45),
    QPalette.ColorRole.HighlightedText: QColor(255, 255, 255),
}

# ----------------- STYLESHEETS -----------------

LIGHT_STYLESHEET = """
QMenuBar {
    background-color: #f1f3f5;
    color: #1e293b;
    border-bottom: 1px solid #cbd5e1;
    padding: 4px 6px;
    font-size: 13px;
}
QMenuBar::item {
    background: transparent;
    padding: 6px 10px;
    border-radius: 4px;
    color: #1e293b;
}
QMenuBar::item:selected {
    background-color: #e2e8f0;
    color: #0f172a;
}
QMenu {
    background-color: #ffffff;
    color: #0f172a;
    border: 1px solid #cbd5e1;
    padding: 4px;
    border-radius: 4px;
}
QMenu::item {
    padding: 4px 20px 4px 10px;
    border-radius: 3px;
    color: #0f172a;
}
QMenu::item:selected {
    background-color: #0284c7;
    color: #ffffff;
}
QMenu::separator {
    height: 1px;
    background-color: #e2e8f0;
    margin: 4px 0px;
}
QTableView {
    gridline-color: #e2e8f0;
    background-color: #ffffff;
    alternate-background-color: #f8fafc;
    color: #0f172a;
    selection-background-color: #0284c7;
    selection-color: #ffffff;
}
QHeaderView::section {
    background-color: #f1f5f9;
    color: #475569;
    padding: 4px;
    border: 1px solid #e2e8f0;
    font-weight: 600;
}
QTabBar::tab {
    background: #f1f5f9;
    color: #475569;
    padding: 6px 14px;
    border: 1px solid #cbd5e1;
    border-bottom: none;
    margin-right: -1px;
}
QTabBar::tab:selected {
    background: #ffffff;
    color: #0284c7;
    font-weight: bold;
    border-bottom: 2px solid #0284c7;
}
QTabBar::tab:hover:!selected {
    background: #e2e8f0;
}
QTabBar::close-button {
    image: url(resources/icons/tab_close.svg);
    subcontrol-position: right;
    margin-left: 6px;
    padding: 3px;
    width: 14px;
    height: 14px;
    border-radius: 4px;
}
QTabBar::close-button:hover {
    image: url(resources/icons/tab_close_hover.svg);
    background: #fee2e2;
}
QStatusBar {
    background: #f1f3f5;
    color: #475569;
    border-top: 1px solid #cbd5e1;
}
"""

DARK_CLASSIC_STYLESHEET = """
QToolTip { color: #ffffff; background-color: #2b2b2b; border: 1px solid #767676; }
QTableView { gridline-color: #383838; background-color: #1e1e1e; alternate-background-color: #252526; color: #d4d4d4; selection-background-color: #0e639c; selection-color: #ffffff; }
QHeaderView::section { background-color: #252526; color: #cccccc; padding: 4px; border: 1px solid #383838; font-weight: 600; }
QTabBar::tab { background: #2d2d2d; color: #969696; padding: 6px 14px; border: 1px solid #3c3c3c; border-bottom: none; margin-right: -1px; }
QTabBar::tab:selected { background: #1e1e1e; color: #ffffff; font-weight: bold; border-bottom: 2px solid #007acc; }
QTabBar::tab:hover:!selected { background: #383838; }
QTabBar::close-button { image: url(resources/icons/tab_close_dark.svg); subcontrol-position: right; margin-left: 6px; padding: 3px; width: 14px; height: 14px; border-radius: 4px; }
QTabBar::close-button:hover { image: url(resources/icons/tab_close_dark_hover.svg); background: #7f1d1d; }
QGroupBox { border: 1px solid #3c3c3c; margin-top: 10px; padding-top: 10px; font-weight: bold; }
QGroupBox::title { subcontrol-origin: margin; subcontrol-position: top left; padding: 0 4px; color: #4fc1ff; }
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox { background-color: #252526; color: #cccccc; border: 1px solid #3c3c3c; padding: 3px 5px; border-radius: 2px; }
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus { border: 1px solid #007acc; }
QPushButton { background-color: #333333; color: #cccccc; border: 1px solid #454545; padding: 4px 12px; border-radius: 2px; }
QPushButton:hover { background-color: #3c3c3c; border-color: #555555; color: #ffffff; }
QPushButton:pressed { background-color: #1e1e1e; }
QDockWidget { color: #cccccc; }
QDockWidget::title { background: #252526; padding-left: 6px; padding-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #3c3c3c; }
QStatusBar { background: #1e1e1e; color: #888888; border-top: 1px solid #2d2d2d; }
QMenuBar { background-color: #1e1e1e; color: #cccccc; border-bottom: 1px solid #2d2d2d; padding: 4px 6px; font-size: 13px; }
QMenuBar::item { background: transparent; padding: 6px 10px; border-radius: 4px; }
QMenuBar::item:selected { background-color: #323233; color: #ffffff; }
QMenu { background-color: #252526; color: #cccccc; border: 1px solid #454545; padding: 4px; border-radius: 4px; }
QMenu::item { padding: 4px 20px 4px 10px; border-radius: 3px; }
QMenu::item:selected { background-color: #094771; color: #ffffff; }
QMenu::separator { height: 1px; background-color: #3c3c3c; margin: 4px 0px; }
"""

MONOKAI_STYLESHEET = """
QToolTip { color: #f8f8f2; background-color: #383a32; border: 1px solid #75715e; }
QTableView { gridline-color: #49483e; background-color: #272822; alternate-background-color: #32332c; color: #f8f8f2; selection-background-color: #f92672; selection-color: #ffffff; }
QHeaderView::section { background-color: #383a32; color: #e6db74; padding: 4px; border: 1px solid #49483e; font-weight: bold; }
QTabBar::tab { background: #3e3d32; color: #a6e22e; padding: 6px 14px; border: 1px solid #49483e; border-bottom: none; margin-right: -1px; }
QTabBar::tab:selected { background: #272822; color: #f8f8f2; font-weight: bold; border-bottom: 2px solid #a6e22e; }
QTabBar::tab:hover:!selected { background: #49483e; }
QTabBar::close-button { image: url(resources/icons/tab_close_dark.svg); subcontrol-position: right; margin-left: 6px; padding: 3px; width: 14px; height: 14px; border-radius: 4px; }
QTabBar::close-button:hover { image: url(resources/icons/tab_close_dark_hover.svg); background: #7f1d1d; }
QGroupBox { border: 1px solid #75715e; margin-top: 10px; padding-top: 10px; font-weight: bold; }
QGroupBox::title { subcontrol-origin: margin; subcontrol-position: top left; padding: 0 4px; color: #a6e22e; }
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox { background-color: #383a32; color: #f8f8f2; border: 1px solid #49483e; padding: 3px 5px; border-radius: 2px; }
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus { border: 1px solid #66d9ef; }
QPushButton { background-color: #49483e; color: #f8f8f2; border: 1px solid #75715e; padding: 4px 12px; border-radius: 2px; font-weight: 600; }
QPushButton:hover { background-color: #5c5a4d; border-color: #a6e22e; }
QPushButton:pressed { background-color: #272822; }
QDockWidget { color: #f8f8f2; }
QDockWidget::title { background: #383a32; padding-left: 6px; padding-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #49483e; }
QStatusBar { background: #1e1f1c; color: #75715e; border-top: 1px solid #383a32; }
QMenuBar { background-color: #1e1f1c; color: #f8f8f2; border-bottom: 1px solid #383a32; padding: 4px 6px; font-size: 13px; }
QMenuBar::item { background: transparent; padding: 6px 10px; border-radius: 4px; }
QMenuBar::item:selected { background-color: #383a32; color: #a6e22e; }
QMenu { background-color: #272822; color: #f8f8f2; border: 1px solid #75715e; padding: 4px; border-radius: 4px; }
QMenu::item { padding: 4px 20px 4px 10px; border-radius: 3px; }
QMenu::item:selected { background-color: #f92672; color: #ffffff; }
QMenu::separator { height: 1px; background-color: #49483e; margin: 4px 0px; }
"""

TOKYO_NIGHT_STYLESHEET = """
QToolTip { color: #c0caf5; background-color: #24283b; border: 1px solid #414868; }
QTableView { gridline-color: #2f3549; background-color: #1a1b26; alternate-background-color: #24283b; color: #c0caf5; selection-background-color: #7aa2f7; selection-color: #1a1b26; }
QHeaderView::section { background-color: #24283b; color: #7dcfff; padding: 4px; border: 1px solid #2f3549; font-weight: bold; }
QTabBar::tab { background: #24283b; color: #a9b1d6; padding: 6px 14px; border: 1px solid #2f3549; border-bottom: none; margin-right: -1px; }
QTabBar::tab:selected { background: #1a1b26; color: #7aa2f7; font-weight: bold; border-bottom: 2px solid #7aa2f7; }
QTabBar::tab:hover:!selected { background: #2f3549; }
QTabBar::close-button { image: url(resources/icons/tab_close_dark.svg); subcontrol-position: right; margin-left: 6px; padding: 3px; width: 14px; height: 14px; border-radius: 4px; }
QTabBar::close-button:hover { image: url(resources/icons/tab_close_dark_hover.svg); background: #7f1d1d; }
QGroupBox { border: 1px solid #414868; margin-top: 10px; padding-top: 10px; font-weight: bold; }
QGroupBox::title { subcontrol-origin: margin; subcontrol-position: top left; padding: 0 4px; color: #bb9af7; }
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox { background-color: #24283b; color: #c0caf5; border: 1px solid #414868; padding: 3px 5px; border-radius: 2px; }
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus { border: 1px solid #7dcfff; }
QPushButton { background-color: #292e42; color: #c0caf5; border: 1px solid #414868; padding: 4px 12px; border-radius: 2px; }
QPushButton:hover { background-color: #3b4261; border-color: #7aa2f7; color: #ffffff; }
QPushButton:pressed { background-color: #1a1b26; }
QDockWidget { color: #c0caf5; }
QDockWidget::title { background: #24283b; padding-left: 6px; padding-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #414868; }
QStatusBar { background: #16161e; color: #565f89; border-top: 1px solid #24283b; }
QMenuBar { background-color: #16161e; color: #c0caf5; border-bottom: 1px solid #24283b; padding: 4px 6px; font-size: 13px; }
QMenuBar::item { background: transparent; padding: 6px 10px; border-radius: 4px; }
QMenuBar::item:selected { background-color: #292e42; color: #7dcfff; }
QMenu { background-color: #1a1b26; color: #c0caf5; border: 1px solid #414868; padding: 4px; border-radius: 4px; }
QMenu::item { padding: 4px 20px 4px 10px; border-radius: 3px; }
QMenu::item:selected { background-color: #7aa2f7; color: #1a1b26; font-weight: bold; }
QMenu::separator { height: 1px; background-color: #2f3549; margin: 4px 0px; }
"""

HIGH_CONTRAST_STYLESHEET = """
QToolTip { color: #ffff00; background-color: #000000; border: 2px solid #ffffff; }
QTableView { gridline-color: #ffffff; background-color: #000000; alternate-background-color: #121212; color: #ffffff; selection-background-color: #1a73e8; selection-color: #ffffff; border: 1px solid #ffffff; }
QHeaderView::section { background-color: #000000; color: #ffff00; padding: 4px; border: 1px solid #ffffff; font-weight: bold; }
QTabBar::tab { background: #1a1a1a; color: #ffffff; padding: 6px 14px; border: 1px solid #ffffff; border-bottom: none; margin-right: -1px; }
QTabBar::tab:selected { background: #000000; color: #ffff00; font-weight: bold; border-bottom: 3px solid #ffff00; }
QTabBar::tab:hover:!selected { background: #262626; }
QTabBar::close-button { image: url(resources/icons/tab_close_dark.svg); subcontrol-position: right; margin-left: 6px; padding: 3px; width: 14px; height: 14px; border-radius: 4px; }
QTabBar::close-button:hover { image: url(resources/icons/tab_close_dark_hover.svg); background: #ffff00; color: #000000; }
QGroupBox { border: 2px solid #ffffff; margin-top: 10px; padding-top: 10px; font-weight: bold; }
QGroupBox::title { subcontrol-origin: margin; subcontrol-position: top left; padding: 0 4px; color: #00ffff; }
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox { background-color: #000000; color: #ffffff; border: 2px solid #ffffff; padding: 3px 5px; border-radius: 0px; }
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus { border: 2px solid #ffff00; }
QPushButton { background-color: #000000; color: #ffffff; border: 2px solid #ffffff; padding: 4px 12px; font-weight: bold; }
QPushButton:hover { background-color: #ffff00; color: #000000; border-color: #ffff00; }
QPushButton:pressed { background-color: #00ffff; color: #000000; }
QDockWidget { color: #ffffff; }
QDockWidget::title { background: #000000; padding-left: 6px; padding-top: 4px; padding-bottom: 4px; border-bottom: 2px solid #ffffff; color: #00ffff; }
QStatusBar { background: #000000; color: #ffffff; border-top: 2px solid #ffffff; }
QMenuBar { background-color: #000000; color: #ffffff; border-bottom: 2px solid #ffffff; padding: 4px 6px; font-size: 13px; }
QMenuBar::item { background: transparent; padding: 6px 10px; }
QMenuBar::item:selected { background-color: #ffffff; color: #000000; }
QMenu { background-color: #000000; color: #ffffff; border: 2px solid #ffffff; padding: 4px; }
QMenu::item { padding: 4px 20px 4px 10px; }
QMenu::item:selected { background-color: #ffff00; color: #000000; font-weight: bold; }
QMenu::separator { height: 2px; background-color: #ffffff; margin: 4px 0px; }
"""

KIMBIE_STYLESHEET = """
QToolTip { color: #dcb98c; background-color: #221a14; border: 1px solid #6b4d37; }
QTableView { gridline-color: #4b3628; background-color: #221a14; alternate-background-color: #2a2019; color: #dcb98c; selection-background-color: #a5552d; selection-color: #ffffff; }
QHeaderView::section { background-color: #362a21; color: #f08c3c; padding: 4px; border: 1px solid #4b3628; font-weight: bold; }
QTabBar::tab { background: #2f251c; color: #9f8065; padding: 6px 14px; border: 1px solid #4b3628; border-bottom: none; margin-right: -1px; }
QTabBar::tab:selected { background: #221a14; color: #f08c3c; font-weight: bold; border-bottom: 2px solid #f08c3c; }
QTabBar::tab:hover:!selected { background: #3b2e23; }
QTabBar::close-button { image: url(resources/icons/tab_close_dark.svg); subcontrol-position: right; margin-left: 6px; padding: 3px; width: 14px; height: 14px; border-radius: 4px; }
QTabBar::close-button:hover { image: url(resources/icons/tab_close_dark_hover.svg); background: #7f1d1d; }
QGroupBox { border: 1px solid #5a4230; margin-top: 10px; padding-top: 10px; font-weight: bold; }
QGroupBox::title { subcontrol-origin: margin; subcontrol-position: top left; padding: 0 4px; color: #f08c3c; }
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QDateEdit, QComboBox { background-color: #2f251c; color: #dcb98c; border: 1px solid #4b3628; padding: 3px 5px; border-radius: 2px; }
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus { border: 1px solid #f08c3c; }
QPushButton { background-color: #3e3025; color: #dcb98c; border: 1px solid #5a4230; padding: 4px 12px; border-radius: 2px; font-weight: 600; }
QPushButton:hover { background-color: #523f30; border-color: #f08c3c; color: #ffffff; }
QPushButton:pressed { background-color: #221a14; }
QDockWidget { color: #dcb98c; }
QDockWidget::title { background: #362a21; padding-left: 6px; padding-top: 4px; padding-bottom: 4px; border-bottom: 1px solid #4b3628; color: #f08c3c; }
QStatusBar { background: #19130f; color: #876850; border-top: 1px solid #362a21; }
QMenuBar { background-color: #19130f; color: #dcb98c; border-bottom: 1px solid #362a21; padding: 4px 6px; font-size: 13px; }
QMenuBar::item { background: transparent; padding: 6px 10px; border-radius: 4px; }
QMenuBar::item:selected { background-color: #362a21; color: #f08c3c; }
QMenu { background-color: #221a14; color: #dcb98c; border: 1px solid #5a4230; padding: 4px; border-radius: 4px; }
QMenu::item { padding: 4px 20px 4px 10px; border-radius: 3px; }
QMenu::item:selected { background-color: #a5552d; color: #ffffff; }
QMenu::separator { height: 1px; background-color: #4b3628; margin: 4px 0px; }
"""


class ThemeManager:
    """Manages application-wide theme switching."""

    @classmethod
    def apply_theme(cls, theme_name: str) -> None:
        app = QApplication.instance()
        if not app:
            return

        name = theme_name.strip()

        # Update right corner widget in main window if active
        top_window = None
        for w in app.topLevelWidgets():
            if hasattr(w, "action_manager"):
                top_window = w
                break

        if name == "Monokai":
            palette = QPalette()
            for role, color in MONOKAI_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(MONOKAI_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=False, text_color="#f8f8f2")

        elif name == "Tokyo Night":
            palette = QPalette()
            for role, color in TOKYO_NIGHT_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(TOKYO_NIGHT_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=False, text_color="#c0caf5")

        elif name == "High Contrast":
            palette = QPalette()
            for role, color in HIGH_CONTRAST_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(HIGH_CONTRAST_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=False, text_color="#ffff00")

        elif name == "Kimbie Dark":
            palette = QPalette()
            for role, color in KIMBIE_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(KIMBIE_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=False, text_color="#dcb98c")

        elif "dark" in name.lower():
            # Dark Classic
            palette = QPalette()
            for role, color in DARK_CLASSIC_PALETTE.items():
                palette.setColor(role, color)
            app.setPalette(palette)
            app.setStyleSheet(DARK_CLASSIC_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=False, text_color="#cccccc")

        else:
            # Clean Light Mode (Harmonious light palette with clean light menubar)
            app.setPalette(app.style().standardPalette())
            app.setStyleSheet(LIGHT_STYLESHEET)
            cls._update_corner_widget(top_window, is_light=True, text_color="#475569")

    @classmethod
    def _update_corner_widget(cls, window: Any, is_light: bool, text_color: str) -> None:
        if not window or not hasattr(window, "action_manager"):
            return
        am = window.action_manager
        if hasattr(am, "lbl_title_context"):
            am.lbl_title_context.setStyleSheet(f"color: {text_color}; font-size: 12px; font-weight: 500; padding-right: 18px;")

        if hasattr(am, "btn_profile"):
            if is_light:
                am.btn_profile.setStyleSheet("""
                    QPushButton {
                        background: #f1f5f9;
                        color: #1e293b;
                        font-size: 11.5px;
                        border: 1px solid #cbd5e1;
                        border-radius: 4px;
                        padding: 2px 8px;
                    }
                    QPushButton:hover {
                        background: #e2e8f0;
                        color: #0f172a;
                    }
                """)
            else:
                am.btn_profile.setStyleSheet("""
                    QPushButton {
                        background: transparent;
                        color: #cbd5e1;
                        font-size: 11.5px;
                        border: 1px solid rgba(255, 255, 255, 0.15);
                        border-radius: 4px;
                        padding: 2px 8px;
                    }
                    QPushButton:hover {
                        background: rgba(255, 255, 255, 0.1);
                        color: #ffffff;
                    }
                """)

        if hasattr(am, "btn_search_icon"):
            hover_bg = "rgba(0, 0, 0, 0.06)" if is_light else "rgba(255, 255, 255, 0.08)"
            am.btn_search_icon.setStyleSheet(f"""
                QPushButton {{ background: transparent; border: none; border-radius: 4px; padding: 2px; }}
                QPushButton:hover {{ background: {hover_bg}; }}
            """)

        if hasattr(am, "btn_settings"):
            hover_bg = "rgba(0, 0, 0, 0.06)" if is_light else "rgba(255, 255, 255, 0.08)"
            am.btn_settings.setStyleSheet(f"""
                QPushButton {{ background: transparent; border: none; border-radius: 4px; padding: 2px; }}
                QPushButton:hover {{ background: {hover_bg}; }}
            """)
