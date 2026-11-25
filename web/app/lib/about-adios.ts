export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const FAQS: FAQItem[] = [
  {
    category: 'Architecture & Offline',
    question: 'How does ADIOS work without an internet connection or cloud servers?',
    answer: 'ADIOS applications are compiled directly as native desktop executables using Qt 6 and high-speed local runtimes. All your operational data—such as patient files, hotel bookings, inventory, and cash flow records—is written straight to an encrypted SQLite database stored securely on your own hard drive. You can disconnect your Wi-Fi, Ethernet, or operate in remote areas with zero interruption.'
  },
  {
    category: 'Licensing & Pricing',
    question: 'What does "Perpetual License" mean? Are there hidden monthly subscriptions?',
    answer: 'No recurring subscriptions ever. When you purchase an ADIOS suite license, you own that version perpetually for life on your device. Unlike modern SaaS tools that hold your operational records hostage behind a monthly paywall, ADIOS guarantees your software and data remain yours forever.'
  },
  {
    category: 'Data & Privacy',
    question: 'Where is my business and customer data kept? Does ADIOS track our operations?',
    answer: '100% of your data remains on your physical machine. We have zero telemetry tracking your financial balances, patient admissions, student grades, or customer details. Hot automated backups can be exported locally to any USB drive, external hard drive, or local network folder at any moment.'
  },
  {
    category: 'Deployment & Setup',
    question: 'Can I install ADIOS on multiple computers or local LAN networks?',
    answer: 'Yes! Community Free builds can be installed on as many machines as you like without license restrictions. For enterprise multi-counter billing (such as Hospital HMS OPD/IPD desks or POS retail checkouts), our suites support local area network (LAN) database sharing without needing any external public internet.'
  },
  {
    category: 'Sync & Multi-Device',
    question: 'Is cloud backup or sync available if I use both a desktop and a laptop?',
    answer: 'Yes, optional end-to-end encrypted multi-device sync is available for license holders. Your data is AES-256 encrypted on your machine using your own client key before touching the sync pipeline, meaning neither we nor any third party can ever view your records.'
  },
  {
    category: 'Platforms & Installation',
    question: 'Which operating systems and hardware are supported?',
    answer: 'ADIOS is optimized for Windows 10 and 11 (64-bit) with official Inno Setup installers, and Linux (Ubuntu, Debian, Fedora, Arch) via PyPI and AppImage. macOS Apple Silicon builds are currently in development for our next major cycle.'
  }
];

export interface UniquenessStory {
  tag: string;
  title: string;
  description: string;
  points: string[];
  image: string;
  badge: string;
  metrics: { label: string; value: string }[];
}

export const UNIQUENESS_STORIES: UniquenessStory[] = [
  {
    tag: 'SOVEREIGN ARCHITECTURE',
    title: 'Zero Latency. Zero Cloud Lock-In. 100% Local SQLite.',
    description: 'Modern business software has become bloated web wrappers trapped behind monthly paywalls and internet outages. ADIOS is built differently: a compiled, native desktop experience where queries resolve in under 2 milliseconds and your business operations never halt when the internet goes down.',
    points: [
      'Native compiled binary with instant sub-millisecond local SQLite queries',
      'Never blocked by external server downtime, ISP outages, or cloud maintenance',
      'All business data stays physically on your machine—no remote surveillance'
    ],
    image: '/app-screenshot.png',
    badge: 'Hardware Performance',
    metrics: [
      { label: 'Query Latency', value: '< 2ms' },
      { label: 'Offline Independence', value: '100%' },
      { label: 'Cloud Lock-in', value: '0%' }
    ]
  },
  {
    tag: 'GENUINE OWNERSHIP',
    title: 'Perpetual Licensing: Own Your Software for Life.',
    description: 'Why rent what you can own? ADIOS ends SaaS fatigue with honest perpetual licensing. One payment grants you lifetime access to run the software on your hardware forever, with complimentary minor version updates and total freedom from monthly bills.',
    points: [
      'One-time lifetime perpetual key—no monthly fees or forced auto-renewals',
      'Continuous uninterrupted software execution even if you never update again',
      'Full exportability of all tables to standard open formats (CSV, JSON, SQL)'
    ],
    image: '/app-screenshot.png',
    badge: 'Economic Freedom',
    metrics: [
      { label: 'Recurring Fees', value: '₹0 / mo' },
      { label: 'Data Portability', value: 'Open SQL' },
      { label: 'License Lifespan', value: 'Perpetual' }
    ]
  },
  {
    tag: 'ENGINEERED COHESION',
    title: 'One Cohesive Ecosystem for Personal & Enterprise Operations.',
    description: 'Whether managing private investments and exams or running clinical admissions and retail GST billing, every ADIOS suite shares the same battle-tested design tokens, keyboard-first navigation shortcuts, and unbreakable data reliability standards.',
    points: [
      'Consistent, fluent keyboard shortcuts designed for high-speed operator workflows',
      'Modular architecture ready for Hospital, Hotel, POS Billing, and Education',
      'Built with Qt 6 native controls for smooth 60fps rendering without Chromium bloat'
    ],
    image: '/app-screenshot.png',
    badge: 'Modular Framework',
    metrics: [
      { label: 'RAM Footprint', value: '~45 MB' },
      { label: 'Startup Time', value: '< 0.8s' },
      { label: 'UI Frame Rate', value: '60 FPS' }
    ]
  }
];
