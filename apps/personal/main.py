"""ADIOS Personal Desktop Manager entry point.

Direct runner pointing to the primary personal desktop management suite.
"""
from __future__ import annotations
import sys
from pathlib import Path

# Add workspace root and shared packages to sys.path
root_dir = Path(__file__).resolve().parent.parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from app.main import main

if __name__ == "__main__":
    main()
