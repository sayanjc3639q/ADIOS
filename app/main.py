"""Entry point for the ADIOS desktop application."""
from __future__ import annotations
import sys
import os
import logging
from pathlib import Path
from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt

from app.core.main_window import MainWindow
from app.sections.linkedin import LinkedInSection
from app.sections.exams import ExamsSection
from app.sections.schedule import ScheduleSection
from app.sections.money import MoneySection
from app.sections.subscriptions import SubscriptionsSection
from app.sections.clubs import ClubsSection
from app.sections.study import StudySection
from app.sections.projects import ProjectsSection
from app.sections.skills import SkillsSection
from app.sections.journey import JourneySection

def setup_logging(data_dir: Path) -> None:
    data_dir.mkdir(parents=True, exist_ok=True)
    log_file = data_dir / "adios.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.FileHandler(str(log_file), encoding="utf-8"),
            logging.StreamHandler(sys.stdout)
        ]
    )

def main() -> None:
    # Set data dir
    data_dir = Path(os.environ.get("ADIOS_DATA_DIR", Path.cwd()))
    setup_logging(data_dir)
    logging.info("Starting ADIOS desktop application...")

    # Set standard clean Windows native styling
    app = QApplication(sys.argv)
    
    # Use Fusion or Windows style for consistent crisp native rendering
    if "Fusion" in [s for s in ["Fusion", "Windows"]]:
        app.setStyle("Fusion")
    else:
        app.setStyle("Windows")

    # Native clean typography
    font = app.font()
    font.setPointSize(9)
    font.setFamily("Segoe UI")
    app.setFont(font)

    # Initialize main window
    window = MainWindow()
    
    # Apply user-saved theme (Light or Dark)
    from app.core.theme_manager import ThemeManager
    saved_theme = window.db.get_setting("theme_mode", "Light Mode")
    ThemeManager.apply_theme(saved_theme)
    
    # Register Sections
    window.registry.register(LinkedInSection)
    window.registry.register(ExamsSection)
    window.registry.register(ScheduleSection)
    window.registry.register(MoneySection)
    window.registry.register(SubscriptionsSection)
    window.registry.register(ClubsSection)
    window.registry.register(StudySection)
    window.registry.register(ProjectsSection)
    window.registry.register(SkillsSection)
    window.registry.register(JourneySection)
    
    # Rebuild UI elements derived from registry
    window.action_manager.rebuild_create_menu()
    window.action_manager.rebuild_go_menu()
    window.rebuild_left_toolbar()
    window.rebuild_dashboard()

    window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
