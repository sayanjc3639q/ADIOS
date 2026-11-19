"""Comprehensive test suite exercising all 10 ADIOS sections."""
import pytest
from app.core.db import DatabaseManager
from app.core.registry import SectionRegistry
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


@pytest.fixture
def full_app_db(tmp_path):
    db_file = str(tmp_path / "all_sections_test.db")
    db = DatabaseManager(db_file)
    registry = SectionRegistry(db)

    sections = [
        LinkedInSection, ExamsSection, ScheduleSection, MoneySection,
        SubscriptionsSection, ClubsSection, StudySection, ProjectsSection,
        SkillsSection, JourneySection
    ]
    for s_cls in sections:
        registry.register(s_cls)

    return db, registry


def test_all_sections_init_and_search(full_app_db):
    db, reg = full_app_db
    assert len(reg.all_sections()) == 10

    # Insert sample records across all sections
    with db.get_connection():
        # Study
        db.execute(
            "INSERT INTO study_sessions (subject, topic, session_date, duration_minutes, rating, efficiency) VALUES (?, ?, ?, ?, ?, ?)",
            ("Linear Algebra", "Eigenvalues", "2026-11-19", 90, 5, 95)
        )
        # Projects
        db.execute(
            "INSERT INTO projects (title, category, status, priority, tech_stack) VALUES (?, ?, ?, ?, ?)",
            ("Ray Tracer", "Graphics", "In Development", "High", "C++, OpenGL")
        )
        # Skills
        db.execute(
            "INSERT INTO skills (name, category, proficiency_level, progress_percent) VALUES (?, ?, ?, ?)",
            ("Rust", "Programming Language", "Intermediate", 65)
        )
        # Journey
        db.execute(
            "INSERT INTO journey_entries (title, entry_date, milestone_type, impact_rating) VALUES (?, ?, ?, ?)",
            ("Shipped First OpenGL Engine", "2026-11-19", "Technical Breakthrough", 5)
        )
        # Clubs
        db.execute(
            "INSERT INTO clubs (name, my_role, description) VALUES (?, ?, ?)",
            ("Astronomy Society", "Lead Developer", "Observatory telescope team")
        )

    # Test search for all sections
    for sec in reg.all_sections():
        results = sec.search("")
        assert isinstance(results, list)

    assert len(reg.get("study").search("Eigenvalues")) == 1
    assert len(reg.get("projects").search("OpenGL")) == 1
    assert len(reg.get("skills").search("Rust")) == 1
    assert len(reg.get("journey").search("OpenGL")) == 1
    assert len(reg.get("clubs").search("Astronomy")) == 1


def test_all_sections_dashboard_widgets(full_app_db):
    import sys
    from PySide6.QtWidgets import QApplication
    _app = QApplication.instance() or QApplication(sys.argv)
    _, reg = full_app_db
    for sec in reg.all_sections():
        widgets = sec.dashboard_widgets()
        assert isinstance(widgets, list)
        for w in widgets:
            assert "id" in w
            assert "widget_factory" in w
            widget_inst = w["widget_factory"]()
            assert widget_inst is not None


def test_all_sections_reminder_rules(full_app_db):
    _, reg = full_app_db
    for sec in reg.all_sections():
        rules = sec.reminder_rules()
        assert isinstance(rules, list)
