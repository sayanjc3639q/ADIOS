"""Print and Report Generation Dialog with Live Visual Preview for ADIOS.

Features:
- Dual-pane layout: Controls on the left, live high-fidelity page preview on the right
- Target selection: Money/Expenses, Subscriptions, Exams, Schedule, Clubs, LinkedIn
- Date range filtering: Start Date, End Date, Current Month, All Time presets
- Item filtering / selection: Checkboxes to selectively include/exclude items
- Document headers: Title, Section, Organization, Date Generated
- Document summary section at bottom: Totals, Net Cash Flow, Subsidy summary
- Resolution-aware printing: Perfectly scaled 96 DPI points layout (prevents miniature text bug)
- Live interactive Preview pane that updates as you toggle checkboxes or change dates
- Print Preview (QPrintPreviewDialog), direct Print (QPrintDialog), or Export to PDF
"""
from __future__ import annotations
from typing import Any, List, Dict, Optional
from datetime import datetime, date

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QComboBox,
    QDateEdit, QCheckBox, QTableWidget, QTableWidgetItem, QHeaderView,
    QGroupBox, QFormLayout, QLineEdit, QTextBrowser, QMessageBox, QSplitter,
    QWidget, QFileDialog
)
from PySide6.QtGui import QTextDocument, QFont, QColor
from PySide6.QtCore import Qt, QDate, QSizeF
from PySide6.QtPrintSupport import QPrinter, QPrintDialog, QPrintPreviewDialog
from app.core.icons import WinIcons


class PrintReportDialog(QDialog):
    """Configurable Print Dialog for ADIOS with Live Visual Preview."""

    def __init__(self, db: Any, registry: Any, current_section_id: Optional[str] = None, parent=None):
        super().__init__(parent)
        self.db = db
        self.registry = registry
        self.setWindowTitle("Print & Export Report - Live Preview")
        self.resize(1100, 750)

        self._all_items: List[Dict[str, Any]] = []

        # Main splitter: Left side controls & item selection, Right side live page preview
        root_layout = QVBoxLayout(self)
        root_layout.setContentsMargins(10, 10, 10, 10)
        root_layout.setSpacing(8)

        splitter = QSplitter(Qt.Orientation.Horizontal, self)

        # LEFT PANE: Options & Selection
        left_widget = QWidget()
        left_layout = QVBoxLayout(left_widget)
        left_layout.setContentsMargins(0, 0, 8, 0)
        left_layout.setSpacing(8)

        # 1. Header & Section Group
        grp_options = QGroupBox("Report Settings & Filter")
        form_opt = QFormLayout(grp_options)
        form_opt.setContentsMargins(10, 10, 10, 10)

        self.cmb_section = QComboBox()
        self.cmb_section.addItem("Money & Expenses / Cash Flow", "money")
        self.cmb_section.addItem("Subscriptions & Recurring Costs", "subscriptions")
        self.cmb_section.addItem("Exams & Academic Schedule", "exams")
        self.cmb_section.addItem("Schedule & Calendar Events", "schedule")
        self.cmb_section.addItem("Clubs & Societies Tasks", "clubs")
        self.cmb_section.addItem("LinkedIn Queue", "linkedin")

        if current_section_id:
            idx = self.cmb_section.findData(current_section_id)
            if idx != -1:
                self.cmb_section.setCurrentIndex(idx)

        form_opt.addRow("Section:", self.cmb_section)

        self.txt_title = QLineEdit("Monthly Financial Statement & Expenses")
        form_opt.addRow("Header Title:", self.txt_title)

        h_dates = QHBoxLayout()
        self.chk_date_filter = QCheckBox("Date Filter:")
        self.chk_date_filter.setChecked(True)
        h_dates.addWidget(self.chk_date_filter)

        self.date_start = QDateEdit()
        self.date_start.setCalendarPopup(True)
        self.date_start.setDate(QDate.currentDate().addMonths(-1))
        h_dates.addWidget(self.date_start)

        h_dates.addWidget(QLabel("to"))
        self.date_end = QDateEdit()
        self.date_end.setCalendarPopup(True)
        self.date_end.setDate(QDate.currentDate().addMonths(1))
        h_dates.addWidget(self.date_end)

        self.btn_preset_month = QPushButton("This Month")
        self.btn_preset_month.clicked.connect(self._preset_this_month)
        h_dates.addWidget(self.btn_preset_month)

        self.btn_preset_all = QPushButton("All Time")
        self.btn_preset_all.clicked.connect(self._preset_all_time)
        h_dates.addWidget(self.btn_preset_all)
        form_opt.addRow("Date Window:", h_dates)

        left_layout.addWidget(grp_options)

        # 2. Items Selection Table
        grp_items = QGroupBox("Select Items to Include")
        items_layout = QVBoxLayout(grp_items)
        items_layout.setContentsMargins(8, 8, 8, 8)

        sel_bar = QHBoxLayout()
        self.btn_select_all = QPushButton("Select All")
        self.btn_select_all.clicked.connect(self._select_all_items)
        self.btn_select_none = QPushButton("Deselect All")
        self.btn_select_none.clicked.connect(self._deselect_all_items)
        sel_bar.addWidget(self.btn_select_all)
        sel_bar.addWidget(self.btn_select_none)
        sel_bar.addStretch()
        self.lbl_selected_count = QLabel("0 items included")
        sel_bar.addWidget(self.lbl_selected_count)
        items_layout.addLayout(sel_bar)

        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels(["Include", "Date", "Title / Item", "Category / Terms", "Value"])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.ResizeMode.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(3, QHeaderView.ResizeMode.ResizeToContents)
        self.table.horizontalHeader().setSectionResizeMode(4, QHeaderView.ResizeMode.ResizeToContents)
        self.table.verticalHeader().setVisible(False)
        self.table.itemChanged.connect(self._on_table_item_changed)
        items_layout.addWidget(self.table)

        left_layout.addWidget(grp_items, stretch=1)

        # 3. Bottom Summary Box
        grp_summary = QGroupBox("Summary Calculations")
        sum_layout = QVBoxLayout(grp_summary)
        self.lbl_summary = QLabel("Summary: calculating...")
        self.lbl_summary.setWordWrap(True)
        self.lbl_summary.setStyleSheet("font-weight: bold; color: #1d4ed8; padding: 4px;")
        sum_layout.addWidget(self.lbl_summary)
        left_layout.addWidget(grp_summary)

        # RIGHT PANE: Live Page Preview
        right_widget = QWidget()
        right_layout = QVBoxLayout(right_widget)
        right_layout.setContentsMargins(8, 0, 0, 0)
        right_layout.setSpacing(6)

        preview_header = QHBoxLayout()
        preview_header.addWidget(QLabel("<b>Print Document Live Preview:</b>"))
        preview_header.addStretch()
        btn_refresh_preview = QPushButton("Refresh Preview")
        btn_refresh_preview.setIcon(WinIcons.get("refresh"))
        btn_refresh_preview.clicked.connect(self._update_preview)
        preview_header.addWidget(btn_refresh_preview)
        right_layout.addLayout(preview_header)

        # Using QTextBrowser with clean white background and realistic document box shadow
        self.preview_browser = QTextBrowser()
        self.preview_browser.setStyleSheet("""
            QTextBrowser {
                background-color: #525659;
                padding: 15px;
                border: 1px solid #3c3f41;
            }
        """)
        right_layout.addWidget(self.preview_browser)

        splitter.addWidget(left_widget)
        splitter.addWidget(right_widget)
        splitter.setStretchFactor(0, 4)
        splitter.setStretchFactor(1, 5)
        root_layout.addWidget(splitter, stretch=1)

        # Bottom Action Bar
        btn_bar = QHBoxLayout()
        self.btn_preview_modal = QPushButton("Full Print Preview...")
        self.btn_preview_modal.setIcon(WinIcons.get("open"))
        self.btn_preview_modal.clicked.connect(self._on_print_preview)

        self.btn_print = QPushButton("Print Document...")
        self.btn_print.setIcon(WinIcons.get("settings"))
        self.btn_print.clicked.connect(self._on_print)

        self.btn_pdf = QPushButton("Export to PDF...")
        self.btn_pdf.setIcon(WinIcons.get("save"))
        self.btn_pdf.clicked.connect(self._on_export_pdf)

        self.btn_close = QPushButton("Close")
        self.btn_close.clicked.connect(self.reject)

        btn_bar.addWidget(self.btn_preview_modal)
        btn_bar.addWidget(self.btn_print)
        btn_bar.addWidget(self.btn_pdf)
        btn_bar.addStretch()
        btn_bar.addWidget(self.btn_close)
        root_layout.addLayout(btn_bar)

        # Connect event handlers
        self.cmb_section.currentIndexChanged.connect(self._load_section_items)
        self.chk_date_filter.toggled.connect(self._on_filter_changed)
        self.date_start.dateChanged.connect(self._on_filter_changed)
        self.date_end.dateChanged.connect(self._on_filter_changed)
        self.txt_title.textChanged.connect(self._update_preview)

        self._load_section_items()

    def _preset_this_month(self):
        today = date.today()
        first_day = date(today.year, today.month, 1)
        self.date_start.setDate(QDate(first_day.year, first_day.month, first_day.day))
        self.date_end.setDate(QDate(today.year, today.month, today.day))
        self.chk_date_filter.setChecked(True)
        self._load_section_items()

    def _preset_all_time(self):
        self.chk_date_filter.setChecked(False)
        self._load_section_items()

    def _on_filter_changed(self):
        self._load_section_items()

    def _load_section_items(self):
        section_id = self.cmb_section.currentData()
        start_str = self.date_start.date().toString(Qt.DateFormat.ISODate) if self.chk_date_filter.isChecked() else "1900-01-01"
        end_str = self.date_end.date().toString(Qt.DateFormat.ISODate) if self.chk_date_filter.isChecked() else "2099-12-31"

        items: List[Dict[str, Any]] = []

        if section_id == "money":
            self.txt_title.setText("Monthly Financial Statement & Expenses")
            rows = self.db.fetchall(
                """SELECT id, tx_date, description, tx_type, category, amount
                   FROM money_transactions
                   WHERE tx_date >= ? AND tx_date <= ?
                   ORDER BY tx_date DESC""",
                (start_str, end_str)
            )
            for r in rows:
                amt = float(r["amount"] or 0.0)
                is_inc = (r["tx_type"] == "Income")
                sign = "+" if is_inc else "-"
                items.append({
                    "date": r["tx_date"],
                    "title": r["description"] or "Transaction",
                    "category": r["category"] or "General",
                    "value_raw": amt if is_inc else -amt,
                    "value_display": f"{sign}₹{amt:.2f}",
                    "is_income": is_inc
                })

        elif section_id == "subscriptions":
            self.txt_title.setText("Subscription Expenses & Subsidy Application Schedule")
            rows = self.db.fetchall("SELECT id, name, cost, billing_cycle, renewal_date, status FROM subscriptions")
            for r in rows:
                cost = float(r["cost"] or 0.0)
                cycle = r["billing_cycle"] or "Monthly"
                m_cost = cost
                if cycle == "Yearly":
                    m_cost = cost / 12.0
                elif cycle == "Weekly":
                    m_cost = cost * 4.33
                items.append({
                    "date": r["renewal_date"] or "-",
                    "title": r["name"],
                    "category": f"{cycle} ({r['status']})",
                    "value_raw": m_cost,
                    "value_display": f"${cost:.2f} ({cycle})",
                    "monthly_cost": m_cost
                })

        elif section_id == "exams":
            self.txt_title.setText("Official Examination Schedule & Academic Verification")
            rows = self.db.fetchall(
                """SELECT id, subject, exam_date, exam_time, venue, duration, marks_obtained, max_marks
                   FROM exams WHERE exam_date >= ? AND exam_date <= ? ORDER BY exam_date ASC""",
                (start_str, end_str)
            )
            for r in rows:
                items.append({
                    "date": f"{r['exam_date']} {r['exam_time'] or ''}".strip(),
                    "title": r["subject"] or "Exam",
                    "category": f"Venue: {r['venue'] or 'TBD'} ({r['duration'] or '2h'})",
                    "value_raw": r["marks_obtained"] or 0,
                    "value_display": f"Score: {r['marks_obtained'] or '-'}/{r['max_marks'] or '-'}"
                })

        elif section_id == "schedule":
            self.txt_title.setText("Scheduled Events & Agenda Report")
            rows = self.db.fetchall(
                """SELECT id, title, start_date, start_time, category, location 
                   FROM schedule_events WHERE start_date >= ? AND start_date <= ? ORDER BY start_date ASC""",
                (start_str, end_str)
            )
            for r in rows:
                items.append({
                    "date": f"{r['start_date']} {r['start_time'] or ''}".strip(),
                    "title": r["title"],
                    "category": r["category"] or "General",
                    "value_raw": 0,
                    "value_display": r["location"] or "Local"
                })

        elif section_id == "clubs":
            self.txt_title.setText("Clubs & Societies Tasks & Deadlines Report")
            rows = self.db.fetchall(
                """SELECT t.id, t.task, t.deadline, t.status, t.priority, c.name as club_name
                   FROM club_tasks t LEFT JOIN clubs c ON t.club_id = c.id
                   ORDER BY t.deadline ASC"""
            )
            for r in rows:
                items.append({
                    "date": r["deadline"] or "-",
                    "title": r["task"],
                    "category": f"{r['club_name'] or 'Club'} ({r['priority']})",
                    "value_raw": 0,
                    "value_display": r["status"]
                })

        elif section_id == "linkedin":
            self.txt_title.setText("LinkedIn Scheduled Queue & Publishing Report")
            rows = self.db.fetchall("SELECT id, title, status, planned_date, tags FROM linkedin_posts ORDER BY id DESC")
            for r in rows:
                items.append({
                    "date": r["planned_date"] or "-",
                    "title": r["title"] or "Post",
                    "category": r["status"],
                    "value_raw": 0,
                    "value_display": r["tags"] or "-"
                })

        self._all_items = items
        self._populate_table()

    def _populate_table(self):
        self.table.blockSignals(True)
        self.table.setRowCount(0)

        for row_idx, item in enumerate(self._all_items):
            self.table.insertRow(row_idx)

            chk_item = QTableWidgetItem()
            chk_item.setCheckState(Qt.CheckState.Checked)
            self.table.setItem(row_idx, 0, chk_item)

            self.table.setItem(row_idx, 1, QTableWidgetItem(str(item.get("date", "-"))))
            self.table.setItem(row_idx, 2, QTableWidgetItem(str(item.get("title", ""))))
            self.table.setItem(row_idx, 3, QTableWidgetItem(str(item.get("category", ""))))
            
            val_item = QTableWidgetItem(str(item.get("value_display", "")))
            val_item.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
            self.table.setItem(row_idx, 4, val_item)

        self.table.blockSignals(False)
        self._update_summary()

    def _select_all_items(self):
        self.table.blockSignals(True)
        for r in range(self.table.rowCount()):
            it = self.table.item(r, 0)
            if it:
                it.setCheckState(Qt.CheckState.Checked)
        self.table.blockSignals(False)
        self._update_summary()

    def _deselect_all_items(self):
        self.table.blockSignals(True)
        for r in range(self.table.rowCount()):
            it = self.table.item(r, 0)
            if it:
                it.setCheckState(Qt.CheckState.Unchecked)
        self.table.blockSignals(False)
        self._update_summary()

    def _on_table_item_changed(self, item: QTableWidgetItem):
        if item.column() == 0:
            self._update_summary()

    def _get_selected_items(self) -> List[Dict[str, Any]]:
        selected = []
        for r in range(self.table.rowCount()):
            chk = self.table.item(r, 0)
            if chk and chk.checkState() == Qt.CheckState.Checked:
                if r < len(self._all_items):
                    selected.append(self._all_items[r])
        return selected

    def _update_summary(self):
        selected = self._get_selected_items()
        count = len(selected)
        sec_id = self.cmb_section.currentData()
        self.lbl_selected_count.setText(f"{count} of {len(self._all_items)} items included")

        if sec_id == "money":
            total_income = sum(it["value_raw"] for it in selected if it.get("is_income"))
            total_expense = sum(-it["value_raw"] for it in selected if not it.get("is_income"))
            net = total_income - total_expense
            self.lbl_summary.setText(
                f"Selected Entries: {count} | Total Income: +₹{total_income:.2f} | "
                f"Total Expenses: -₹{total_expense:.2f} | NET CASH FLOW: ₹{net:+.2f}"
            )
        elif sec_id == "subscriptions":
            total_monthly = sum(it.get("monthly_cost", 0.0) for it in selected)
            total_annual = total_monthly * 12.0
            self.lbl_summary.setText(
                f"Selected Subscriptions: {count} | Total Monthly Equivalent: ${total_monthly:.2f} | "
                f"Annual Projected Expense: ${total_annual:.2f} (Verified for Student/Subsidy Allowance)"
            )
        elif sec_id == "exams":
            self.lbl_summary.setText(f"Scheduled Exams Included: {count} papers across testing window.")
        else:
            self.lbl_summary.setText(f"Total Selected Items: {count}")

        # Update Live Preview
        self._update_preview()

    def generate_html_document(self, for_preview: bool = False) -> str:
        """Constructs an elegant, clean printable HTML report with headers and summary."""
        title = self.txt_title.text().strip() or "Report"
        sec_name = self.cmb_section.currentText()
        date_str = datetime.now().strftime("%B %d, %Y - %I:%M %p")
        selected = self._get_selected_items()
        summary_text = self.lbl_summary.text()

        rows_html = ""
        for idx, item in enumerate(selected, start=1):
            bg = "#f8fafc" if idx % 2 == 0 else "#ffffff"
            rows_html += f"""
            <tr style="background-color: {bg};">
                <td style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 13px; color: #475569;">{idx}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 13px; color: #334155;">{item.get('date', '-')}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 13px; font-weight: 600; color: #0f172a;">{item.get('title', '')}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 13px; color: #475569;">{item.get('category', '')}</td>
                <td style="padding: 10px 12px; border-bottom: 1px solid #cbd5e1; font-size: 13px; text-align: right; font-weight: bold; color: #0f172a;">{item.get('value_display', '')}</td>
            </tr>
            """

        container_style = """
            max-width: 800px;
            margin: 15px auto;
            background: #ffffff;
            padding: 35px 40px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
        """ if for_preview else "margin: 0; padding: 25px;"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                    color: #0f172a;
                    background-color: {"#525659" if for_preview else "#ffffff"};
                    margin: 0;
                    padding: 0;
                }}
                .page-container {{
                    {container_style}
                }}
                table.header-table {{
                    width: 100%;
                    border-bottom: 3px solid #2563eb;
                    padding-bottom: 14px;
                    margin-bottom: 22px;
                }}
                .brand-title {{
                    font-size: 24px;
                    font-weight: 900;
                    color: #1e3a8a;
                    margin: 0 0 4px 0;
                    letter-spacing: -0.5px;
                }}
                .report-title {{
                    font-size: 17px;
                    font-weight: 700;
                    color: #1e293b;
                    margin: 2px 0 0 0;
                }}
                .meta-info {{
                    font-size: 12px;
                    color: #475569;
                    text-align: right;
                    line-height: 1.5;
                }}
                table.data-table {{
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 25px;
                }}
                th {{
                    background-color: #f1f5f9;
                    color: #1e293b;
                    font-size: 12px;
                    font-weight: 800;
                    text-transform: uppercase;
                    padding: 10px 12px;
                    border-top: 1px solid #cbd5e1;
                    border-bottom: 2px solid #64748b;
                    text-align: left;
                    letter-spacing: 0.5px;
                }}
                th.th-right {{
                    text-align: right;
                }}
                .summary-box {{
                    background-color: #eff6ff;
                    border: 2px solid #93c5fd;
                    border-radius: 6px;
                    padding: 16px 20px;
                    margin-top: 25px;
                }}
                .summary-title {{
                    font-size: 14px;
                    font-weight: 800;
                    color: #1d4ed8;
                    margin-bottom: 6px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                .summary-content {{
                    font-size: 13px;
                    color: #1e3a8a;
                    font-weight: 700;
                    line-height: 1.5;
                }}
                .footer {{
                    margin-top: 35px;
                    font-size: 11px;
                    color: #64748b;
                    text-align: center;
                    border-top: 1px solid #cbd5e1;
                    padding-top: 12px;
                }}
            </style>
        </head>
        <body>
            <div class="page-container">
                <table class="header-table">
                    <tr>
                        <td style="vertical-align: top;">
                            <div class="brand-title">ADIOS Personal Desktop</div>
                            <div class="report-title">{title}</div>
                            <div style="font-size: 13px; color: #475569; margin-top: 4px;"><b>Section:</b> {sec_name}</div>
                        </td>
                        <td class="meta-info" style="vertical-align: top;">
                            <div><b>Generated:</b> {date_str}</div>
                            <div><b>System:</b> Local Database (Verified)</div>
                            <div><b>Items Included:</b> {len(selected)} entries</div>
                        </td>
                    </tr>
                </table>

                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 35px;">#</th>
                            <th style="width: 120px;">Date / Time</th>
                            <th>Title / Description</th>
                            <th style="width: 200px;">Category / Terms</th>
                            <th class="th-right" style="width: 140px;">Amount / Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows_html if rows_html else '<tr><td colspan="5" style="text-align:center; padding:20px; color:#64748b;">No items selected for printing.</td></tr>'}
                    </tbody>
                </table>

                <div class="summary-box">
                    <div class="summary-title">Official Verification & Summary</div>
                    <div class="summary-content">{summary_text}</div>
                </div>

                <div class="footer">
                    Printed via ADIOS Desktop System • Confidential • For Personal and Official Record
                </div>
            </div>
        </body>
        </html>
        """
        return html

    def _update_preview(self):
        html = self.generate_html_document(for_preview=True)
        self.preview_browser.setHtml(html)

    def _prepare_print_document(self, printer: QPrinter) -> QTextDocument:
        """Constructs a QTextDocument with exact point page dimensions matching the target printer."""
        doc = QTextDocument()
        doc.setHtml(self.generate_html_document(for_preview=False))
        # Critical fix: lock page dimensions to standard Points size (e.g. 612x792 for Letter / 595x842 for A4)
        # Prevents high DPI printers from shrinking standard HTML pixels to micro-dots
        page_size = printer.pageRect(QPrinter.Unit.Point).size()
        doc.setPageSize(QSizeF(page_size.width(), page_size.height()))
        return doc

    def _on_print_preview(self):
        printer = QPrinter()
        printer.setPageOrientation(QPrinter.Orientation.Portrait)

        preview = QPrintPreviewDialog(printer, self)
        preview.paintRequested.connect(lambda p: self._prepare_print_document(p).print_(p))
        preview.exec()

    def _on_print(self):
        printer = QPrinter()
        dlg = QPrintDialog(printer, self)
        if dlg.exec() == QDialog.DialogCode.Accepted:
            doc = self._prepare_print_document(printer)
            doc.print_(printer)
            QMessageBox.information(self, "Printed", "Document sent to printer successfully.")

    def _on_export_pdf(self):
        file_path, _ = QFileDialog.getSaveFileName(self, "Save Report as PDF", "ADIOS_Report.pdf", "PDF Files (*.pdf)")
        if not file_path:
            return

        printer = QPrinter()
        printer.setOutputFormat(QPrinter.OutputFormat.PdfFormat)
        printer.setOutputFileName(file_path)
        doc = self._prepare_print_document(printer)
        doc.print_(printer)

        QMessageBox.information(self, "PDF Exported", f"Report saved successfully to:\n{file_path}")
