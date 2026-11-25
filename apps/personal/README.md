# ADIOS Personal Desktop Manager
v2.0.0 (Native Qt Fusion & SQLite Engine)

## Running the application
```powershell
python apps/personal/main.py
# or from root:
python -m app.main
```

## Compiling Windows Installer
```powershell
python -m PyInstaller --noconfirm --onedir --windowed --name "ADIOS" --icon "resources/icon.ico" app/main.py
& "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe" installer.iss
```
