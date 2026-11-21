# ADIOS - Project Architecture

ADIOS is organized into 3 cleanly decoupled folders:

```
ADIOS/
├── app/       # 1. Main Native Desktop Application (PySide6 / Qt)
├── public/    # 2. Public Website (Download Portal & Product Keys)
└── admin/     # 3. Admin Control Plane (Telemetry, Bandwidth & Rules) [Git Ignored]
```

---

## 1. Main Desktop App (`/app`)
* **Technology**: Python 3.12+, PySide6 (Qt)
* **Storage**: Local SQLite (`adios_data.db`), 100% offline-functional
* **How to Run**:
  ```powershell
  python -m app.main
  ```
  or:
  ```powershell
  python app/run.py
  ```
* **Build Standalone .exe**:
  ```powershell
  python -m PyInstaller --name "ADIOS" --windowed --onefile --collect-all PySide6 --add-data "app;app" app/main.py
  ```

---

## 2. Public Website (`/public`)
* **Purpose**: Download portal for users to get `ADIOS.exe`, start 3-day cloud sync trials, or purchase product keys.
* **Technology**: FastAPI, Uvicorn, Vanilla HTML/CSS
* **Port**: `http://127.0.0.1:3000`
* **How to Run**:
  ```powershell
  python public/run.py
  ```

---

## 3. Admin Control Plane (`/admin`)
* **Purpose**: Private telemetry, bandwidth monitoring (KB/MB per user), product key generator, and role permissions table.
* **Security**: Ignored in `.gitignore` (private to `jcsayan7@gmail.com`).
* **Port**: `http://127.0.0.1:8080/login`
* **How to Run**:
  ```powershell
  python admin/run.py
  ```

---

## Start Both Web Portals Simultaneously
```powershell
python start_web.py
```

## Running Tests
```powershell
python -m pytest -v
```
