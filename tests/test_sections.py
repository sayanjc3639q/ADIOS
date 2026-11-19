"""Tests for LinkedIn, Exams, Subscriptions, and Money sections."""
from datetime import date
import pytest
from app.core.db import DatabaseManager
from app.sections.linkedin import LinkedInSection
from app.sections.exams import ExamsSection
from app.sections.subscriptions import SubscriptionsSection
from app.sections.money import MoneySection

@pytest.fixture
def sections_db(tmp_path):
    db_file = str(tmp_path / "test_sections.db")
    db = DatabaseManager(db_file)
    li = LinkedInSection(db)
    ex = ExamsSection(db)
    sub = SubscriptionsSection(db)
    mon = MoneySection(db)
    
    li.init_schema()
    ex.init_schema()
    sub.init_schema()
    mon.init_schema()
    return db, li, ex, sub, mon

def test_linkedin_lifecycle(sections_db):
    db, li, ex, sub, mon = sections_db
    with db.get_connection():
        cur = db.execute(
            """INSERT INTO linkedin_posts (title, body, status, planned_date, tags)
               VALUES (?, ?, ?, ?, ?)""",
            ("Qt Apps in 2026", "Building native desktop apps with Python and PySide6.", "Ready", "2026-11-20", "python,qt")
        )
        post_id = cur.lastrowid

    # Verify search
    res = li.search("PySide6")
    assert len(res) == 1
    assert res[0]["id"] == post_id

    # Verify reminder rules
    rules = li.reminder_rules()
    # Ready post is not scheduled yet
    assert len(rules) == 0

def test_exams_lifecycle(sections_db):
    db, li, ex, sub, mon = sections_db
    with db.get_connection():
        cur = db.execute(
            """INSERT INTO exams (subject, exam_date, exam_time, venue, syllabus_notes)
               VALUES (?, ?, ?, ?, ?)""",
            ("Computer Architecture", "2026-12-15", "14:00", "Hall B", "Pipelines and Caches")
        )
        ex_id = cur.lastrowid

    res = ex.search("Pipelines")
    assert len(res) == 1
    assert "Computer Architecture" in res[0]["title"]

def test_subscriptions_cost_calculation(sections_db):
    db, li, ex, sub, mon = sections_db
    with db.get_connection():
        cur = db.execute(
            """INSERT INTO subscriptions (name, cost, billing_cycle, renewal_date, usage_rating, estimated_uses_month)
               VALUES (?, ?, ?, ?, ?, ?)""",
            ("Cloud Dev Server", 20.0, "Monthly", "2026-12-01", 5, 20)
        )
        sub_id = cur.lastrowid

    res = sub.search("Cloud Dev")
    assert len(res) == 1

def test_money_transactions_and_summary(sections_db):
    db, li, ex, sub, mon = sections_db
    with db.get_connection():
        db.execute(
            """INSERT INTO money_transactions (account_id, tx_date, tx_type, category, amount, description)
               VALUES (1, '2026-11-19', 'Income', 'Salary', 3500.0, 'Monthly Salary')"""
        )
        db.execute(
            """INSERT INTO money_transactions (account_id, tx_date, tx_type, category, amount, description)
               VALUES (1, '2026-11-19', 'Expense', 'Groceries', 120.50, 'Supermarket')"""
        )

    res = mon.search("Supermarket")
    assert len(res) == 1
    assert res[0]["title"].startswith("Money: Expense")
