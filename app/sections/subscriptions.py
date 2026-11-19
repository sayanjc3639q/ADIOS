"""Subscriptions section for ADIOS.

Features:
- name, cost, billing cycle (Monthly/Yearly/Weekly/Quarterly), renewal date
- usage rating 1-5, computed cost-per-use
- status (active / cancelled)
- Dashboard: renewals in the next 14 days
- Sortable QTableView, Quick filter & Status filter
- Unified Editor/Create Form
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date, timedelta

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QDoubleSpinBox, QSpinBox, QMessageBox, QHeaderView,
    QSplitter, QGroupBox, QCheckBox
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate, QSize
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind
from app.core.svg_icons import SvgIconPack, CUSTOMIZABLE_ICONS
from app.ui.widgets.item_panels import ItemPanelsWidget


BILLING_CYCLES = ["Monthly", "Yearly", "Quarterly", "Weekly"]
SUB_STATUS = ["Active", "Cancelled"]


class SubscriptionsTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Name", "Cost", "Cycle", "Renewal Date", "Usage (1-5)", "Cost/Use", "Status"]

    def rowCount(self, parent=QModelIndex()):
        return len(self._data)

    def columnCount(self, parent=QModelIndex()):
        return len(self._headers)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid():
            return None
        item = self._data[index.row()]
        col = index.column()

        if role == Qt.ItemDataRole.DecorationRole and col == 1:
            # Provide vector SVG icon matching provider (built-in or user-added)
            from app.core.svg_icons import SvgIconPack
            name = (item.get("name") or "").lower()
            # Check user-defined or built-in providers
            clean_token = "".join(ch for ch in name if ch.isalnum() or ch == '_')
            possible_key = f"provider_{clean_token}"
            matched_icon = SvgIconPack.get(possible_key, size=18)
            if not matched_icon.isNull():
                return matched_icon

            if "netflix" in name:
                return SvgIconPack.get("provider_netflix", size=18)
            elif "spotify" in name:
                return SvgIconPack.get("provider_spotify", size=18)
            elif "github" in name:
                return SvgIconPack.get("provider_github", size=18)
            elif "openai" in name or "chatgpt" in name or "gpt" in name:
                return SvgIconPack.get("provider_openai", size=18)
            elif "youtube" in name:
                return SvgIconPack.get("provider_youtube", size=18)
            elif "figma" in name:
                return SvgIconPack.get("provider_figma", size=18)
            elif "adobe" in name:
                return SvgIconPack.get("provider_adobe", size=18)
            elif "aws" in name or "amazon" in name:
                return SvgIconPack.get("provider_aws", size=18)
            elif "google" in name or "gemini" in name:
                return SvgIconPack.get("provider_google", size=18)
            return SvgIconPack.get("provider_generic", size=18)

        if role != Qt.ItemDataRole.DisplayRole:
            return None
        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("name")
        elif col == 2:
            return f"${item.get('cost', 0.0):.2f}"
        elif col == 3:
            return item.get("billing_cycle")
        elif col == 4:
            return item.get("renewal_date") or "-"
        elif col == 5:
            return f"{item.get('usage_rating', 3)} / 5"
        elif col == 6:
            cpu = item.get("cost_per_use")
            return f"${cpu:.2f}" if cpu is not None else "-"
        elif col == 7:
            return item.get("status")
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("id") or 0,
            1: lambda x: (x.get("name") or "").lower(),
            2: lambda x: float(x.get("cost") or 0.0),
            3: lambda x: x.get("billing_cycle") or "",
            4: lambda x: x.get("renewal_date") or "",
            5: lambda x: int(x.get("usage_rating") or 0),
            6: lambda x: float(x.get("cost_per_use") or 0.0),
            7: lambda x: x.get("status") or "",
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class SubscriptionsListView(QWidget):
    def __init__(self, section: SubscriptionsSection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Subscription")
        self.btn_refresh = QPushButton("Refresh")
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Filter subscription name...")
        self.txt_filter.setFixedWidth(180)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Status:"))
        self.cmb_status = QComboBox()
        self.cmb_status.addItem("All")
        self.cmb_status.addItems(SUB_STATUS)
        top_bar.addWidget(self.cmb_status)

        top_bar.addStretch()
        self.lbl_totals = QLabel("Total Monthly: $0.00")
        top_bar.addWidget(self.lbl_totals)

        layout.addLayout(top_bar)

        self.table = QTableView()
        self.table.setSelectionBehavior(QTableView.SelectionBehavior.SelectRows)
        self.table.setSelectionMode(QTableView.SelectionMode.SingleSelection)
        self.table.setSortingEnabled(True)
        self.table.setAlternatingRowColors(True)
        self.table.setShowGrid(True)
        self.table.verticalHeader().setDefaultSectionSize(26)
        self.table.verticalHeader().setVisible(False)
        self.table.horizontalHeader().setStretchLastSection(True)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_status.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall(
            "SELECT id, name, cost, billing_cycle, renewal_date, usage_rating, estimated_uses_month, status, notes FROM subscriptions ORDER BY renewal_date ASC"
        )
        items = []
        for r in rows:
            it = dict(r)
            # Compute cost per use:
            # Normalize cost to monthly
            cost = float(it.get("cost") or 0.0)
            cycle = it.get("billing_cycle")
            monthly_cost = cost
            if cycle == "Yearly":
                monthly_cost = cost / 12.0
            elif cycle == "Weekly":
                monthly_cost = cost * 4.33
            elif cycle == "Quarterly":
                monthly_cost = cost / 3.0
            it["monthly_cost"] = monthly_cost

            uses = int(it.get("estimated_uses_month") or 0)
            if uses > 0:
                it["cost_per_use"] = monthly_cost / uses
            else:
                # Approximate based on 1-5 usage rating
                rating = int(it.get("usage_rating") or 3)
                estimated_uses = rating * 6 # e.g. 5 rating -> 30 uses/month
                it["cost_per_use"] = monthly_cost / max(1, estimated_uses)
            items.append(it)

        self._all_items = items
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        st = self.cmb_status.currentText()

        filtered = []
        total_monthly = 0.0
        for it in self._all_items:
            if st != "All" and it.get("status") != st:
                continue
            if q and q not in (it.get("name") or "").lower():
                continue
            filtered.append(it)
            if it.get("status") == "Active":
                total_monthly += it.get("monthly_cost", 0.0)

        self.model = SubscriptionsTableModel(filtered)
        self.table.setModel(self.model)
        self.lbl_totals.setText(f"{len(filtered)} items | Active Monthly: ${total_monthly:.2f}")

    def _on_new(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.CREATE)

    def _on_double_click(self, index: QModelIndex):
        if not index.isValid():
            return
        item_id = self.model._data[index.row()]["id"]
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.open_tab(self.section.id, TabKind.EDITOR, item_id=item_id)


CATEGORIES = ["Streaming & Entertainment", "Developer & Tech", "Cloud & Hosting", "Productivity & Office", "AI & Tools", "Health & Fitness", "Other"]


class SubscriptionsFormView(QWidget):
    def __init__(self, section: SubscriptionsSection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Subscription #{item_id}" if item_id else "New Subscription"
        self._loading = False

        splitter = QSplitter(Qt.Orientation.Horizontal, self)
        form_container = QWidget()
        layout = QVBoxLayout(form_container)
        layout.setContentsMargins(12, 12, 12, 12)
        layout.setSpacing(10)

        form = QFormLayout()

        # 1. Provider Selector Dropdown (with vector icon & auto-fill)
        h_provider = QHBoxLayout()
        self.cmb_provider = QComboBox()
        self.cmb_provider.setIconSize(QSize(20, 20))
        self._populate_providers()
        h_provider.addWidget(self.cmb_provider)

        self.lbl_provider_icon = QLabel()
        self.lbl_provider_icon.setFixedSize(24, 24)
        h_provider.addWidget(self.lbl_provider_icon)
        h_provider.addStretch()
        form.addRow("Provider / Service:", h_provider)

        self.txt_name = QLineEdit()
        self.txt_name.setPlaceholderText("e.g. Netflix Premium 4K, GitHub Copilot, Spotify Family")
        form.addRow("Subscription Name*:", self.txt_name)

        # Category and Plan Tier
        h_cat_tier = QHBoxLayout()
        self.cmb_category = QComboBox()
        self.cmb_category.setEditable(True)
        self.cmb_category.addItems(CATEGORIES)
        h_cat_tier.addWidget(QLabel("Category:"))
        h_cat_tier.addWidget(self.cmb_category)

        self.txt_plan_tier = QLineEdit()
        self.txt_plan_tier.setPlaceholderText("e.g. Pro, Individual, Family, Enterprise")
        h_cat_tier.addWidget(QLabel("Plan Tier:"))
        h_cat_tier.addWidget(self.txt_plan_tier)
        form.addRow("Category & Tier:", h_cat_tier)

        h_cost = QHBoxLayout()
        self.spin_cost = QDoubleSpinBox()
        self.spin_cost.setRange(0.0, 99999.0)
        self.spin_cost.setPrefix("$")
        self.spin_cost.setValue(9.99)
        h_cost.addWidget(self.spin_cost)

        self.cmb_cycle = QComboBox()
        self.cmb_cycle.addItems(BILLING_CYCLES)
        h_cost.addWidget(QLabel("Billing Cycle:"))
        h_cost.addWidget(self.cmb_cycle)

        self.cmb_status = QComboBox()
        self.cmb_status.addItems(SUB_STATUS)
        h_cost.addWidget(QLabel("Status:"))
        h_cost.addWidget(self.cmb_status)
        h_cost.addStretch()
        form.addRow("Pricing & Status:", h_cost)

        h_renewal = QHBoxLayout()
        self.date_renewal = QDateEdit()
        self.date_renewal.setCalendarPopup(True)
        self.date_renewal.setDate(QDate.currentDate().addDays(30))
        h_renewal.addWidget(self.date_renewal)

        self.spin_rating = QSpinBox()
        self.spin_rating.setRange(1, 5)
        self.spin_rating.setValue(3)
        h_renewal.addWidget(QLabel("Usage Rating (1-5):"))
        h_renewal.addWidget(self.spin_rating)

        self.spin_uses = QSpinBox()
        self.spin_uses.setRange(0, 500)
        self.spin_uses.setValue(10)
        h_renewal.addWidget(QLabel("Est. Uses/Month:"))
        h_renewal.addWidget(self.spin_uses)
        h_renewal.addStretch()
        form.addRow("Renewal & Usage:", h_renewal)

        # Payment details & URL
        h_pay_url = QHBoxLayout()
        self.txt_payment_method = QLineEdit()
        self.txt_payment_method.setPlaceholderText("e.g. PayPal, Apple Pay, Primary Card (no digits)")
        h_pay_url.addWidget(QLabel("Payment via:"))
        h_pay_url.addWidget(self.txt_payment_method)

        self.txt_url = QLineEdit()
        self.txt_url.setPlaceholderText("https://...")
        h_pay_url.addWidget(QLabel("Manage URL:"))
        h_pay_url.addWidget(self.txt_url)
        form.addRow("Payment & Portal:", h_pay_url)

        self.lbl_calc_cpu = QLabel("Calculated Cost-per-use: $0.00")
        form.addRow("Value Metric:", self.lbl_calc_cpu)

        self.txt_notes = QTextEdit()
        self.txt_notes.setMinimumHeight(100)
        self.txt_notes.setPlaceholderText("Cancellation terms, reminder notes, renewal terms, shared accounts...")
        form.addRow("Terms & Notes:", self.txt_notes)

        layout.addLayout(form)

        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Subscription")
        self.btn_cancel = QPushButton("Cancel")
        self.btn_delete = QPushButton("Delete")
        if not self.item_id:
            self.btn_delete.setVisible(False)

        btn_bar.addWidget(self.btn_save)
        btn_bar.addWidget(self.btn_cancel)
        btn_bar.addSpacing(15)
        btn_bar.addWidget(self.btn_delete)
        btn_bar.addStretch()
        layout.addLayout(btn_bar)

        splitter.addWidget(form_container)

        # Reusable side panels: Tags, Links, Reminders
        self.panels = ItemPanelsWidget("subscriptions", self.item_id, self.section.db, parent=self)
        splitter.addWidget(self.panels)
        splitter.setStretchFactor(0, 3)
        splitter.setStretchFactor(1, 1)

        root = QVBoxLayout(self)
        root.setContentsMargins(0, 0, 0, 0)
        root.addWidget(splitter)

        self.cmb_provider.currentIndexChanged.connect(self._on_provider_changed)
        self.txt_name.textChanged.connect(self._on_dirty)
        self.cmb_category.currentTextChanged.connect(self._on_dirty)
        self.txt_plan_tier.textChanged.connect(self._on_dirty)
        self.spin_cost.valueChanged.connect(self._recalc_and_dirty)
        self.cmb_cycle.currentTextChanged.connect(self._recalc_and_dirty)
        self.cmb_status.currentTextChanged.connect(self._on_dirty)
        self.date_renewal.dateChanged.connect(self._on_dirty)
        self.spin_rating.valueChanged.connect(self._recalc_and_dirty)
        self.spin_uses.valueChanged.connect(self._recalc_and_dirty)
        self.txt_payment_method.textChanged.connect(self._on_dirty)
        self.txt_url.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()
        else:
            self._recalculate_cpu()

    def _populate_providers(self):
        self.cmb_provider.clear()
        import json
        self.cmb_provider.addItem(SvgIconPack.get("provider_generic", size=20), "Custom / Other", "provider_generic")

        # Built-in providers
        for key, label, category in CUSTOMIZABLE_ICONS:
            if category == "Subscription Providers" and key != "provider_generic":
                icon = SvgIconPack.get(key, size=20)
                # Clean label for user display
                clean_name = label.replace(" Provider", "").strip()
                self.cmb_provider.addItem(icon, clean_name, key)

        # User added providers
        try:
            raw = self.section.db.get_setting("custom_icon_entries", "[]")
            entries = json.loads(raw)
            for u in entries:
                if u.get("category") == "Subscription Providers":
                    icon = SvgIconPack.get(u["key"], size=20)
                    self.cmb_provider.addItem(icon, u["label"], u["key"])
        except Exception:
            pass

    def _on_provider_changed(self):
        key = self.cmb_provider.currentData()
        name = self.cmb_provider.currentText()
        if key and key != "provider_generic":
            # Auto populate name if empty or previously matching a provider
            if not self.txt_name.text().strip() or not self.item_id:
                self.txt_name.setText(name)
            # Update icon preview label
            pix = SvgIconPack.get(key, size=24).pixmap(24, 24)
            self.lbl_provider_icon.setPixmap(pix)
        else:
            pix = SvgIconPack.get("provider_generic", size=24).pixmap(24, 24)
            self.lbl_provider_icon.setPixmap(pix)
        self._on_dirty()

    def _recalc_and_dirty(self):
        self._recalculate_cpu()
        self._on_dirty()

    def _recalculate_cpu(self):
        cost = self.spin_cost.value()
        cycle = self.cmb_cycle.currentText()
        monthly = cost
        if cycle == "Yearly":
            monthly = cost / 12.0
        elif cycle == "Weekly":
            monthly = cost * 4.33
        elif cycle == "Quarterly":
            monthly = cost / 3.0

        uses = self.spin_uses.value()
        if uses == 0:
            uses = self.spin_rating.value() * 6
        cpu = monthly / max(1, uses)
        self.lbl_calc_cpu.setText(f"Calculated Cost-per-use: ${cpu:.2f} (Monthly Equivalent: ${monthly:.2f})")

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM subscriptions WHERE id = ?", (self.item_id,))
            if row:
                name_val = row["name"] or ""
                self.txt_name.setText(name_val)
                # Try to select corresponding provider from dropdown
                for i in range(self.cmb_provider.count()):
                    p_text = self.cmb_provider.itemText(i).lower()
                    if p_text in name_val.lower() and p_text != "custom / other":
                        self.cmb_provider.setCurrentIndex(i)
                        break
                self.spin_cost.setValue(float(row["cost"] or 0.0))
                idx_c = self.cmb_cycle.findText(row["billing_cycle"] or "Monthly")
                if idx_c != -1:
                    self.cmb_cycle.setCurrentIndex(idx_c)
                idx_s = self.cmb_status.findText(row["status"] or "Active")
                if idx_s != -1:
                    self.cmb_status.setCurrentIndex(idx_s)

                r_str = row["renewal_date"]
                if r_str:
                    qd = QDate.fromString(r_str, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_renewal.setDate(qd)

                # Extended fields
                if "category" in row.keys() and row["category"]:
                    idx_cat = self.cmb_category.findText(row["category"])
                    if idx_cat != -1:
                        self.cmb_category.setCurrentIndex(idx_cat)
                    else:
                        self.cmb_category.setEditText(row["category"])
                if "plan_tier" in row.keys() and row["plan_tier"]:
                    self.txt_plan_tier.setText(row["plan_tier"])
                if "payment_method" in row.keys() and row["payment_method"]:
                    self.txt_payment_method.setText(row["payment_method"])
                if "manage_url" in row.keys() and row["manage_url"]:
                    self.txt_url.setText(row["manage_url"])

                self.spin_rating.setValue(int(row["usage_rating"] or 3))
                self.spin_uses.setValue(int(row["estimated_uses_month"] or 10))
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = row["name"] or f"Subscription #{self.item_id}"
                self._recalculate_cpu()

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        name = self.txt_name.text().strip()
        if not name:
            QMessageBox.warning(self, "Validation Error", "Subscription name cannot be empty.")
            return False

        cost = self.spin_cost.value()
        cycle = self.cmb_cycle.currentText()
        status = self.cmb_status.currentText()
        renewal_date = self.date_renewal.date().toString(Qt.DateFormat.ISODate)
        rating = self.spin_rating.value()
        uses = self.spin_uses.value()
        category = self.cmb_category.currentText().strip() or "Other"
        plan_tier = self.txt_plan_tier.text().strip()
        payment_method = self.txt_payment_method.text().strip()
        manage_url = self.txt_url.text().strip()
        notes = self.txt_notes.toPlainText()

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO subscriptions 
                       (name, cost, billing_cycle, renewal_date, usage_rating, estimated_uses_month, 
                        category, plan_tier, payment_method, manage_url, status, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (name, cost, cycle, renewal_date, rating, uses, category, plan_tier, payment_method, manage_url, status, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = name

                # Renewal reminder 3 days prior
                try:
                    ren_dt = datetime.strptime(renewal_date, "%Y-%m-%d")
                    rem_dt = (ren_dt - timedelta(days=3)).strftime("%Y-%m-%d 09:00:00")
                    self.section.db.execute(
                        "INSERT INTO reminders (item_type, item_id, title, remind_at) VALUES (?, ?, ?, ?)",
                        ("subscriptions", self.item_id, f"Subscription Renewal: {name} in 3 days (${cost:.2f})", rem_dt)
                    )
                except Exception:
                    pass

            if hasattr(self, "panels"):
                self.panels.update_item_id(self.item_id)

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, name)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE subscriptions 
                       SET name = ?, cost = ?, billing_cycle = ?, renewal_date = ?, 
                           usage_rating = ?, estimated_uses_month = ?, category = ?, 
                           plan_tier = ?, payment_method = ?, manage_url = ?, status = ?, notes = ?
                       WHERE id = ?""",
                    (name, cost, cycle, renewal_date, rating, uses, category, plan_tier, payment_method, manage_url, status, notes, self.item_id)
                )
                self.item_title = name

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Subscription saved successfully.")
        return True

    def _on_cancel(self):
        window = self.window()
        if hasattr(window, "tab_manager"):
            idx = window.tab_manager.tab_widget.indexOf(self)
            if idx != -1:
                window.tab_manager.close_tab_by_index(idx)

    def _on_delete(self):
        if not self.item_id:
            return
        reply = QMessageBox.question(
            self, "Confirm Delete", "Are you sure you want to delete this subscription?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM subscriptions WHERE id = ?", (self.item_id,))
                self.section.db.execute("DELETE FROM reminders WHERE item_type = 'subscriptions' AND item_id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class SubscriptionsSection(BaseSection):
    id = "subscriptions"
    name = "Subscriptions"
    icon_name = "card"
    shortcut = "Alt+4"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS subscriptions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    cost REAL DEFAULT 0.0,
                    billing_cycle TEXT DEFAULT 'Monthly',
                    renewal_date TEXT,
                    usage_rating INTEGER DEFAULT 3,
                    estimated_uses_month INTEGER DEFAULT 10,
                    category TEXT DEFAULT 'Other',
                    plan_tier TEXT,
                    payment_method TEXT,
                    manage_url TEXT,
                    status TEXT DEFAULT 'Active',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            cur = self.db.execute("PRAGMA table_info(subscriptions)")
            cols = [c[1] for c in cur.fetchall()]
            if "category" not in cols:
                self.db.execute("ALTER TABLE subscriptions ADD COLUMN category TEXT DEFAULT 'Other'")
            if "plan_tier" not in cols:
                self.db.execute("ALTER TABLE subscriptions ADD COLUMN plan_tier TEXT")
            if "payment_method" not in cols:
                self.db.execute("ALTER TABLE subscriptions ADD COLUMN payment_method TEXT")
            if "manage_url" not in cols:
                self.db.execute("ALTER TABLE subscriptions ADD COLUMN manage_url TEXT")

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return SubscriptionsListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return SubscriptionsFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return SubscriptionsFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            
            today_str = date.today().isoformat()
            limit_str = (date.today() + timedelta(days=14)).isoformat()

            rows = self.db.fetchall(
                """SELECT id, name, cost, renewal_date FROM subscriptions 
                   WHERE status = 'Active' AND renewal_date >= ? AND renewal_date <= ?
                   ORDER BY renewal_date ASC""",
                (today_str, limit_str)
            )
            if not rows:
                l.addWidget(QLabel("No renewals in next 14 days."))
            else:
                for r in rows:
                    btn = QPushButton(f"{r['name']} (${r['cost']:.2f}) on {r['renewal_date']}")
                    iid = r["id"]
                    btn.clicked.connect(lambda ch=False, x=iid: w.window().tab_manager.open_tab(self.id, TabKind.EDITOR, item_id=x) if hasattr(w.window(), "tab_manager") else None)
                    l.addWidget(btn)
            return w

        return [{
            "id": "sub_renewals",
            "name": "Renewals Next 14 Days",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall(
            "SELECT id, name, cost, billing_cycle, notes FROM subscriptions WHERE name LIKE ? OR notes LIKE ?",
            (f"%{query}%", f"%{query}%")
        )
        return [{
            "id": r["id"],
            "title": f"Subscription: {r['name']} (${r['cost']:.2f}/{r['billing_cycle']})",
            "snippet": (r["notes"] or "")[:100],
            "section_id": self.id
        } for r in rows]
