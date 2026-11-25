"""SVG Icon Pack and Customizer for ADIOS.

Includes:
- Crisp vector SVG icons for all sections (Home, LinkedIn, Exams, Schedule, Money, Subscriptions, Clubs, Study, Projects, Skills, Journey)
- Vector SVGs for popular subscription providers (Netflix, Spotify, GitHub, AWS, ChatGPT/OpenAI, YouTube, Figma, Google, Adobe, Medium, LinkedIn, Generic)
- Vector SVGs for clubs and societies (Robotics/Coding, Debate, Music/Drama, Sports, Arts, General)
- App-wide options (Settings, Pomodoro, Calendar, Search, Quick Notes, User, Tags, Links, Reminders)
- Support for user-defined custom SVG / image files stored in SQLite settings or loaded from disk
"""
from __future__ import annotations
import os
from typing import Dict, Optional, List, Tuple
from PySide6.QtGui import QIcon, QPixmap, QPainter
from PySide6.QtSvg import QSvgRenderer
from PySide6.QtCore import QByteArray, Qt

# Crisp 24x24 vector SVG definitions
BUILTIN_SVGS: Dict[str, str] = {
    # SECTIONS
    "home": """<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>""",

    "linkedin": """<svg viewBox="0 0 24 24" fill="none" stroke="#0077B5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect x="2" y="9" width="4" height="12"/>
        <circle cx="4" cy="4" r="2"/>
    </svg>""",

    "exams": """<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <polyline points="10 8 13 11 17 6"/>
    </svg>""",

    "schedule": """<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <circle cx="12" cy="15" r="2"/>
    </svg>""",

    "money": """<svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="6" y1="3" x2="18" y2="3"/>
        <line x1="6" y1="8" x2="18" y2="8"/>
        <path d="M6 13l6.5 8"/>
        <path d="M6 3h3a4.5 4.5 0 0 1 4.5 4.5c0 2.485-2.015 4.5-4.5 4.5H6"/>
    </svg>""",

    "subscriptions": """<svg viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
        <polyline points="16 16 18 14 20 16"/>
    </svg>""",

    "clubs": """<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>""",

    "study": """<svg viewBox="0 0 24 24" fill="none" stroke="#EA580C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
    </svg>""",

    "project": """<svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
    </svg>""",

    "skills": """<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>""",

    "journey": """<svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>""",

    # SUBSCRIPTION PROVIDERS
    "provider_netflix": """<svg viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#E50914"/>
        <path d="M7 4h3v16H7zM14 4h3v16h-3z" fill="#000000" opacity="0.3"/>
        <path d="M7 4h3l4 16h-3z" fill="#FFFFFF"/>
    </svg>""",

    "provider_spotify": """<svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#1DB954"/>
        <path d="M6 9c4-1 9-1 12 1M7 12.5c3.5-.8 7.5-.8 10 .8M8 15.5c2.8-.6 6-.6 8 .6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
    </svg>""",

    "provider_github": """<svg viewBox="0 0 24 24" fill="#24292E">
        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>""",

    "provider_openai": """<svg viewBox="0 0 24 24" fill="none" stroke="#10A37F" stroke-width="2">
        <path d="M12 2a4 4 0 0 1 4 4v2h2a4 4 0 0 1 4 4v2h-2v2a4 4 0 0 1-4 4h-2v2a4 4 0 0 1-4 4 4 4 0 0 1-4-4v-2H6a4 4 0 0 1-4-4v-2h2v-2a4 4 0 0 1 4-4h2V6a4 4 0 0 1 4-4z"/>
        <circle cx="12" cy="12" r="3" fill="#10A37F"/>
    </svg>""",

    "provider_youtube": """<svg viewBox="0 0 24 24" fill="none">
        <rect x="2" y="4" width="20" height="16" rx="4" fill="#FF0000"/>
        <polygon points="10 8 16 12 10 16" fill="#FFFFFF"/>
    </svg>""",

    "provider_figma": """<svg viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="7" height="7" rx="3.5" fill="#F24E1E"/>
        <rect x="12" y="2" width="7" height="7" rx="3.5" fill="#FF7262"/>
        <rect x="5" y="9" width="7" height="7" rx="3.5" fill="#A259FF"/>
        <circle cx="15.5" cy="12.5" r="3.5" fill="#1ABCFE"/>
        <rect x="5" y="16" width="7" height="7" rx="3.5" fill="#0ACF83"/>
    </svg>""",

    "provider_adobe": """<svg viewBox="0 0 24 24" fill="#FA0F00">
        <polygon points="14.5 4 19.5 19 16 19 13.8 12.5 10.2 12.5 8 19 4.5 19 9.5 4"/>
        <polygon points="12 7.5 10.8 11 13.2 11" fill="#FFFFFF"/>
    </svg>""",

    "provider_aws": """<svg viewBox="0 0 24 24" fill="none" stroke="#FF9900" stroke-width="2">
        <path d="M4 14c4 3 12 3 16 0"/>
        <polyline points="17 14 20 14 18 17"/>
        <path d="M7 8l2.5 5L12 8l2.5 5L17 8"/>
    </svg>""",

    "provider_google": """<svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="#4285F4" stroke-width="2"/>
        <path d="M12 7v5h5" stroke="#EA4335" stroke-width="2"/>
        <path d="M7 12a5 5 0 0 0 8 4" stroke="#34A853" stroke-width="2"/>
    </svg>""",

    "provider_generic": """<svg viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2">
        <rect x="2" y="5" width="20" height="14" rx="3"/>
        <line x1="2" y1="10" x2="22" y2="10"/>
        <circle cx="6" cy="15" r="1" fill="#64748B"/>
    </svg>""",

    # CLUBS & SOCIETIES
    "club_robotics": """<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
        <rect x="3" y="11" width="18" height="10" rx="2"/>
        <circle cx="12" cy="5" r="2"/>
        <line x1="12" y1="7" x2="12" y2="11"/>
        <line x1="8" y1="16" x2="8.01" y2="16"/>
        <line x1="16" y1="16" x2="16.01" y2="16"/>
    </svg>""",

    "club_debate": """<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="8" y1="9" x2="16" y2="9"/>
        <line x1="8" y1="13" x2="14" y2="13"/>
    </svg>""",

    "club_music": """<svg viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
    </svg>""",

    "club_sports": """<svg viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20"/>
    </svg>""",

    "club_arts": """<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2">
        <path d="M12 19l7-7 3 3-7 7-3-3z"/>
        <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
        <path d="M2 2l7.586 7.586"/>
        <circle cx="11" cy="11" r="2"/>
    </svg>""",

    "club_general": """<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    </svg>""",

    # GENERAL TOOLS / CONTROLS
    "settings": """<svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>""",

    "pomodoro": """<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2">
        <circle cx="12" cy="13" r="8"/>
        <path d="M12 9v4l2 2"/>
        <path d="M12 5V2M10 2h4"/>
    </svg>""",

    "calendar": """<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>""",

    "user": """<svg viewBox="0 0 24 24" fill="none" stroke="#0F172A" stroke-width="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
    </svg>""",

    "search": """<svg viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>""",

    "new": """<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
        <line x1="12" y1="5" x2="12" y2="19"/>
        <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>""",

    "save": """<svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
        <polyline points="17 21 17 13 7 13 7 21"/>
        <polyline points="7 3 7 8 15 8"/>
    </svg>""",

    "delete": """<svg viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2">
        <polyline points="3 6 5 6 21 6"/>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>""",

    "refresh": """<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2">
        <polyline points="23 4 23 10 17 10"/>
        <polyline points="1 20 1 14 7 14"/>
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>""",

    "open": """<svg viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>""",

    "tag": """<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
    </svg>""",

    "link": """<svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>""",

    "clock": """<svg viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
    </svg>""",

    "pin": """<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"/>
        <path d="M5 17h14v-2l-2-2V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v8l-2 2v2z" fill="#3B82F6"/>
    </svg>""",

    "pin_outline": """<svg viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="12" y1="17" x2="12" y2="22"/>
        <path d="M5 17h14v-2l-2-2V5a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v8l-2 2v2z"/>
    </svg>""",

    # SKILL PRESETS
    "skill_python": """<svg viewBox="0 0 24 24" fill="none">
        <path d="M12 2c-3.5 0-5 1.5-5 3.5V8h5v1H5.5C3.5 9 2 10.5 2 14s1.5 5 3.5 5H7v-2.5c0-1.5 1-2.5 2.5-2.5h5c1.5 0 2.5-1 2.5-2.5V8c0-3.5-2.5-6-5-6z" fill="#3776AB"/>
        <circle cx="9" cy="5" r="1" fill="#FFFFFF"/>
        <path d="M12 22c3.5 0 5-1.5 5-3.5V16h-5v-1h6.5c2 0 3.5-1.5 3.5-5s-1.5-5-3.5-5H17v2.5c0 1.5-1 2.5-2.5 2.5h-5c-1.5 0-2.5 1-2.5 2.5V16c0 3.5 2.5 6 5 6z" fill="#FFD43B"/>
        <circle cx="15" cy="19" r="1" fill="#FFFFFF"/>
    </svg>""",

    "skill_javascript": """<svg viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="3" fill="#F7DF1E"/>
        <path d="M7 13v5c0 1.5 1 2.5 2.5 2.5 1.5 0 2-.8 2-1.5" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
        <path d="M14 17.5c.5.8 1.2 1.5 2.3 1.5 1.2 0 2-.6 2-1.4 0-1-.8-1.4-2.2-2-1.8-.7-3-1.4-3-3.3 0-1.8 1.4-3.3 3.4-3.3 1.5 0 2.6.6 3.3 1.8" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    </svg>""",

    "skill_typescript": """<svg viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="3" fill="#3178C6"/>
        <path d="M4 10h8m-4 0v9" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round"/>
        <path d="M13 16.5c.5.6 1.1 1.2 2 1.2 1 0 1.6-.5 1.6-1.1 0-.8-.7-1.1-1.8-1.5-1.5-.6-2.5-1.1-2.5-2.5 0-1.4 1.1-2.4 2.7-2.4 1.2 0 2.1.5 2.6 1.4" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
    </svg>""",

    "skill_react": """<svg viewBox="0 0 24 24" fill="none" stroke="#61DAFB" stroke-width="1.8">
        <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(30 12 12)"/>
        <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(90 12 12)"/>
        <ellipse cx="12" cy="12" rx="4" ry="10" transform="rotate(150 12 12)"/>
        <circle cx="12" cy="12" r="2" fill="#61DAFB"/>
    </svg>""",

    "skill_database": """<svg viewBox="0 0 24 24" fill="none" stroke="#336791" stroke-width="2">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
    </svg>""",

    "skill_docker": """<svg viewBox="0 0 24 24" fill="none">
        <path d="M2 13c1 0 2.5 1 4 1 2.5 0 3.5-2 6-2 3 0 4 2 6 2 2 0 3-1 4-1" stroke="#2496ED" stroke-width="2"/>
        <rect x="5" y="9" width="3" height="3" fill="#2496ED"/>
        <rect x="9" y="9" width="3" height="3" fill="#2496ED"/>
        <rect x="13" y="9" width="3" height="3" fill="#2496ED"/>
        <rect x="9" y="5" width="3" height="3" fill="#2496ED"/>
    </svg>""",

    "skill_cloud": """<svg viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
    </svg>""",

    "skill_git": """<svg viewBox="0 0 24 24" fill="none" stroke="#F05032" stroke-width="2">
        <circle cx="18" cy="6" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="18" r="3"/>
        <path d="M9 12h3a3 3 0 0 0 3-3V6m0 12v-3a3 3 0 0 0-3-3"/>
    </svg>""",

    # JOURNEY / MILESTONE PRESETS
    "journey_award": """<svg viewBox="0 0 24 24" fill="none" stroke="#EAB308" stroke-width="2">
        <circle cx="12" cy="8" r="6"/>
        <path d="M15.48 13.92L18 22l-6-3-6 3 2.52-8.08"/>
    </svg>""",

    "journey_promotion": """<svg viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2">
        <polyline points="18 15 12 9 6 15"/>
        <polyline points="18 9 12 3 6 9"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
    </svg>""",

    "journey_launch": """<svg viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
    </svg>""",

    "journey_cert": """<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2">
        <rect x="3" y="4" width="18" height="13" rx="2"/>
        <circle cx="12" cy="11" r="3"/>
        <path d="M10 17l-1 5 3-2 3 2-1-5"/>
    </svg>""",

    "journey_milestone": """<svg viewBox="0 0 24 24" fill="none" stroke="#0D9488" stroke-width="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>"""
}

# Grouped categories for the Icon Customization Settings UI
CUSTOMIZABLE_ICONS: List[Tuple[str, str, str]] = [
    # (Key, Display Label, Category)
    # Sections
    ("home", "Home Section", "Sections"),
    ("linkedin", "LinkedIn Queue", "Sections"),
    ("exams", "Exams Section", "Sections"),
    ("schedule", "Schedule Section", "Sections"),
    ("money", "Money / Accounts Section", "Sections"),
    ("subscriptions", "Subscriptions Section", "Sections"),
    ("clubs", "Clubs & Societies Section", "Sections"),
    ("study", "Study Tracker Section", "Sections"),
    ("project", "Project Wishlist Section", "Sections"),
    ("skills", "Skills Section", "Sections"),
    ("journey", "Development Journey Section", "Sections"),

    # Subscription Providers
    ("provider_netflix", "Netflix Provider", "Subscription Providers"),
    ("provider_spotify", "Spotify Provider", "Subscription Providers"),
    ("provider_github", "GitHub Provider", "Subscription Providers"),
    ("provider_openai", "OpenAI / ChatGPT Provider", "Subscription Providers"),
    ("provider_youtube", "YouTube Provider", "Subscription Providers"),
    ("provider_figma", "Figma Provider", "Subscription Providers"),
    ("provider_adobe", "Adobe Creative Cloud", "Subscription Providers"),
    ("provider_aws", "Amazon AWS Provider", "Subscription Providers"),
    ("provider_google", "Google Cloud / Workspace", "Subscription Providers"),
    ("provider_generic", "Generic Subscription", "Subscription Providers"),

    # Clubs & Societies
    ("club_robotics", "Robotics & Coding Club", "Clubs & Societies"),
    ("club_debate", "Debate & Oratory Club", "Clubs & Societies"),
    ("club_music", "Music, Dance & Drama Club", "Clubs & Societies"),
    ("club_sports", "Sports & Athletics Club", "Clubs & Societies"),
    ("club_arts", "Fine Arts & Design Club", "Clubs & Societies"),
    ("club_general", "General Society", "Clubs & Societies"),

    # Tools & In-App Options
    ("settings", "Settings Option", "In-App Tools"),
    ("pomodoro", "Pomodoro Timer Dock", "In-App Tools"),
    ("calendar", "Calendar Dock Window", "In-App Tools"),
    ("search", "Global Search Box", "In-App Tools"),
    ("user", "Account / Profile Icon", "In-App Tools"),
    ("tag", "Tag Icon", "In-App Tools"),
    ("link", "Linked Item Icon", "In-App Tools"),
    ("clock", "Reminder / Clock Icon", "In-App Tools"),
    ("pin", "Pin Tab Icon", "In-App Tools"),

    # Skill Presets
    ("skill_python", "Python", "Skill Icons"),
    ("skill_javascript", "JavaScript", "Skill Icons"),
    ("skill_typescript", "TypeScript", "Skill Icons"),
    ("skill_react", "React / Frontend", "Skill Icons"),
    ("skill_database", "Database / SQL", "Skill Icons"),
    ("skill_docker", "Docker / DevOps", "Skill Icons"),
    ("skill_cloud", "Cloud Infrastructure", "Skill Icons"),
    ("skill_git", "Git / Version Control", "Skill Icons"),

    # Journey Presets
    ("journey_award", "Award / Honor", "Journey Milestones"),
    ("journey_promotion", "Promotion / Advancement", "Journey Milestones"),
    ("journey_launch", "Product Launch / Release", "Journey Milestones"),
    ("journey_cert", "Certification Completed", "Journey Milestones"),
    ("journey_milestone", "Core Technical Milestone", "Journey Milestones"),
]


class SvgIconPack:
    """Renders crisp vector SVGs and caches icons."""

    _cache: Dict[str, QIcon] = {}

    @classmethod
    def get(cls, key: str, size: int = 24) -> QIcon:
        key_lower = key.lower()

        # Check in-memory cache
        cache_id = f"{key_lower}_{size}"
        if cache_id in cls._cache:
            return cls._cache[cache_id]

        # 1. Check if user configured a custom image file in settings
        custom_path = None
        try:
            import sqlite3
            conn = sqlite3.connect("adios_data.db")
            cur = conn.cursor()
            cur.execute("SELECT value FROM settings WHERE key = ?", (f"icon_custom_{key_lower}",))
            row = cur.fetchone()
            if row and row[0] and os.path.exists(row[0]):
                custom_path = row[0]
            conn.close()
        except Exception:
            pass

        if custom_path:
            icon = QIcon(custom_path)
            if not icon.isNull():
                cls._cache[cache_id] = icon
                return icon

        # 2. Render from built-in SVG vector bank
        svg_xml = BUILTIN_SVGS.get(key_lower)
        if not svg_xml:
            # Fallback mappings
            alias_map = {
                "folder": "open",
                "backup": "save",
                "restore": "refresh",
                "save_all": "save",
                "close": "delete",
                "help": "study",
                "info": "journey",
                "shield": "skills",
            }
            svg_xml = BUILTIN_SVGS.get(alias_map.get(key_lower, "project"))

        if svg_xml:
            icon = cls.render_svg(svg_xml, size=size)
            cls._cache[cache_id] = icon
            return icon

        return QIcon()

    @classmethod
    def render_svg(cls, svg_xml: str, size: int = 24) -> QIcon:
        try:
            byte_data = QByteArray(svg_xml.encode("utf-8"))
            renderer = QSvgRenderer(byte_data)
            pixmap = QPixmap(size, size)
            pixmap.fill(Qt.GlobalColor.transparent)
            painter = QPainter(pixmap)
            renderer.render(painter)
            painter.end()
            return QIcon(pixmap)
        except Exception:
            return QIcon()

    @classmethod
    def clear_cache(cls):
        cls._cache.clear()
