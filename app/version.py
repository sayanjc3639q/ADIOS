"""Version definition and Release Notes for ADIOS Personal Management."""
VERSION_MAJOR = 1
VERSION_MINOR = 0
VERSION_PATCH = 0
VERSION_STAGE = "alpha" # 'alpha' | 'beta' | 'rc' | 'stable'
VERSION_BUILD = 1

APP_VERSION = f"{VERSION_MAJOR}.{VERSION_MINOR}.{VERSION_PATCH}-{VERSION_STAGE}.{VERSION_BUILD}"
APP_CHANNEL = "Open Alpha Testing"
GITHUB_REPO = "sayanjc3639q/ADIOS"

RELEASE_NOTES = f"""
# ADIOS Personal Management — Version {APP_VERSION} ({APP_CHANNEL})

> **Notice**: This build is currently in open alpha testing for community feedback. 
> All 10 modules and SQLite local persistence are fully functional.

### 🧪 What's in {APP_VERSION}:
- **Testing Track**: Public open alpha testing release.
- **Tester Accounts**: Tester activation supported via the web portal.
- **Monorepo Architecture**: Clean separation between `packages/adios-core` and app suites.
- **Rupee (₹) Financial Formatting**: Full Indian Rupee integration across transactions, cash flows, and export reports.
- **Multiple Visual Themes**: Light Mode, Dark Classic, Monokai, Tokyo Night, High Contrast, and Kimbie Dark.
- **Unified Document Tabs**: Zero-gap tab strip with native responsive close buttons.
- **100% Offline-First Guarantee**: Everything runs locally in SQLite with rolling automated backups.
"""
