"""Auto-updater and background GitHub release checker for ADIOS."""
from __future__ import annotations
import os
import sys
import json
import subprocess
import tempfile
import urllib.request
import urllib.error
from typing import Optional, Dict, Any

from PySide6.QtCore import QThread, Signal, QObject
from PySide6.QtWidgets import (
    QWidget, QVBoxLayout, QHBoxLayout, QLabel, QPushButton, 
    QProgressBar, QMessageBox, QTextBrowser, QDialog
)

from app.version import APP_VERSION, GITHUB_REPO


class CheckUpdateThread(QThread):
    """Background non-blocking thread to check for releases on GitHub."""
    update_available = Signal(str, str, str) # new_version, download_url, release_notes
    no_update = Signal()
    check_failed = Signal(str)

    def __init__(self, parent: Optional[QObject] = None):
        super().__init__(parent)

    def run(self):
        url = f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest"
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "ADIOS-Desktop-Updater", "Accept": "application/vnd.github.v3+json"}
        )
        try:
            with urllib.request.urlopen(req, timeout=5) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    tag = data.get("tag_name", "").lstrip("v").strip()
                    body = data.get("body", "Bug fixes and performance improvements.")
                    
                    # Find asset download URL for ADIOS_Setup.exe or ADIOS.exe
                    download_url = ""
                    for asset in data.get("assets", []):
                        name = asset.get("name", "")
                        if "setup" in name.lower() or name.endswith(".exe"):
                            download_url = asset.get("browser_download_url", "")
                            break

                    if not download_url:
                        download_url = data.get("html_url", f"https://github.com/{GITHUB_REPO}/releases/latest")

                    if self._is_newer(tag, APP_VERSION):
                        self.update_available.emit(tag, download_url, body)
                    else:
                        self.no_update.emit()
                else:
                    self.no_update.emit()
        except Exception as e:
            self.check_failed.emit(str(e))

    def _is_newer(self, latest_ver: str, current_ver: str) -> bool:
        """Compares version tags e.g. v2.0.0-alpha.2 vs 2.0.0-alpha.1."""
        try:
            import re
            def parse_ver(v: str):
                v_clean = v.lstrip("vV")
                parts = re.split(r'[-.]', v_clean)
                numeric_parts = []
                stage_order = {"alpha": 1, "beta": 2, "rc": 3, "stable": 4}
                stage_val = 4
                for p in parts:
                    if p.isdigit():
                        numeric_parts.append(int(p))
                    elif p.lower() in stage_order:
                        stage_val = stage_order[p.lower()]
                return (numeric_parts[:3], stage_val, numeric_parts[3:] if len(numeric_parts) > 3 else [0])

            return parse_ver(latest_ver) > parse_ver(current_ver)
        except Exception:
            return latest_ver.strip().lstrip("vV") != current_ver.strip().lstrip("vV") and bool(latest_ver)


class DownloadUpdateThread(QThread):
    """Downloads installer executable and reports progress."""
    progress = Signal(int)
    finished = Signal(str) # Path to downloaded installer
    failed = Signal(str)

    def __init__(self, download_url: str, parent: Optional[QObject] = None):
        super().__init__(parent)
        self.download_url = download_url

    def run(self):
        try:
            temp_dir = tempfile.gettempdir()
            dest_file = os.path.join(temp_dir, "ADIOS_Setup_Update.exe")
            
            req = urllib.request.Request(
                self.download_url,
                headers={"User-Agent": "ADIOS-Desktop-Updater"}
            )
            with urllib.request.urlopen(req, timeout=15) as res:
                total_size = int(res.headers.get("content-length", 0))
                downloaded = 0
                block_size = 65536
                
                with open(dest_file, "wb") as f:
                    while True:
                        buf = res.read(block_size)
                        if not buf:
                            break
                        f.write(buf)
                        downloaded += len(buf)
                        if total_size > 0:
                            pct = int((downloaded / total_size) * 100)
                            self.progress.emit(pct)

            self.finished.emit(dest_file)
        except Exception as e:
            self.failed.emit(str(e))


class UpdateDialog(QDialog):
    """Dialog displaying update info, download progress, and restart prompt."""

    def __init__(self, version: str, download_url: str, release_notes: str, parent=None):
        super().__init__(parent)
        self.setWindowTitle(f"ADIOS Update Available — v{version}")
        self.setFixedSize(500, 380)
        self.version = version
        self.download_url = download_url
        self.downloaded_path = ""

        layout = QVBoxLayout(self)
        layout.setSpacing(10)

        header = QLabel(f"<h3 style='margin:0; color:#0284c7;'>New Update Available: v{version}</h3>"
                        f"<span style='color:#64748b;'>Current version: v{APP_VERSION}</span>")
        layout.addWidget(header)

        layout.addWidget(QLabel("<b>Release Notes:</b>"))
        self.notes_browser = QTextBrowser()
        self.notes_browser.setMarkdown(release_notes)
        layout.addWidget(self.notes_browser)

        self.progress_bar = QProgressBar()
        self.progress_bar.setVisible(False)
        self.progress_bar.setValue(0)
        layout.addWidget(self.progress_bar)

        self.lbl_status = QLabel("")
        self.lbl_status.setStyleSheet("font-size: 12px; color: #475569;")
        layout.addWidget(self.lbl_status)

        # Buttons
        btn_box = QHBoxLayout()
        self.btn_action = QPushButton("Download & Install Update")
        self.btn_action.setStyleSheet("background-color:#0284c7; color:white; font-weight:bold; padding:6px 14px;")
        self.btn_action.clicked.connect(self._start_download)
        
        self.btn_close = QPushButton("Later")
        self.btn_close.clicked.connect(self.reject)

        btn_box.addStretch()
        btn_box.addWidget(self.btn_action)
        btn_box.addWidget(self.btn_close)
        layout.addLayout(btn_box)

    def _start_download(self):
        self.btn_action.setEnabled(False)
        self.progress_bar.setVisible(True)
        self.lbl_status.setText("Downloading update from GitHub...")

        self.worker = DownloadUpdateThread(self.download_url, self)
        self.worker.progress.connect(self.progress_bar.setValue)
        self.worker.finished.connect(self._on_download_finished)
        self.worker.failed.connect(self._on_download_failed)
        self.worker.start()

    def _on_download_finished(self, file_path: str):
        self.downloaded_path = file_path
        self.progress_bar.setValue(100)
        self.lbl_status.setText("Download complete! Ready to apply update.")

        reply = QMessageBox.question(
            self,
            "Restart to Apply Update",
            f"ADIOS v{self.version} has been downloaded successfully.\n\n"
            "Restart now to apply the update?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )
        if reply == QMessageBox.StandardButton.Yes:
            self._apply_and_restart(file_path)
        else:
            self.accept()

    def _apply_and_restart(self, installer_path: str):
        """Launches installer and cleanly exits current app instance."""
        try:
            # Spawn installer detached
            subprocess.Popen([installer_path], shell=True)
            sys.exit(0)
        except Exception as e:
            QMessageBox.critical(self, "Error", f"Failed to launch update installer: {e}")

    def _on_download_failed(self, error: str):
        self.lbl_status.setText(f"Download failed: {error}")
        self.btn_action.setEnabled(True)
        self.progress_bar.setVisible(False)
        QMessageBox.warning(self, "Download Failed", f"Could not download update: {error}\nYou can download it manually from GitHub.")
