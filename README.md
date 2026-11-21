# ADIOS - Personal Desktop Management Application

Classic early-2000s Windows native desktop personal manager built with Python and PySide6 (Qt).

## Requirements
- Python 3.12+ (tested on Python 3.14)
- PySide6
- python-dateutil
- pytest

## Setup
```powershell
pip install -r requirements.txt
```

## Running the Application
```powershell
python -m app.main
```
or:
```powershell
python app/main.py
```

## Running Tests
```powershell
python -m pytest -v
```

## Single .exe Build with PyInstaller
Install PyInstaller (if not already installed):
```powershell
pip install pyinstaller
```

Build the standalone Windows executable using Python module execution (avoids PATH issues):
```powershell
python -m PyInstaller --name "ADIOS" --windowed --onefile --collect-all PySide6 --add-data "app;app" app/main.py
```

Or standard single-file build:
```powershell
python -m PyInstaller --name "ADIOS" --windowed --onefile app/main.py
```

The output executable will be placed in the `dist/` directory (`dist/ADIOS.exe`).
