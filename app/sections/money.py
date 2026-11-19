"""Money section for ADIOS.

Features:
- Accounts (Name, Initial Balance, Type)
- Transactions (Income / Expense / Transfer)
- Categories
- Monthly budget per category
- Monthly summary (Income vs Expense vs Budget)
- NO card numbers or sensitive account digits stored
- QTableView with sorting, quick filter, date & type filter
- Unified Editor/Create Form
"""
from __future__ import annotations
from typing import Optional, List, Dict, Any
from datetime import datetime, date

from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QTableView, QFormLayout, QLineEdit, QTextEdit, QComboBox, 
    QDateEdit, QDoubleSpinBox, QMessageBox, QHeaderView, QTabWidget, QSpinBox
)
from PySide6.QtCore import Qt, QAbstractTableModel, QModelIndex, QDate
from app.core.base_section import BaseSection
from app.core.tab_manager import TabKind


TX_TYPES = ["Expense", "Income", "Transfer"]
DEFAULT_CATEGORIES = [
    "Groceries", "Rent & Utilities", "Dining & Takeout", 
    "Transport", "Subscriptions", "Tech & Gear", "Education", "Entertainment", "Salary", "Freelance", "Other"
]


class MoneyTableModel(QAbstractTableModel):
    def __init__(self, data: List[Dict[str, Any]]):
        super().__init__()
        self._data = data
        self._headers = ["ID", "Date", "Account", "Type", "Category", "Amount", "Description"]

    def rowCount(self, parent=QModelIndex()):
        return len(self._data)

    def columnCount(self, parent=QModelIndex()):
        return len(self._headers)

    def data(self, index, role=Qt.ItemDataRole.DisplayRole):
        if not index.isValid() or role != Qt.ItemDataRole.DisplayRole:
            return None
        item = self._data[index.row()]
        col = index.column()
        if col == 0:
            return item.get("id")
        elif col == 1:
            return item.get("tx_date")
        elif col == 2:
            return item.get("account_name") or "-"
        elif col == 3:
            return item.get("tx_type")
        elif col == 4:
            return item.get("category") or "-"
        elif col == 5:
            amt = float(item.get("amount") or 0.0)
            tt = item.get("tx_type")
            prefix = "+" if tt == "Income" else ("-" if tt == "Expense" else "")
            return f"{prefix}${amt:.2f}"
        elif col == 6:
            return item.get("description") or ""
        return None

    def headerData(self, section, orientation, role=Qt.ItemDataRole.DisplayRole):
        if orientation == Qt.Orientation.Horizontal and role == Qt.ItemDataRole.DisplayRole:
            return self._headers[section]
        return None

    def sort(self, column: int, order: Qt.SortOrder = Qt.SortOrder.AscendingOrder):
        self.layoutAboutToBeChanged.emit()
        key_map = {
            0: lambda x: x.get("id") or 0,
            1: lambda x: x.get("tx_date") or "",
            2: lambda x: (x.get("account_name") or "").lower(),
            3: lambda x: x.get("tx_type") or "",
            4: lambda x: (x.get("category") or "").lower(),
            5: lambda x: float(x.get("amount") or 0.0),
            6: lambda x: (x.get("description") or "").lower(),
        }
        key_fn = key_map.get(column, lambda x: 0)
        self._data.sort(key=key_fn, reverse=(order == Qt.SortOrder.DescendingOrder))
        self.layoutChanged.emit()


class MoneyListView(QWidget):
    def __init__(self, section: MoneySection, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self._all_items: List[Dict[str, Any]] = []

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)

        top_bar = QHBoxLayout()
        self.btn_new = QPushButton("New Transaction")
        self.btn_refresh = QPushButton("Refresh")
        top_bar.addWidget(self.btn_new)
        top_bar.addWidget(self.btn_refresh)
        top_bar.addSpacing(15)

        top_bar.addWidget(QLabel("Filter:"))
        self.txt_filter = QLineEdit()
        self.txt_filter.setPlaceholderText("Description or category...")
        self.txt_filter.setFixedWidth(160)
        top_bar.addWidget(self.txt_filter)

        top_bar.addWidget(QLabel("Type:"))
        self.cmb_type = QComboBox()
        self.cmb_type.addItem("All Types")
        self.cmb_type.addItems(TX_TYPES)
        top_bar.addWidget(self.cmb_type)

        top_bar.addStretch()
        self.lbl_summary = QLabel("Income: $0.00 | Expense: $0.00 | Net: $0.00")
        top_bar.addWidget(self.lbl_summary)

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
        self.table.horizontalHeader().setSectionResizeMode(6, QHeaderView.ResizeMode.Stretch)
        layout.addWidget(self.table)

        self.btn_new.clicked.connect(self._on_new)
        self.btn_refresh.clicked.connect(self.refresh)
        self.txt_filter.textChanged.connect(self._apply_filter)
        self.cmb_type.currentTextChanged.connect(self._apply_filter)
        self.table.doubleClicked.connect(self._on_double_click)

        self.refresh()

    def refresh(self):
        rows = self.section.db.fetchall("""
            SELECT t.id, t.account_id, t.tx_date, t.tx_type, t.category, t.amount, t.description, t.notes,
                   COALESCE(a.name, 'Default') as account_name
            FROM money_transactions t
            LEFT JOIN money_accounts a ON t.account_id = a.id
            ORDER BY t.tx_date DESC, t.id DESC
        """)
        self._all_items = [dict(r) for r in rows]
        self._apply_filter()

    def _apply_filter(self):
        q = self.txt_filter.text().strip().lower()
        tt = self.cmb_type.currentText()

        filtered = []
        tot_inc = 0.0
        tot_exp = 0.0

        for it in self._all_items:
            if tt != "All Types" and it.get("tx_type") != tt:
                continue
            if q:
                desc = (it.get("description") or "").lower()
                cat = (it.get("category") or "").lower()
                acc = (it.get("account_name") or "").lower()
                if q not in desc and q not in cat and q not in acc:
                    continue
            filtered.append(it)

            amt = float(it.get("amount") or 0.0)
            if it.get("tx_type") == "Income":
                tot_inc += amt
            elif it.get("tx_type") == "Expense":
                tot_exp += amt

        self.model = MoneyTableModel(filtered)
        self.table.setModel(self.model)
        net = tot_inc - tot_exp
        self.lbl_summary.setText(f"{len(filtered)} txs | In: +${tot_inc:.2f} | Out: -${tot_exp:.2f} | Net: ${net:.2f}")

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


class MoneyFormView(QWidget):
    def __init__(self, section: MoneySection, item_id: Optional[int] = None, parent: Optional[QWidget] = None):
        super().__init__(parent)
        self.section = section
        self.item_id = item_id
        self.item_title = f"Transaction #{item_id}" if item_id else "New Transaction"
        self._loading = False

        layout = QVBoxLayout(self)
        layout.setContentsMargins(10, 10, 10, 10)
        layout.setSpacing(8)

        form = QFormLayout()

        h_top = QHBoxLayout()
        self.cmb_type = QComboBox()
        self.cmb_type.addItems(TX_TYPES)
        h_top.addWidget(self.cmb_type)

        self.spin_amount = QDoubleSpinBox()
        self.spin_amount.setRange(0.01, 9999999.0)
        self.spin_amount.setPrefix("$")
        self.spin_amount.setValue(10.00)
        h_top.addWidget(QLabel("Amount:"))
        h_top.addWidget(self.spin_amount)

        self.date_tx = QDateEdit()
        self.date_tx.setCalendarPopup(True)
        self.date_tx.setDate(QDate.currentDate())
        h_top.addWidget(QLabel("Date:"))
        h_top.addWidget(self.date_tx)
        h_top.addStretch()
        form.addRow("Type / Amount / Date:", h_top)

        h_cat = QHBoxLayout()
        self.cmb_account = QComboBox()
        self._populate_accounts()
        h_cat.addWidget(QLabel("Account:"))
        h_cat.addWidget(self.cmb_account)

        self.cmb_category = QComboBox()
        self.cmb_category.setEditable(True)
        self.cmb_category.addItems(DEFAULT_CATEGORIES)
        h_cat.addWidget(QLabel("Category:"))
        h_cat.addWidget(self.cmb_category)
        h_cat.addStretch()
        form.addRow("Account / Category:", h_cat)

        self.txt_desc = QLineEdit()
        self.txt_desc.setPlaceholderText("e.g. Weekly grocery run, Coffee, Invoice #123")
        form.addRow("Description:", self.txt_desc)

        self.txt_notes = QTextEdit()
        self.txt_notes.setMaximumHeight(80)
        self.txt_notes.setPlaceholderText("Receipt details, tax notes (no card numbers!)...")
        form.addRow("Notes:", self.txt_notes)

        layout.addLayout(form)

        btn_bar = QHBoxLayout()
        self.btn_save = QPushButton("Save Transaction")
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

        self.cmb_type.currentTextChanged.connect(self._on_dirty)
        self.spin_amount.valueChanged.connect(self._on_dirty)
        self.date_tx.dateChanged.connect(self._on_dirty)
        self.cmb_account.currentTextChanged.connect(self._on_dirty)
        self.cmb_category.currentTextChanged.connect(self._on_dirty)
        self.txt_desc.textChanged.connect(self._on_dirty)
        self.txt_notes.textChanged.connect(self._on_dirty)

        self.btn_save.clicked.connect(self.save_item)
        self.btn_cancel.clicked.connect(self._on_cancel)
        self.btn_delete.clicked.connect(self._on_delete)

        if self.item_id:
            self._load_item()

    def _populate_accounts(self):
        self.cmb_account.clear()
        rows = self.section.db.fetchall("SELECT id, name FROM money_accounts ORDER BY id ASC")
        for r in rows:
            self.cmb_account.addItem(r["name"], r["id"])
        if self.cmb_account.count() == 0:
            self.cmb_account.addItem("Primary Checking", 1)

    def _on_dirty(self):
        if self._loading:
            return
        window = self.window()
        if hasattr(window, "tab_manager"):
            window.tab_manager.set_tab_dirty(self, True)

    def _load_item(self):
        self._loading = True
        try:
            row = self.section.db.fetchone("SELECT * FROM money_transactions WHERE id = ?", (self.item_id,))
            if row:
                t_idx = self.cmb_type.findText(row["tx_type"] or "Expense")
                if t_idx != -1:
                    self.cmb_type.setCurrentIndex(t_idx)

                self.spin_amount.setValue(float(row["amount"] or 0.0))
                
                d_str = row["tx_date"]
                if d_str:
                    qd = QDate.fromString(d_str, Qt.DateFormat.ISODate)
                    if qd.isValid():
                        self.date_tx.setDate(qd)

                # Set account
                acc_id = row["account_id"]
                idx_acc = self.cmb_account.findData(acc_id)
                if idx_acc != -1:
                    self.cmb_account.setCurrentIndex(idx_acc)

                cat = row["category"] or ""
                idx_cat = self.cmb_category.findText(cat)
                if idx_cat != -1:
                    self.cmb_category.setCurrentIndex(idx_cat)
                else:
                    self.cmb_category.setEditText(cat)

                self.txt_desc.setText(row["description"] or "")
                self.txt_notes.setPlainText(row["notes"] or "")
                self.item_title = f"{row['tx_type']}: ${row['amount']:.2f} ({row['description'] or ''})"

                window = self.window()
                if hasattr(window, "tab_manager"):
                    window.tab_manager.set_tab_dirty(self, False)
        finally:
            self._loading = False

    def save_item(self) -> bool:
        amount = self.spin_amount.value()
        if amount <= 0:
            QMessageBox.warning(self, "Validation Error", "Amount must be greater than zero.")
            return False

        tx_type = self.cmb_type.currentText()
        tx_date = self.date_tx.date().toString(Qt.DateFormat.ISODate)
        account_id = self.cmb_account.currentData() or 1
        category = self.cmb_category.currentText().strip() or "Other"
        description = self.txt_desc.text().strip() or f"{tx_type} transaction"
        notes = self.txt_notes.toPlainText()

        # Sanity check: Ensure no card numbers stored
        import re
        if re.search(r"\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b", description + notes):
            QMessageBox.critical(self, "Security Warning", "Credit/Debit card numbers must not be stored in this application.")
            return False

        if self.item_id is None:
            with self.section.db.get_connection():
                cur = self.section.db.execute(
                    """INSERT INTO money_transactions 
                       (account_id, tx_date, tx_type, category, amount, description, notes)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (account_id, tx_date, tx_type, category, amount, description, notes)
                )
                self.item_id = cur.lastrowid
                self.item_title = f"{tx_type}: ${amount:.2f} ({description})"

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.convert_create_to_editor(self, self.item_id, self.item_title)
                self.btn_delete.setVisible(True)
        else:
            with self.section.db.get_connection():
                self.section.db.execute(
                    """UPDATE money_transactions 
                       SET account_id = ?, tx_date = ?, tx_type = ?, category = ?, amount = ?, description = ?, notes = ?
                       WHERE id = ?""",
                    (account_id, tx_date, tx_type, category, amount, description, notes, self.item_id)
                )
                self.item_title = f"{tx_type}: ${amount:.2f} ({description})"

            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.set_tab_dirty(self, False)
                window.tab_manager.refresh_list_tabs(self.section.id)

        QMessageBox.information(self, "Success", "Transaction recorded successfully.")
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
            self, "Confirm Delete", "Are you sure you want to delete this transaction?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            with self.section.db.get_connection():
                self.section.db.execute("DELETE FROM money_transactions WHERE id = ?", (self.item_id,))
            window = self.window()
            if hasattr(window, "tab_manager"):
                window.tab_manager.close_editor_for_item(self.section.id, self.item_id)


class MoneySection(BaseSection):
    id = "money"
    name = "Money"
    icon_name = "dollar"
    shortcut = "Alt+5"

    def init_schema(self) -> None:
        with self.db.get_connection():
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS money_accounts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    account_type TEXT DEFAULT 'Checking',
                    initial_balance REAL DEFAULT 0.0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS money_budgets (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT UNIQUE NOT NULL,
                    monthly_amount REAL NOT NULL
                );
            """)
            self.db.execute("""
                CREATE TABLE IF NOT EXISTS money_transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    account_id INTEGER DEFAULT 1,
                    tx_date TEXT NOT NULL,
                    tx_type TEXT NOT NULL,
                    category TEXT NOT NULL,
                    amount REAL NOT NULL,
                    description TEXT,
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY(account_id) REFERENCES money_accounts(id)
                );
            """)
            # Ensure at least one default account exists
            cur = self.db.execute("SELECT COUNT(*) FROM money_accounts")
            if cur.fetchone()[0] == 0:
                self.db.execute("INSERT INTO money_accounts (name, account_type, initial_balance) VALUES (?, ?, ?)",
                                ("Primary Checking", "Checking", 0.0))

    def list_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return MoneyListView(self, parent)

    def editor_view(self, item_id: int, parent: Optional[QWidget] = None) -> QWidget:
        return MoneyFormView(self, item_id, parent)

    def create_view(self, parent: Optional[QWidget] = None) -> QWidget:
        return MoneyFormView(self, None, parent)

    def dashboard_widgets(self) -> List[Dict[str, Any]]:
        def make_widget():
            w = QWidget()
            l = QVBoxLayout(w)
            l.setContentsMargins(4, 4, 4, 4)
            # This month's totals
            month_prefix = date.today().strftime("%Y-%m")
            row_inc = self.db.fetchone(
                "SELECT COALESCE(SUM(amount), 0.0) FROM money_transactions WHERE tx_type = 'Income' AND tx_date LIKE ?",
                (f"{month_prefix}%",)
            )[0]
            row_exp = self.db.fetchone(
                "SELECT COALESCE(SUM(amount), 0.0) FROM money_transactions WHERE tx_type = 'Expense' AND tx_date LIKE ?",
                (f"{month_prefix}%",)
            )[0]
            
            lbl_month = QLabel(f"<b>Month ({month_prefix}):</b>")
            lbl_stats = QLabel(f"Income: +${row_inc:.2f}\nExpense: -${row_exp:.2f}\nNet: ${(row_inc - row_exp):.2f}")
            l.addWidget(lbl_month)
            l.addWidget(lbl_stats)

            btn = QPushButton("Open Money List")
            btn.clicked.connect(lambda: w.window().tab_manager.open_tab(self.id, TabKind.LIST) if hasattr(w.window(), "tab_manager") else None)
            l.addWidget(btn)
            return w

        return [{
            "id": "money_monthly_summary",
            "name": "Monthly Cash Flow",
            "widget_factory": make_widget
        }]

    def search(self, query: str) -> List[Dict[str, Any]]:
        rows = self.db.fetchall("""
            SELECT id, tx_date, tx_type, category, amount, description, notes 
            FROM money_transactions 
            WHERE description LIKE ? OR category LIKE ? OR notes LIKE ?
        """, (f"%{query}%", f"%{query}%", f"%{query}%"))
        return [{
            "id": r["id"],
            "title": f"Money: {r['tx_type']} ${r['amount']:.2f} - {r['description']}",
            "snippet": f"Category: {r['category']} | Date: {r['tx_date']} | {(r['notes'] or '')[:80]}",
            "section_id": self.id
        } for r in rows]
