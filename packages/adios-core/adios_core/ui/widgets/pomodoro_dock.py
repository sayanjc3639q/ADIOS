"""Pomodoro dockable widget for ADIOS.

Features:
- 25-min Work / 5-min Short Break / 15-min Long Break timer
- Start, Pause, Reset, Skip
- Cycle counter (# of completed pomodoros)
- Native plain classic style
"""
from __future__ import annotations
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, QComboBox, QProgressBar
)
from PySide6.QtCore import Qt, QTimer


class PomodoroWidget(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.work_time = 25 * 60
        self.short_break_time = 5 * 60
        self.long_break_time = 15 * 60

        self.current_mode = "Work"
        self.remaining_seconds = self.work_time
        self.completed_cycles = 0

        self.timer = QTimer(self)
        self.timer.setInterval(1000)
        self.timer.timeout.connect(self._tick)

        layout = QVBoxLayout(self)
        layout.setContentsMargins(6, 6, 6, 6)
        layout.setSpacing(6)

        # Mode selector
        h_mode = QHBoxLayout()
        self.cmb_mode = QComboBox()
        self.cmb_mode.addItems(["Work (25m)", "Short Break (5m)", "Long Break (15m)"])
        h_mode.addWidget(QLabel("Mode:"))
        h_mode.addWidget(self.cmb_mode)
        layout.addLayout(h_mode)

        # Large Time Label
        self.lbl_time = QLabel("25:00")
        self.lbl_time.setAlignment(Qt.AlignmentFlag.AlignCenter)
        font = self.lbl_time.font()
        font.setPointSize(22)
        font.setBold(True)
        self.lbl_time.setFont(font)
        layout.addWidget(self.lbl_time)

        # Progress bar
        self.progress = QProgressBar()
        self.progress.setRange(0, self.work_time)
        self.progress.setValue(self.work_time)
        self.progress.setTextVisible(False)
        self.progress.setFixedHeight(10)
        layout.addWidget(self.progress)

        # Control Buttons
        h_btns = QHBoxLayout()
        self.btn_start = QPushButton("Start")
        self.btn_pause = QPushButton("Pause")
        self.btn_reset = QPushButton("Reset")
        self.btn_pause.setEnabled(False)

        h_btns.addWidget(self.btn_start)
        h_btns.addWidget(self.btn_pause)
        h_btns.addWidget(self.btn_reset)
        layout.addLayout(h_btns)

        # Stats
        self.lbl_stats = QLabel("Completed Pomodoros: 0")
        self.lbl_stats.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.lbl_stats)

        layout.addStretch()

        # Signals
        self.cmb_mode.currentIndexChanged.connect(self._on_mode_change)
        self.btn_start.clicked.connect(self.start_timer)
        self.btn_pause.clicked.connect(self.pause_timer)
        self.btn_reset.clicked.connect(self.reset_timer)

    def _on_mode_change(self, index: int):
        self.pause_timer()
        if index == 0:
            self.current_mode = "Work"
            self.remaining_seconds = self.work_time
        elif index == 1:
            self.current_mode = "Short Break"
            self.remaining_seconds = self.short_break_time
        else:
            self.current_mode = "Long Break"
            self.remaining_seconds = self.long_break_time

        self.progress.setRange(0, self.remaining_seconds)
        self.progress.setValue(self.remaining_seconds)
        self._update_display()

    def _update_display(self):
        mins = self.remaining_seconds // 60
        secs = self.remaining_seconds % 60
        self.lbl_time.setText(f"{mins:02d}:{secs:02d}")
        self.progress.setValue(self.remaining_seconds)

    def _tick(self):
        if self.remaining_seconds > 0:
            self.remaining_seconds -= 1
            self._update_display()
        else:
            self.timer.stop()
            self.btn_start.setEnabled(True)
            self.btn_pause.setEnabled(False)
            if self.current_mode == "Work":
                self.completed_cycles += 1
                self.lbl_stats.setText(f"Completed Pomodoros: {self.completed_cycles}")
                # Switch to short break or long break
                if self.completed_cycles % 4 == 0:
                    self.cmb_mode.setCurrentIndex(2) # Long Break
                else:
                    self.cmb_mode.setCurrentIndex(1) # Short Break
            else:
                self.cmb_mode.setCurrentIndex(0) # Back to Work

    def start_timer(self):
        self.timer.start()
        self.btn_start.setEnabled(False)
        self.btn_pause.setEnabled(True)

    def pause_timer(self):
        self.timer.stop()
        self.btn_start.setEnabled(True)
        self.btn_pause.setEnabled(False)

    def reset_timer(self):
        self._on_mode_change(self.cmb_mode.currentIndex())
