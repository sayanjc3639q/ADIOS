"""Icon Pack and Theme Manager for ADIOS.

Routes icon requests to SvgIconPack (crisp non-Windows vector SVGs) with support for
user custom SVG/image overrides. Also provides WinIcons fallback if requested.
"""
from __future__ import annotations
from PySide6.QtGui import QIcon
from app.core.svg_icons import SvgIconPack

class WinIcons:
    """Standard icon provider using custom SVG vector icons instead of Windows defaults."""

    @staticmethod
    def get(name: str, size: int = 24) -> QIcon:
        # Route directly to our custom vector SVG pack
        return SvgIconPack.get(name, size=size)
