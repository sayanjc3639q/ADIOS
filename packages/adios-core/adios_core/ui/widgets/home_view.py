"""Home tab view displaying key summaries, stats, and quick actions."""
from __future__ import annotations
from typing import Any
from datetime import date, datetime
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QGridLayout, QLabel, QGroupBox,
    QListWidget, QListWidgetItem, QPushButton, QFrame, QScrollArea, QSizePolicy
)
from PySide6.QtCore import Qt, QSize
from app.core.icons import WinIcons


class HomeView(QWidget):
    def __init__(self, registry: Any, tab_manager: Any, parent=None):
        super().__init__(parent)
        self.registry = registry
        self.tab_manager = tab_manager

        # Wrap in scroll area so small screens or dock expansions never cut off or produce horizontal scrollbars
        outer_layout = QVBoxLayout(self)
        outer_layout.setContentsMargins(0, 0, 0, 0)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)
        outer_layout.addWidget(scroll)

        container = QWidget()
        scroll.setWidget(container)

        main_layout = QVBoxLayout(container)
        main_layout.setContentsMargins(20, 18, 20, 18)
        main_layout.setSpacing(18)

        # 1. Header Bar with Greeting & Quick Action Buttons
        header_frame = QFrame()
        header_frame.setStyleSheet("""
            QFrame {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 4px 12px;
            }
        """)
        header_layout = QHBoxLayout(header_frame)
        header_layout.setContentsMargins(12, 10, 12, 10)

        greeting_box = QVBoxLayout()
        greeting_box.setSpacing(3)

        self.lbl_title = QLabel("Welcome to ADIOS")
        self.lbl_title.setStyleSheet("font-size: 20px; font-weight: 700; color: #0f172a;")

        today_formatted = datetime.now().strftime("%A, %B %d, %Y")
        self.lbl_subtitle = QLabel(f"Personal Desktop Command Center · {today_formatted}")
        self.lbl_subtitle.setStyleSheet("font-size: 13px; color: #64748b; font-weight: 400;")

        greeting_box.addWidget(self.lbl_title)
        greeting_box.addWidget(self.lbl_subtitle)
        header_layout.addLayout(greeting_box)

        header_layout.addStretch()

        # Action Buttons
        btn_refresh = QPushButton(" Refresh")
        btn_refresh.setIcon(WinIcons.get("refresh"))
        btn_refresh.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_refresh.setStyleSheet("""
            QPushButton {
                background: #ffffff;
                color: #0f172a;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                padding: 6px 14px;
                font-weight: 500;
                font-size: 13px;
            }
            QPushButton:hover {
                background: #f1f5f9;
                border-color: #94a3b8;
            }
        """)
        btn_refresh.clicked.connect(self.refresh)
        header_layout.addWidget(btn_refresh)

        main_layout.addWidget(header_frame)

        # 2. Key Metrics / Stat Cards Banner (Adaptive grid)
        self.metrics_layout = QGridLayout()
        self.metrics_layout.setSpacing(12)

        self.card_events = self._create_metric_card("TODAY'S SCHEDULE", "0 Events", "#0284c7")
        self.card_exams = self._create_metric_card("UPCOMING EXAMS", "0 Active", "#dc2626")
        self.card_posts = self._create_metric_card("LINKEDIN QUEUE", "0 Posts", "#2563eb")
        self.card_money = self._create_metric_card("SUBSCRIPTIONS", "Active", "#16a34a")

        self.metrics_layout.addWidget(self.card_events, 0, 0)
        self.metrics_layout.addWidget(self.card_exams, 0, 1)
        self.metrics_layout.addWidget(self.card_posts, 0, 2)
        self.metrics_layout.addWidget(self.card_money, 0, 3)
        main_layout.addLayout(self.metrics_layout)

        # 3. Two-Column Dashboard Content Grid
        content_grid = QGridLayout()
        content_grid.setSpacing(16)

        # Left Column: Today's Schedule & Events
        self.box_events = QGroupBox(" Today's Schedule & Events")
        self.box_events.setStyleSheet(self._group_box_style())
        layout_events = QVBoxLayout(self.box_events)
        layout_events.setContentsMargins(10, 12, 10, 10)
        self.list_events = QListWidget()
        self.list_events.setWordWrap(True)
        self.list_events.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.list_events.setStyleSheet(self._list_widget_style())
        layout_events.addWidget(self.list_events)
        content_grid.addWidget(self.box_events, 0, 0)

        # Right Column Top: Upcoming Exams & Deadlines
        self.box_tasks = QGroupBox(" Upcoming Exams & Academic Deadlines")
        self.box_tasks.setStyleSheet(self._group_box_style())
        layout_tasks = QVBoxLayout(self.box_tasks)
        layout_tasks.setContentsMargins(10, 12, 10, 10)
        self.list_tasks = QListWidget()
        self.list_tasks.setWordWrap(True)
        self.list_tasks.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.list_tasks.setStyleSheet(self._list_widget_style())
        layout_tasks.addWidget(self.list_tasks)
        content_grid.addWidget(self.box_tasks, 0, 1)

        # Left Column Bottom: LinkedIn & Content Pipeline
        self.box_posts = QGroupBox(" LinkedIn & Content Pipeline")
        self.box_posts.setStyleSheet(self._group_box_style())
        layout_posts = QVBoxLayout(self.box_posts)
        layout_posts.setContentsMargins(10, 12, 10, 10)
        self.list_posts = QListWidget()
        self.list_posts.setWordWrap(True)
        self.list_posts.setHorizontalScrollBarPolicy(Qt.ScrollBarPolicy.ScrollBarAlwaysOff)
        self.list_posts.setStyleSheet(self._list_widget_style())
        layout_posts.addWidget(self.list_posts)
        content_grid.addWidget(self.box_posts, 1, 0)

        # Right Column Bottom: Quick Navigation Hub
        self.box_launcher = QGroupBox(" Quick Navigation Hub")
        self.box_launcher.setStyleSheet(self._group_box_style())
        layout_launcher = QGridLayout(self.box_launcher)
        layout_launcher.setContentsMargins(14, 14, 14, 14)
        layout_launcher.setSpacing(10)

        quick_sections = [
            ("schedule", "Schedule", "schedule"),
            ("exams", "Exams", "exams"),
            ("linkedin", "LinkedIn", "linkedin"),
            ("money", "Finance", "money"),
            ("subscriptions", "Subscriptions", "subscriptions"),
            ("projects", "Projects", "projects"),
        ]

        for idx, (sec_id, label, icon_key) in enumerate(quick_sections):
            btn = QPushButton(f" {label}")
            btn.setIcon(WinIcons.get(icon_key))
            btn.setIconSize(QSize(18, 18))
            btn.setCursor(Qt.CursorShape.PointingHandCursor)
            btn.setStyleSheet("""
                QPushButton {
                    background: #f8fafc;
                    color: #1e293b;
                    border: 1px solid #cbd5e1;
                    border-radius: 6px;
                    padding: 10px 14px;
                    text-align: left;
                    font-size: 13px;
                    font-weight: 500;
                }
                QPushButton:hover {
                    background: #f1f5f9;
                    border-color: #0284c7;
                    color: #0284c7;
                }
            """)
            btn.clicked.connect(lambda ch=False, s=sec_id: self._open_section(s))
            r = idx // 2
            c = idx % 2
            layout_launcher.addWidget(btn, r, c)

        content_grid.addWidget(self.box_launcher, 1, 1)

        main_layout.addLayout(content_grid)

        # Wire click signals
        self.list_events.itemDoubleClicked.connect(self._on_item_double_clicked)
        self.list_tasks.itemDoubleClicked.connect(self._on_item_double_clicked)
        self.list_posts.itemDoubleClicked.connect(self._on_item_double_clicked)

        self.refresh()

    def _group_box_style(self) -> str:
        return """
            QGroupBox {
                font-weight: 600;
                font-size: 14px;
                color: #0f172a;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                margin-top: 8px;
                padding-top: 10px;
                background: #ffffff;
            }
            QGroupBox::title {
                subcontrol-origin: margin;
                left: 12px;
                padding: 0 6px;
            }
        """

    def _list_widget_style(self) -> str:
        return """
            QListWidget {
                border: none;
                background: transparent;
                font-size: 13.5px;
            }
            QListWidget::item {
                padding: 8px 10px;
                border-bottom: 1px solid #f1f5f9;
                border-radius: 4px;
            }
            QListWidget::item:hover {
                background: #f8fafc;
            }
        """

    def _create_metric_card(self, title: str, val: str, accent_color: str) -> QFrame:
        card = QFrame()
        card.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)
        card.setStyleSheet(f"""
            QFrame {{
                background: #ffffff;
                border: 1px solid #e2e8f0;
                border-left: 4px solid {accent_color};
                border-radius: 6px;
                padding: 4px 10px;
            }}
        """)
        layout = QVBoxLayout(card)
        layout.setContentsMargins(6, 6, 6, 6)
        layout.setSpacing(2)

        lbl_top = QLabel(title)
        lbl_top.setStyleSheet("font-size: 11px; font-weight: 600; color: #64748b; letter-spacing: 0.05em;")
        lbl_val = QLabel(val)
        lbl_val.setObjectName("val_label")
        lbl_val.setStyleSheet("font-size: 16px; font-weight: 700; color: #0f172a;")

        layout.addWidget(lbl_top)
        layout.addWidget(lbl_val)
        return card

    def _open_section(self, section_id: str):
        from app.core.tab_manager import TabKind
        self.tab_manager.open_tab(section_id, TabKind.LIST)

    def refresh(self):
        self.list_events.clear()
        self.list_tasks.clear()
        self.list_posts.clear()

        today_str = date.today().isoformat()

        # 1. Schedule / Events
        sched_sec = self.registry.get("schedule")
        event_count = 0
        if sched_sec:
            rows = self.registry.db.fetchall("""
                SELECT id, title, start_date, start_time, all_day, location
                FROM schedule_events
                WHERE archived = 0 AND (start_date = ? OR (start_date >= ? AND start_date <= ?))
                ORDER BY start_date ASC, start_time ASC
                LIMIT 8
            """, (today_str, today_str, (date.today()).isoformat()))
            
            for r in rows:
                event_count += 1
                t_str = "All Day" if r["all_day"] else (r["start_time"] or "Scheduled")
                item = QListWidgetItem(f"🕒 {t_str} — {r['title']} ({r.get('location') or 'Local'})")
                item.setData(Qt.ItemDataRole.UserRole, ("schedule", r["id"]))
                self.list_events.addItem(item)
            
            if not rows:
                self.list_events.addItem("No schedule events for today. Use the Quick Navigation hub below to plan ahead.")
        else:
            self.list_events.addItem("Schedule module active. No pending events.")

        val_lbl = self.card_events.findChild(QLabel, "val_label")
        if val_lbl:
            val_lbl.setText(f"{event_count} Today" if event_count > 0 else "Clear Today")

        # 2. Upcoming Exams & Academic Tasks
        exam_sec = self.registry.get("exams")
        exam_count = 0
        if exam_sec:
            rows = self.registry.db.fetchall("""
                SELECT id, subject, exam_type, exam_date, exam_time, venue 
                FROM exams 
                WHERE status != 'Completed'
                ORDER BY exam_date ASC 
                LIMIT 5
            """)
            for r in rows:
                exam_count += 1
                days_txt = f" on {r['exam_date']}" if r.get('exam_date') else ""
                item = QListWidgetItem(f"📚 {r['subject']} ({r.get('exam_type') or 'Exam'}){days_txt} · {r.get('venue') or 'Campus'}")
                item.setData(Qt.ItemDataRole.UserRole, ("exams", r["id"]))
                self.list_tasks.addItem(item)
            if not rows:
                self.list_tasks.addItem("No upcoming exams scheduled. All completed.")
        else:
            self.list_tasks.addItem("Exams section ready.")

        val_lbl = self.card_exams.findChild(QLabel, "val_label")
        if val_lbl:
            val_lbl.setText(f"{exam_count} Scheduled" if exam_count > 0 else "0 Upcoming")

        # 3. LinkedIn Posts & Content
        li_sec = self.registry.get("linkedin")
        post_count = 0
        if li_sec:
            rows = self.registry.db.fetchall("""
                SELECT id, title, status, planned_date 
                FROM linkedin_posts 
                WHERE status IN ('Ready', 'Scheduled', 'Drafting') 
                ORDER BY planned_date ASC 
                LIMIT 5
            """)
            for r in rows:
                post_count += 1
                badge = f"[{r['status']}]"
                dt = f" · Planned: {r['planned_date']}" if r.get('planned_date') else ""
                item = QListWidgetItem(f"💼 {badge} {r['title']}{dt}")
                item.setData(Qt.ItemDataRole.UserRole, ("linkedin", r["id"]))
                self.list_posts.addItem(item)
            if not rows:
                self.list_posts.addItem("No content drafts or scheduled posts.")
        else:
            self.list_posts.addItem("LinkedIn pipeline ready.")

        val_lbl = self.card_posts.findChild(QLabel, "val_label")
        if val_lbl:
            val_lbl.setText(f"{post_count} In Pipeline" if post_count > 0 else "Empty Queue")

        # 4. Money & Subscriptions
        sub_sec = self.registry.get("subscriptions")
        if sub_sec:
            rows = self.registry.db.fetchall("SELECT COUNT(*) as cnt FROM subscriptions WHERE status = 'Active'")
            cnt = rows[0]["cnt"] if rows else 0
            val_lbl = self.card_money.findChild(QLabel, "val_label")
            if val_lbl:
                val_lbl.setText(f"{cnt} Active" if cnt > 0 else "Active")

    def _on_item_double_clicked(self, item: QListWidgetItem):
        data = item.data(Qt.ItemDataRole.UserRole)
        if data:
            sec_id, item_id = data
            from app.core.tab_manager import TabKind
            self.tab_manager.open_tab(sec_id, TabKind.VIEW, item_id=item_id)
