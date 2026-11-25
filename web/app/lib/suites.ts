export interface SuiteApp {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_development' | 'planned';
  statusLabel: string;
  price: number;
  shortDescription: string;
  description: string;
  keyPrefix: string;
  features: string[];
  ctaLabel: string;
  image: string;
  badge?: string;
  specifications: { label: string; value: string }[];
  overview: string[];
}

export const SUITE_APPS: SuiteApp[] = [
  {
    id: 'personal',
    name: 'ADIOS Personal Manager',
    category: 'Productivity & Private Finances',
    status: 'available',
    statusLabel: 'Available now',
    price: 999,
    shortDescription: 'High-speed offline desktop manager for Indian Rupee cashflow, exam dates, study pomodoro, and local SQLite data.',
    description: 'A sovereign desktop command center built with Qt 6 and Python. Designed specifically for students, self-employed professionals, and researchers who require total offline isolation without cloud subscriptions.',
    keyPrefix: 'ADIOS-PERS',
    ctaLabel: 'Download for Windows',
    image: '/app-screenshot.png',
    badge: 'Flagship Edition',
    specifications: [
      { label: 'Operating System', value: 'Windows 10 / 11 (64-bit), Linux (AppImage/PyPI)' },
      { label: 'Database Storage', value: 'Encrypted SQLite 3 (100% Offline Local File)' },
      { label: 'Interface Framework', value: 'Compiled Qt 6 / PySide6 with Native Windows Fluent Tokens' },
      { label: 'Licensing Model', value: 'Perpetual Lifetime Single-Machine License' },
      { label: 'Cloud Dependency', value: 'Zero (Optional End-to-End Encrypted Cloud Sync)' }
    ],
    overview: [
      'Engineered to solve tool sprawl: replace separate finance spreadsheets, task checklists, exam reminders, and habit trackers with one lightning-fast native binary.',
      'Stores every transaction, syllabus milestone, and pomodoro record locally on your physical disk with instant sub-millisecond query execution.',
      'Equipped with full Indian Rupee (₹) cashflow analytics, automated category breakdowns, and exportable data archives.'
    ],
    features: [
      '10 Core Modules built-in with zero SaaS lock-in',
      '₹ Indian Rupee financial cash flow & expenditure tracking',
      'Integrated Study Pomodoro timer & Exam syllabus planner',
      '100% Offline SQLite local persistence with instant hot backups'
    ]
  },
  {
    id: 'hospital',
    name: 'ADIOS Hospital Management (HMS)',
    category: 'Healthcare & Clinical',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 4999,
    shortDescription: 'Zero-latency hospital administration: OPD queue admissions, IPD bed matrix, doctor rosters, and pharmacy dispensing.',
    description: 'Clinical-grade offline administration software for clinics, nursing homes, and multi-specialty hospitals. Engineered to operate continuously during network outages.',
    keyPrefix: 'ADIOS-HOSP',
    ctaLabel: 'Explore Details',
    image: '/app-screenshot.png',
    specifications: [
      { label: 'Target Facilities', value: 'Daycare Clinics, Nursing Homes, Specialty Hospitals' },
      { label: 'Local LAN Mode', value: 'Multi-Workstation LAN Synchronization over SQLite/Postgres' },
      { label: 'HIPAA & Compliance', value: 'Encrypted At-Rest Patient Data Storage' },
      { label: 'Hardware Support', value: 'Thermal Slip Printers, Barcode Scanners, Cash Drawers' }
    ],
    overview: [
      'Handles fast OPD token generation, doctor room queues, and electronic prescription authoring with instant printed slips.',
      'Visual IPD bed occupancy grid with real-time admission, discharge, and nursing care transfer records.',
      'Integrated pharmacy inventory tracking with expiration batch control and tax-compliant billing.'
    ],
    features: [
      'Patient OPD & IPD admissions with automated token queues',
      'Interactive visual bed & ward occupancy matrix',
      'Doctor appointment schedules & clinical notes ledger',
      'Pharmacy dispensing with batch expiry management'
    ]
  },
  {
    id: 'hotel',
    name: 'ADIOS Hotel Management System',
    category: 'Hospitality & Front Desk',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 3999,
    shortDescription: 'Front-desk PMS engineered for speed: room booking matrix, guest photo ID verification, and restaurant dining POS.',
    description: 'A rugged front-desk property management system designed for boutique hotels, resorts, and guest houses where check-in delays cannot be tolerated.',
    keyPrefix: 'ADIOS-HOTL',
    ctaLabel: 'Explore Details',
    image: '/app-screenshot.png',
    specifications: [
      { label: 'Property Types', value: 'Hotels, Motels, Homestays, Guest Houses, Resorts' },
      { label: 'Device Integration', value: 'Passport/ID Flatbed Scanners, Keycard Encoders, Thermal Printers' },
      { label: 'Billing Formats', value: 'Room Folios, Restaurant KOT, Banquet Consolidated Invoices' }
    ],
    overview: [
      'Color-coded front desk matrix displaying occupied, reserved, vacant, and housekeeping-dirty rooms at a single glance.',
      'Instant ID scan and guest KYC archiving directly onto local storage.',
      'Restaurant dining and room service kitchen order ticketing (KOT) with automated room folio billing.'
    ],
    features: [
      'Interactive room booking grid & live occupancy calendar',
      'Guest ID proof capture & KYC document scanning at check-in',
      'Room service & restaurant dining POS with instant KOT',
      'Housekeeping housekeeping dirty/clean status schedules'
    ]
  },
  {
    id: 'billing',
    name: 'ADIOS Point of Sale & GST Billing',
    category: 'Commercial Retail & Wholesale',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 2499,
    shortDescription: 'Fast barcode checkout and compliant GST tax invoices (B2B/B2C), inventory alerts, and 80mm thermal receipts.',
    description: 'Ultra-fast retail billing and inventory management system designed for supermarkets, electronics stores, apparel shops, and distributors.',
    keyPrefix: 'ADIOS-BILL',
    ctaLabel: 'Explore Details',
    image: '/app-screenshot.png',
    specifications: [
      { label: 'Supported Scanners', value: 'USB & Bluetooth 1D/2D Barcode & QR Scanners' },
      { label: 'Print Outputs', value: '80mm / 58mm Thermal Receipts, Standard A4 / A5 Tax Invoices' },
      { label: 'GST Tax Engine', value: 'CGST, SGST, IGST, Cess with Automated HSN Code Lookups' }
    ],
    overview: [
      'Sub-second barcode checkout that never freezes or waits for external server requests.',
      'Full B2B GST tax invoice generation with buyer GSTIN validation and downloadable JSON/Excel GSTR reports.',
      'Real-time inventory deduction with low-stock warnings and vendor purchase bill entry.'
    ],
    features: [
      'Instant barcode scanning checkout with keyboard shortcuts',
      'GST tax invoices (CGST/SGST/IGST + HSN summary)',
      'Real-time low-stock alerts & purchase ledger tracking',
      '80mm & 58mm thermal receipt and A4 tax invoice printing'
    ]
  },
  {
    id: 'academics',
    name: 'ADIOS Academics & School Management',
    category: 'Schools, Colleges & Coaching',
    status: 'planned',
    statusLabel: 'Planned',
    price: 3499,
    shortDescription: 'Educational institution suite: student admissions, fee collections with alerts, exam marksheet generator, and attendance.',
    description: 'Comprehensive administrative suite for K-12 schools, coaching institutes, and colleges seeking offline autonomy and data sovereignty.',
    keyPrefix: 'ADIOS-ACAD',
    ctaLabel: 'Explore Details',
    image: '/app-screenshot.png',
    specifications: [
      { label: 'Institutions', value: 'Schools (CBSE/ICSE/State), Coaching Centers, Colleges' },
      { label: 'Report Formats', value: 'CBSE Grading Cards, Term Marksheets, Fee Payment Receipts' },
      { label: 'Data Security', value: 'Role-Based Student & Faculty Archive Access Control' }
    ],
    overview: [
      'Complete student lifecycle management from admission inquiries to graduation certificates.',
      'Configurable fee structures with multi-installment tracking and thermal fee receipt generation.',
      'Exam grade calculations, automated CGPA scoring, and printable report card generation.'
    ],
    features: [
      'Student admissions & digital records archive',
      'Term fee receipts & balance reminders with receipts',
      'Daily student & faculty attendance tracking ledger',
      'Exam marksheet & report card builder with custom grading'
    ]
  }
];
