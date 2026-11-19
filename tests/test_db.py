"""Tests for database layer, migrations, and settings."""
import os
import tempfile
import pytest
from app.core.db import DatabaseManager

@pytest.fixture
def temp_db():
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    db = DatabaseManager(path)
    yield db
    db.close()
    if os.path.exists(path):
        os.remove(path)

def test_db_init(temp_db):
    row = temp_db.fetchone("SELECT MAX(version) FROM schema_version")
    assert row[0] >= 1

def test_db_settings(temp_db):
    temp_db.set_setting("test_key", "test_val")
    val = temp_db.get_setting("test_key")
    assert val == "test_val"

def test_db_crud(temp_db):
    with temp_db.get_connection():
        cur = temp_db.execute("INSERT INTO tags (name, color) VALUES (?, ?)", ("Important", "#FF0000"))
        tag_id = cur.lastrowid
    
    row = temp_db.fetchone("SELECT * FROM tags WHERE id = ?", (tag_id,))
    assert row is not None
    assert row["name"] == "Important"
    assert row["color"] == "#FF0000"
