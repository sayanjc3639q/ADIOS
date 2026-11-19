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

## Running Tests
```powershell
pytest -v
```

## Single .exe Build with PyInstaller
```powershell
pip install pyinstaller
pyinstaller --name "ADIOS" --windowed --onefile app/main.py
```
