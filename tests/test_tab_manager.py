"""Tests for TabManager tab tracking, deduplication, and lifecycle."""
import pytest
from PySide6.QtWidgets import QApplication, QTabWidget, QMainWindow
from app.core.db import DatabaseManager
from app.core.registry import SectionRegistry
from app.core.tab_manager import TabManager, TabKind
from app.sections.linkedin import LinkedInSection

@pytest.fixture(scope="session")
def qapp():
    app = QApplication.instance()
    if app is None:
        app = QApplication([])
    return app

@pytest.fixture
def test_setup(qapp, tmp_path):
    db_path = str(tmp_path / "test_tabs.db")
    db = DatabaseManager(db_path)
    registry = SectionRegistry(db)
    registry.register(LinkedInSection)

    mw = QMainWindow()
    tab_widget = QTabWidget(mw)
    tab_mgr = TabManager(tab_widget, registry, mw)
    return mw, tab_mgr, registry, db

def test_tab_open_deduplication(test_setup):
    mw, tab_mgr, registry, db = test_setup
    
    # Open LIST tab
    w1 = tab_mgr.open_tab("linkedin", TabKind.LIST)
    assert tab_mgr.tab_widget.count() == 1
    
    # Open same tab again -> should focus existing and not add a new tab
    w2 = tab_mgr.open_tab("linkedin", TabKind.LIST)
    assert tab_mgr.tab_widget.count() == 1
    assert w1 == w2

def test_tab_dirty_and_convert(test_setup):
    mw, tab_mgr, registry, db = test_setup
    
    # Open LIST tab first
    w_list = tab_mgr.open_tab("linkedin", TabKind.LIST)
    assert tab_mgr.tab_widget.count() == 1

    # Open CREATE tab
    w_create = tab_mgr.open_tab("linkedin", TabKind.CREATE)
    assert tab_mgr.tab_widget.count() == 2 # 1 LIST + 1 CREATE
    
    meta = tab_mgr.get_tab_meta(w_create)
    assert meta["kind"] == TabKind.CREATE
    
    # Set dirty
    tab_mgr.set_tab_dirty(w_create, True)
    assert "*" in tab_mgr.tab_widget.tabText(tab_mgr.tab_widget.indexOf(w_create))

    # Convert to editor
    tab_mgr.convert_create_to_editor(w_create, 42, "Post 42")
    meta_after = tab_mgr.get_tab_meta(w_create)
    assert meta_after["kind"] == TabKind.EDITOR
    assert meta_after["item_id"] == 42
    assert "Post 42" in tab_mgr.tab_widget.tabText(tab_mgr.tab_widget.indexOf(w_create))
