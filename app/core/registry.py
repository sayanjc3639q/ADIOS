"""Central registry for sections and global actions in ADIOS."""
from __future__ import annotations
from typing import Dict, List, Type, Optional
import logging
from app.core.base_section import BaseSection

logger = logging.getLogger("adios.registry")

class SectionRegistry:
    """Registry maintaining all available sections."""

    def __init__(self, db: any):
        self.db = db
        self._sections: Dict[str, BaseSection] = {}
        self._section_order: List[str] = []

    def register(self, section_cls: Type[BaseSection]) -> BaseSection:
        """Instantiate and register a section class."""
        instance = section_cls(self.db)
        instance.registry = self # Provide registry reference
        if not instance.id:
            raise ValueError(f"Section class {section_cls.__name__} has no id defined.")
        
        # Initialize schema for section
        instance.init_schema()
        
        self._sections[instance.id] = instance
        if instance.id not in self._section_order:
            self._section_order.append(instance.id)
        
        logger.info("Registered section: %s (%s)", instance.name, instance.id)
        return instance

    def get(self, section_id: str) -> Optional[BaseSection]:
        return self._sections.get(section_id)

    def all_sections(self) -> List[BaseSection]:
        return [self._sections[sid] for sid in self._section_order if sid in self._sections]

    def count(self) -> int:
        return len(self._sections)
