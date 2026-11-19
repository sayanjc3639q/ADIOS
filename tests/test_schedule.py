"""Unit tests for Section 4: Schedule recurrence, exceptions, conflicts, and views."""
from datetime import date, datetime, timedelta
import pytest
from app.core.db import DatabaseManager
from app.sections.schedule import ScheduleSection
from tests.test_tab_manager import qapp

@pytest.fixture
def sched_suite(tmp_path):
    db_file = str(tmp_path / "test_sched_suite.db")
    db = DatabaseManager(db_file)
    sec = ScheduleSection(db)
    sec.init_schema()
    return sec, db

def test_daily_and_weekly_recurrence(sched_suite, qapp):
    sec, db = sched_suite

    # Create weekly event on Tuesday and Thursday
    with db.get_connection():
        cur = db.execute("""
            INSERT INTO schedule_events 
            (title, category, start_date, end_date, start_time, end_time, all_day, repeat_type, rrule_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("Math Tutorial", "Class", "2026-11-17", "2026-11-17", "14:00", "15:30", 0, "Weekly", "FREQ=WEEKLY;BYDAY=TU,TH"))
        ev_id = cur.lastrowid

    # Nov 17 is Tuesday, Nov 19 is Thursday, Nov 24 is Tuesday, Nov 26 is Thursday
    occs = sec.expand_occurrences(date(2026, 11, 17), date(2026, 11, 26))
    occ_dates = [o["occ_date"] for o in occs]
    assert "2026-11-17" in occ_dates
    assert "2026-11-19" in occ_dates
    assert "2026-11-24" in occ_dates
    assert "2026-11-26" in occ_dates
    assert "2026-11-18" not in occ_dates # Wednesday should not match

def test_skipped_date_exception(sched_suite, qapp):
    sec, db = sched_suite

    with db.get_connection():
        cur = db.execute("""
            INSERT INTO schedule_events 
            (title, category, start_date, end_date, start_time, end_time, all_day, repeat_type, rrule_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("Daily Standup", "Work", "2026-11-18", "2026-11-18", "09:00", "09:30", 0, "Daily", "FREQ=DAILY"))
        ev_id = cur.lastrowid

    # Skip 2026-11-20
    sec.add_skip_date(ev_id, "2026-11-20")

    occs = sec.expand_occurrences(date(2026, 11, 18), date(2026, 11, 22))
    occ_dates = [o["occ_date"] for o in occs]
    assert "2026-11-18" in occ_dates
    assert "2026-11-19" in occ_dates
    assert "2026-11-20" not in occ_dates # Skipped!
    assert "2026-11-21" in occ_dates

def test_until_date_truncation(sched_suite, qapp):
    sec, db = sched_suite

    with db.get_connection():
        cur = db.execute("""
            INSERT INTO schedule_events 
            (title, category, start_date, end_date, start_time, end_time, all_day, repeat_type, rrule_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, ("Yoga", "Personal", "2026-11-01", "2026-11-01", "07:00", "08:00", 0, "Daily", "FREQ=DAILY"))
        ev_id = cur.lastrowid

    # Truncate before 2026-11-10
    sec.truncate_until_date(ev_id, "2026-11-10")

    occs = sec.expand_occurrences(date(2026, 11, 1), date(2026, 11, 15))
    occ_dates = [o["occ_date"] for o in occs]
    assert "2026-11-09" in occ_dates
    assert "2026-11-10" not in occ_dates
    assert "2026-11-11" not in occ_dates

def test_conflict_detection(sched_suite, qapp):
    sec, db = sched_suite

    with db.get_connection():
        db.execute("""
            INSERT INTO schedule_events 
            (title, category, start_date, end_date, start_time, end_time, all_day, repeat_type, rrule_str)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'None', '')
        """, ("Team Sync", "Work", "2026-11-20", "2026-11-20", "14:00", "15:00", 0))

    # Overlapping from 14:30 to 15:30
    conflicts = sec.detect_conflicts(date(2026, 11, 20), "14:30", "15:30")
    assert len(conflicts) > 0
    assert conflicts[0]["title"] == "Team Sync"

    # Non-overlapping from 15:00 to 16:00
    no_conflicts = sec.detect_conflicts(date(2026, 11, 20), "15:00", "16:00")
    assert len(no_conflicts) == 0
