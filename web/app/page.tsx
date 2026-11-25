'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Sparkles,
  Check,
  Plus,
  Trash2,
  ShoppingCart,
  Download,
  User,
  Key,
  Eye,
  EyeOff,
  Copy,
  ChevronRight,
  ShieldCheck,
  Building2,
  Hotel,
  Receipt,
  GraduationCap,
  Users,
  Search,
  FileText,
  Share2,
  Mail,
  Send,
  HelpCircle,
  Video,
  FileSearch,
  Layout,
  Briefcase,
  Layers,
  ArrowRight,
  Sliders,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

// ------------------- APPLICATION SUITES DATA -------------------
interface SuiteApp {
  id: string;
  name: string;
  badge: string;
  category: string;
  status: 'available' | 'in_development' | 'planned';
  statusLabel: string;
  price: number;
  description: string;
  keyPrefix: string;
  features: string[];
  accentColor: string;
}

const SUITE_APPS: SuiteApp[] = [
  {
    id: 'personal',
    name: 'ADIOS Personal Manager',
    badge: 'Desktop V2 Core',
    category: 'Productivity & Private Finances',
    status: 'available',
    statusLabel: 'Open Alpha (Live Testing)',
    price: 999,
    description: 'All 10 personal modules: rupee transactions, exam schedules, study timer, and rolling backups.',
    keyPrefix: 'ADIOS-PERS',
    accentColor: '#0078d4',
    features: [
      'Money transactions & accounts in Indian Rupees (₹)',
      'Exam schedule, syllabus & seat tracking',
      'Integrated study tracker with Pomodoro timer',
      'Subscriptions tracker with 14-day renewal warnings',
      'Automated rolling SQLite database backups'
    ]
  },
  {
    id: 'hospital',
    name: 'ADIOS Hospital Management (HMS)',
    badge: 'Enterprise Healthcare',
    category: 'Clinical & Patient Operations',
    status: 'in_development',
    statusLabel: 'Early Access (Q1 2027)',
    price: 4999,
    description: 'High-reliability hospital operation platform: OPD queue scheduling, IPD bed allocations, doctor rosters, and pharmacy inventory.',
    keyPrefix: 'ADIOS-HOSP',
    accentColor: '#d13438',
    features: [
      'Patient registration with OPD appointment queues',
      'IPD ward beds & occupancy tracking matrix',
      'Doctor schedules, clinical notes & digital prescriptions',
      'Pharmacy dispensing with batch & expiry tracking',
      'Hospital billing, test receipts & claims ledger'
    ]
  },
  {
    id: 'hotel',
    name: 'ADIOS Hotel Management System',
    badge: 'Hospitality Core',
    category: 'Lodging & Guest Experience',
    status: 'in_development',
    statusLabel: 'Early Access (Q1 2027)',
    price: 3999,
    description: 'Intuitive front-desk PMS: room reservation calendar matrix, guest photo ID verification, banquet bookings, and kitchen dining POS.',
    keyPrefix: 'ADIOS-HOTL',
    accentColor: '#ca5010',
    features: [
      'Interactive room booking calendar matrix',
      'Fast guest check-in with ID proof capture',
      'Dining room service & restaurant billing POS',
      'Housekeeping schedules & maintenance tracking',
      'Banquet & event hall reservation ledger'
    ]
  },
  {
    id: 'billing',
    name: 'ADIOS Point of Sale & GST Billing',
    badge: 'Commercial Retail',
    category: 'Retail, Wholesale & Inventory',
    status: 'in_development',
    statusLabel: 'Early Access (Q1 2027)',
    price: 2499,
    description: 'High-speed desktop checkout: barcode scanning, GST compliant invoices (B2B/B2C), stock alerts, and 80mm thermal receipt printing.',
    keyPrefix: 'ADIOS-BILL',
    accentColor: '#107c10',
    features: [
      'Sub-second barcode checkout & item scanning',
      'GST tax invoices (CGST/SGST/IGST + HSN lookup)',
      'Real-time low-stock alerts & vendor purchase orders',
      'Instant thermal 80mm / 58mm & A4 invoice printing',
      'Customer accounts ledger & credit management'
    ]
  },
  {
    id: 'academics',
    name: 'ADIOS Academics & School Management',
    badge: 'Institutional Education',
    category: 'Schools, Colleges & Coaching',
    status: 'planned',
    statusLabel: 'Planned (Q2 2027)',
    price: 3499,
    description: 'School administration platform: student admissions, fee collections with automated SMS alerts, exam marksheet generation, and attendance.',
    keyPrefix: 'ADIOS-ACAD',
    accentColor: '#5c2d91',
    features: [
      'Student admissions & digital document archive',
      'Term fee receipts & automated balance reminders',
      'Daily student & faculty attendance tracking',
      'Comprehensive exam marksheet & report card builder',
      'Timetable manager & campus notice broadcasts'
    ]
  }
];

// ------------------- 20 AI UNSLOP DELIVERABLES -------------------
interface UnslopItem {
  id: number;
  title: string;
  category: 'High-Volume Communication' | 'High-Impact Strategy';
  icon: string;
  problem: string;
  solution: string;
  slopExample: string;
  unslopExample: string;
  deliverableBadge: string;
}

const UNSLOP_ITEMS: UnslopItem[] = [
  // High-Volume Communications (1 to 15)
  {
    id: 1,
    title: 'Blog posts and articles',
    category: 'High-Volume Communication',
    icon: 'FileText',
    deliverableBadge: 'Editorial Content',
    problem: 'Generic fluff ("In today\'s fast-paced digital world...", "it is important to remember...") with zero original data or stance.',
    solution: 'Cuts preamble. Leads with primary thesis, proprietary benchmark numbers, and practical implementation trade-offs.',
    slopExample: '"In the modern digital landscape of 2026, technology plays a pivotal role in revolutionizing our daily operational workflows..."',
    unslopExample: '"Native Qt 6 code boots 4.2x faster than Chromium wrappers and uses 48MB RAM versus 820MB under load."'
  },
  {
    id: 2,
    title: 'Social media content (LinkedIn, Twitter, etc.)',
    category: 'High-Volume Communication',
    icon: 'Share2',
    deliverableBadge: 'Social Growth',
    problem: 'Forced emoji chains (🚀🔥💡), pretentious humblebrag hooks ("I was humbled to learn..."), and fabricated morality tales.',
    solution: 'Crisp signal-to-noise ratio. Real architecture teardowns, actual commit logs, and engineering lessons learned.',
    slopExample: '"🚀 Thrilled and humbled to announce that we are disrupting paradigms! Agree? Thoughts? 👇"',
    unslopExample: '"We replaced Electron with PySide6. Binary size dropped from 140MB to 34MB. Here are the 3 profiling diffs."'
  },
  {
    id: 3,
    title: 'Email campaigns and sequences',
    category: 'High-Volume Communication',
    icon: 'Mail',
    deliverableBadge: 'Lifecycle Marketing',
    problem: 'Robotic templates, exaggerated urgency ("Act NOW before this closes forever!"), and tone-deaf personalization tokens.',
    solution: 'Straightforward plain-text communication respecting the user\'s attention with a single, clear purpose.',
    slopExample: '"Hope this email finds you well in these unprecedented times! Are you maximizing your true synergy?"',
    unslopExample: '"Your ADIOS offline backup completed at 18:00 today. 14 items archived to your D: drive."'
  },
  {
    id: 4,
    title: 'Sales outreach (cold emails)',
    category: 'High-Volume Communication',
    icon: 'Send',
    deliverableBadge: 'Outbound Sales',
    problem: 'Fake familiarity ("Saw you work at X!"), endless paragraphs asking for "15 minutes of your time", and vague value propositions.',
    solution: 'Three-sentence problem-solver: names the specific friction, shows concrete proof, and gives a zero-friction opt-in.',
    slopExample: '"I\'d love to pick your brain for 15 minutes to synergize your enterprise pipeline."',
    unslopExample: '"Most hospital OPD desks lose 12 minutes per admission to web browser latency. Here is a 30-second video of ADIOS offline check-in."'
  },
  {
    id: 5,
    title: 'Ad copy (Google, Meta, LinkedIn)',
    category: 'High-Volume Communication',
    icon: 'Sparkles',
    deliverableBadge: 'Paid Performance',
    problem: 'Clickbait buzzwords ("Revolutionize your life with AI!") that lead to low intent and high bounce rates.',
    solution: 'Benefit-driven technical clarity with upfront pricing and verified platform capabilities.',
    slopExample: '"The #1 AI-powered super app changing the universe forever. Click here now!"',
    unslopExample: '"Offline-first GST Billing & Barcode POS. Zero recurring subscriptions. Perpetual license for ₹2,499."'
  },
  {
    id: 6,
    title: 'Support responses',
    category: 'High-Volume Communication',
    icon: 'HelpCircle',
    deliverableBadge: 'Customer Success',
    problem: 'Patronizing canned empathy ("I truly understand your immense frustration") without actually answering the technical question.',
    solution: 'Direct, polite troubleshooting steps, immediate resolution, and exact file paths.',
    slopExample: '"We hear you, and we sincerely apologize for any profound inconvenience this experience has caused you!"',
    unslopExample: '"To restore your database, copy your backup file to C:\\Users\\...\\adios.db and restart the application."'
  },
  {
    id: 7,
    title: 'Product descriptions',
    category: 'High-Volume Communication',
    icon: 'Briefcase',
    deliverableBadge: 'Catalog & Store',
    problem: 'Adjective stuffing ("revolutionary, groundbreaking, best-in-class") that says nothing about what the product actually does.',
    solution: 'Technical specifications, supported file formats, exact dimensions, and runtime prerequisites.',
    slopExample: '"A revolutionary, cutting-edge paradigm designed to elevate your personal journey."',
    unslopExample: '"64-bit Windows offline executable. Stores transactions locally in SQLite with ₹ Indian Rupee formatting."'
  },
  {
    id: 8,
    title: 'Meeting summaries',
    category: 'High-Volume Communication',
    icon: 'Users',
    deliverableBadge: 'Productivity',
    problem: 'Lengthy transcripts of pleasantries with unassigned, vague action items like "Team will look into synergies".',
    solution: 'Structured: Decisions Made, Open Blockers, and Owners with specific target dates.',
    slopExample: '"The attendees engaged in a lively and robust discussion about various strategic viewpoints."',
    unslopExample: '"Decision: Hospital OPD check-in will run offline-first. Owner: Sayan. Date: Dec 1."'
  },
  {
    id: 9,
    title: 'Video scripts',
    category: 'High-Volume Communication',
    icon: 'Video',
    deliverableBadge: 'Media & Demos',
    problem: 'Over-scripted intros ("What is up guys, don\'t forget to like and subscribe") before touching any real product screen.',
    solution: 'Immediate hook displaying product UI in frame 1, followed by a fast step-by-step walkthrough.',
    slopExample: '"Hey everybody! Before we dive into today\'s mindblowing video, smash that bell icon!"',
    unslopExample: '"Here is how you generate a GST thermal invoice in 1.2 seconds without internet."'
  },
  {
    id: 10,
    title: 'SEO content briefs',
    category: 'High-Volume Communication',
    icon: 'FileSearch',
    deliverableBadge: 'Search Strategy',
    problem: 'Keyword stuffing lists with repetitive header structures designed solely to fool search engines.',
    solution: 'Search intent mapping, user pain points, competitor gaps, and verifiable reference citations.',
    slopExample: '"Keywords: best management app, top management app 2026, buy management app online free."',
    unslopExample: '"Intent: Clinic administrators looking for offline OPD prescription software that works without cloud outages."'
  },
  {
    id: 11,
    title: 'Landing page copy',
    category: 'High-Volume Communication',
    icon: 'Layout',
    deliverableBadge: 'Conversion UI',
    problem: 'Hero banners full of meaningless abstract poetry ("Transform the way you see tomorrow").',
    solution: 'Bold, transparent headline stating what the software does, who it is for, and how much it costs.',
    slopExample: '"Reimagine the canvas of your operational dreams through next-generation intelligence."',
    unslopExample: '"Offline-first desktop management suites for Personal Finances, Hospitals, Hotels, POS & Academics."'
  },
  {
    id: 12,
    title: 'Follow-up emails',
    category: 'High-Volume Communication',
    icon: 'Send',
    deliverableBadge: 'Sales Cadence',
    problem: 'Aggressive guilt-trips ("Just bubbling this to the top of your inbox since you didn\'t reply").',
    solution: 'Shares a newly released relevant feature or benchmark without demanding emotional labor.',
    slopExample: '"I see you have been ignoring my emails. Did I say something wrong?"',
    unslopExample: '"We just added ₹ Rupee PDF report exports in v2.0.0-alpha.1. You can test the Windows installer here."'
  },
  {
    id: 13,
    title: 'Case study drafts',
    category: 'High-Volume Communication',
    icon: 'CheckCircle2',
    deliverableBadge: 'Customer Proof',
    problem: 'Fictionalized testimonials praising "the incredible seamless team" without a single verified metric.',
    solution: 'Rigorous before-and-after baseline metrics: latency, hardware costs, license savings, and uptime.',
    slopExample: '"Client X felt so much more harmonious and empowered after adopting our solution!"',
    unslopExample: '"Clinic reduced patient admission wait times from 8.5 minutes to 45 seconds using offline local SQLite storage."'
  },
  {
    id: 14,
    title: 'Email newsletter content',
    category: 'High-Volume Communication',
    icon: 'Mail',
    deliverableBadge: 'Subscriber Value',
    problem: 'Weekly digests consisting of curated link dumps without original commentary or proprietary insight.',
    solution: 'One deep engineering teardown per edition with source code snippets and reproducible benchmarks.',
    slopExample: '"Here are 15 AI tools you cannot live without this Tuesday! Tool 1 will shock you!"',
    unslopExample: '"How Qt 6 memory arenas handle 50,000 ledger rows without triggering Python garbage collection pauses."'
  },
  {
    id: 15,
    title: 'Internal communications (Slack responses, etc.)',
    category: 'High-Volume Communication',
    icon: 'Share2',
    deliverableBadge: 'Team Alignment',
    problem: 'Endless back-and-forth threads discussing scheduling or replying with generic "looks good to me".',
    solution: 'Decisive, asynchronous answers with context, links, and explicit next steps.',
    slopExample: '"Hey team, thoughts on this? Maybe we should sync up to brainstorm about the plan?"',
    unslopExample: '"PR #42 approved. Merged to feature/color-themes after passing all 16 pytest suites."'
  },

  // The High-Impact Category (16 to 20)
  {
    id: 16,
    title: '16. PRDs and feature specs',
    category: 'High-Impact Strategy',
    icon: 'Layers',
    deliverableBadge: 'Product Architecture',
    problem: 'Vague user stories ("As a user I want magic") with zero technical boundary constraints, latency SLAs, or failure modes.',
    solution: 'Rigorous technical requirements: schema models, error states, offline fallback behavior, and database migration safety.',
    slopExample: '"The user should experience a delightful synchronization flow that feels deeply intuitive."',
    unslopExample: '"Sync Engine: Must handle 500 concurrent conflict items using Last-Write-Wins timestamps and write to local SQLite WAL in <15ms."'
  },
  {
    id: 17,
    title: '17. Technical documentation',
    category: 'High-Impact Strategy',
    icon: 'FileText',
    deliverableBadge: 'Developer Platform',
    problem: 'Auto-generated docstrings that repeat the function name (`get_user(): gets user`) without explaining parameters or failure states.',
    solution: 'Exact parameter types, return models, exception tables, and copy-pasteable working code samples.',
    slopExample: '"AuthManager: A class that manages authentication in an authentic manner."',
    unslopExample: '"AuthManager.verify_key(key: str) -> KeyValidationResult. Validates ADIOS-PERS, ADIOS-HOSP, ADIOS-HOTL checksums offline."'
  },
  {
    id: 18,
    title: '18. Executive memos',
    category: 'High-Impact Strategy',
    icon: 'Briefcase',
    deliverableBadge: 'Leadership & Board',
    problem: 'Dense corporate jargon hiding bad news under optimistic corporate cheerleading.',
    solution: 'Bottom Line Up Front (BLUF): What is happening, why it matters, financial exposure, and required capital decision.',
    slopExample: '"We are optimizing our trajectory toward synergistic excellence amidst dynamic market variables."',
    unslopExample: '"BLUF: Transitioning ADIOS to a monorepo structure saves ₹1.2L/month in deployment overhead and unlocks 4 enterprise app suites."'
  },
  {
    id: 19,
    title: '19. Client deliverables and reports',
    category: 'High-Impact Strategy',
    icon: 'CheckCircle2',
    deliverableBadge: 'Client Success',
    problem: 'Bloated 80-page slide decks designed to justify billing hours without actionable executive summaries.',
    solution: 'Audit findings ranked by business severity, cost of inaction, and validated implementation timeframes.',
    slopExample: '"Our strategic deep-dive holistically evaluated the overall health of your infrastructure."',
    unslopExample: '"Audit Result: Identified 3 critical N+1 queries causing 4.8s lag during month-end closing. Remediation patches provided."'
  },
  {
    id: 20,
    title: '20. Proposals and pitch decks',
    category: 'High-Impact Strategy',
    icon: 'Sparkles',
    deliverableBadge: 'Commercial Strategy',
    problem: 'Hyperbolic claims ("Total Addressable Market: $500 Billion!") without verifiable unit economics or defensible technology.',
    solution: 'Defensible unit economics, working software proof, customer unit margins, and clear product distribution architecture.',
    slopExample: '"We are the Uber of enterprise AI hospital software and will capture 80% of global hospitals by Q3."',
    unslopExample: '"ADIOS captures Tier 2/3 private clinics neglected by cloud SaaS. ₹4,999 perpetual license with 82% gross margins."'
  }
];

export default function HomePage() {
  // Authentication Modal State
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string; role?: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'tester'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Cart & Pricing State
  const [cart, setCart] = useState<string[]>(['personal']);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Profile Modal State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<{
    orders: any[];
    productKeys: Array<{ key: string; plan: string; orderId: string; issuedAt: string }>;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedLinux, setCopiedLinux] = useState(false);

  // Unslop Filter State
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'High-Volume Communication' | 'High-Impact Strategy'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUnslopId, setActiveUnslopId] = useState<number>(1);

  const toggleCartItem = (appId: string) => {
    setCart(prev =>
      prev.includes(appId) ? prev.filter(id => id !== appId) : [...prev, appId]
    );
  };

  const selectedApps = SUITE_APPS.filter(app => cart.includes(app.id));
  const subtotal = selectedApps.reduce((acc, app) => acc + app.price, 0);
  const discountRate = cart.length >= 4 ? 0.25 : cart.length >= 2 ? 0.15 : 0;
  const discountAmount = Math.round(subtotal * discountRate);
  const totalAmount = subtotal - discountAmount;

  const filteredUnslop = UNSLOP_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.solution.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeDeliverable = UNSLOP_ITEMS.find(i => i.id === activeUnslopId) || UNSLOP_ITEMS[0];

  const fetchUserProfile = async (email: string) => {
    setLoadingProfile(true);
    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (data.success) {
        setProfileData({
          orders: data.orders || [],
          productKeys: data.productKeys || []
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleOpenProfile = () => {
    if (user?.email) {
      fetchUserProfile(user.email);
      setShowProfileModal(true);
    }
  };

  const toggleRevealKey = (key: string) => {
    setRevealedKeys(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyLinux = () => {
    navigator.clipboard.writeText('pip install adios-manager');
    setCopiedLinux(true);
    setTimeout(() => setCopiedLinux(false), 2000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail) return;

    setAuthLoading(true);
    try {
      const actionPayload = authMode === 'tester' ? 'tester_signup' : authMode;
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: actionPayload,
          name: authName,
          email: authEmail,
          phone: authPhone,
          password: authPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        setShowAuthModal(false);
        setAuthPassword('');
      } else {
        setAuthError(data.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setAuthError('Network error connecting to auth service.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStartPurchase = (specificAppId?: string) => {
    if (specificAppId && !cart.includes(specificAppId)) {
      setCart(prev => [...prev, specificAppId]);
    }
    if (!user) {
      setShowAuthModal(true);
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber || !user) return;
    setSubmittingOrder(true);

    const planSummary = selectedApps.map(a => a.name).join(' + ') || 'Personal Lifetime Key';

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          utrNumber,
          amount: totalAmount,
          plan: planSummary
        })
      });
      const data = await res.json();
      if (data.success) {
        setOrderSubmitted(true);
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 1. MICROSOFT 365 / AZURE STYLE TOP HEADER */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background: 'var(--ms-surface)',
          borderBottom: '1px solid var(--ms-border)',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          boxShadow: 'var(--ms-shadow-2)'
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Microsoft Brand Grid + ADIOS Product Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              {/* Microsoft 4-color grid emblem */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 9px)', gap: '2px' }}>
                <div style={{ width: '9px', height: '9px', background: '#f25022' }}></div>
                <div style={{ width: '9px', height: '9px', background: '#7fba00' }}></div>
                <div style={{ width: '9px', height: '9px', background: '#00a4ef' }}></div>
                <div style={{ width: '9px', height: '9px', background: '#ffb900' }}></div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '17px', color: 'var(--ms-text)', letterSpacing: '-0.01em' }}>
                  ADIOS
                </span>
                <span style={{ color: 'var(--ms-border-strong)' }}>|</span>
                <span style={{ fontSize: '14px', color: 'var(--ms-text-secondary)', fontWeight: 500 }}>
                  Enterprise Suites &amp; AI Unslop
                </span>
              </div>
            </Link>

            {/* Top Navigation Links */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '22px', marginLeft: '24px' }} className="desktop-nav">
              <a href="#unslop" style={{ color: 'var(--ms-text)', fontSize: '13.5px', fontWeight: 500 }}>
                AI Unslop Hub
              </a>
              <a href="#suites" style={{ color: 'var(--ms-text)', fontSize: '13.5px', fontWeight: 500 }}>
                App Suites
              </a>
              <a href="#pricing" style={{ color: 'var(--ms-text)', fontSize: '13.5px', fontWeight: 500 }}>
                Pricing &amp; Cart
              </a>
              <a href="#downloads" style={{ color: 'var(--ms-text)', fontSize: '13.5px', fontWeight: 500 }}>
                Downloads
              </a>
              <Link href="/community" style={{ color: 'var(--ms-text)', fontSize: '13.5px', fontWeight: 500 }}>
                Community
              </Link>
            </nav>
          </div>

          {/* User Controls, Cart & CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a
              href="#pricing"
              className="ms-btn ms-btn-secondary ms-btn-sm"
              title="Cart items"
            >
              <ShoppingCart size={14} color="var(--ms-blue)" />
              <span>Cart ({cart.length})</span>
              <span style={{ color: 'var(--ms-text-tertiary)' }}>·</span>
              <span className="font-mono" style={{ fontWeight: 600 }}>₹{totalAmount.toLocaleString('en-IN')}</span>
            </a>

            {user ? (
              <button
                type="button"
                onClick={handleOpenProfile}
                className="ms-btn ms-btn-secondary ms-btn-sm"
              >
                <User size={13} color="var(--ms-blue)" />
                <span>{user.name}</span>
                <span className="ms-badge" style={{ background: 'var(--ms-blue-light)', color: 'var(--ms-blue)' }}>
                  Keys
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                className="ms-btn ms-btn-subtle ms-btn-sm"
              >
                Sign in
              </button>
            )}

            <a
              href="/api/download"
              download
              className="ms-btn ms-btn-primary ms-btn-sm"
            >
              <Download size={13} />
              <span>Download .exe</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: 'var(--container-max)', width: '100%', margin: '0 auto', padding: '36px 24px 80px', flex: 1 }}>
        {/* 2. HERO: MICROSOFT FLUENT COMMAND CENTER */}
        <section
          className="ms-card"
          style={{
            background: 'linear-gradient(135deg, var(--ms-surface) 0%, var(--ms-surface-alt) 100%)',
            border: '1px solid var(--ms-border)',
            padding: '48px 40px',
            marginBottom: '48px',
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--ms-blue-light)', border: '1px solid var(--ms-blue-tint)', padding: '4px 10px', borderRadius: 'var(--ms-radius-sm)', marginBottom: '16px' }}>
              <Sparkles size={14} color="var(--ms-blue)" />
              <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ms-blue)' }}>
                Microsoft-Grade Engineering · AI Unslop Standard
              </span>
            </div>

            <h1 style={{ marginBottom: '16px' }}>
              Zero AI Fluff.<br />
              Zero SaaS Subscriptions.
            </h1>

            <p style={{ fontSize: '16.5px', lineHeight: 1.6, marginBottom: '24px' }}>
              ADIOS replaces generic AI filler and bloated web applications with compiled, offline-first management suites
              and verifiable content generation across all 20 professional deliverables.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
              <a href="#unslop" className="ms-btn ms-btn-primary" style={{ height: '42px', padding: '0 20px' }}>
                <Sparkles size={16} />
                <span>Explore 20 AI Unslop Deliverables</span>
              </a>

              <a href="#suites" className="ms-btn ms-btn-secondary" style={{ height: '42px', padding: '0 18px' }}>
                <span>View Enterprise Suites</span>
                <ChevronRight size={15} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12.5px', color: 'var(--ms-text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={15} color="var(--ms-green)" />
                <span>100% Offline SQLite Core</span>
              </div>
              <div>•</div>
              <div>Native 64-bit Windows / Linux</div>
              <div>•</div>
              <div>Perpetual Lifetime Ownership</div>
            </div>
          </div>

          {/* Right Hero: UI Preview Box */}
          <div
            className="ms-card ms-card-elevated"
            style={{
              overflow: 'hidden',
              background: 'var(--ms-surface)',
              border: '1px solid var(--ms-border-strong)'
            }}
          >
            <div style={{ background: 'var(--ms-surface-subtle)', borderBottom: '1px solid var(--ms-border)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0078d4' }}></div>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>ADIOS AI Unslop Engine · Active Benchmark</span>
              </div>
              <span className="ms-badge" style={{ background: 'var(--ms-green-light)', color: 'var(--ms-green)' }}>
                Signal: 98.4%
              </span>
            </div>
            <div style={{ position: 'relative', width: '100%', background: 'var(--ms-surface-alt)' }}>
              <Image
                src="/app-screenshot.png"
                alt="ADIOS Manager desktop application interface"
                width={1280}
                height={720}
                priority
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </section>

        {/* 3. AI UNSLOP SHOWCASE & THE 20 PROFESSIONAL DELIVERABLES */}
        <section id="unslop" style={{ marginBottom: '64px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: 'var(--ms-blue)', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Content Quality Revolution
            </div>
            <h2>The 20 AI Unslop Deliverables</h2>
            <p style={{ marginTop: '6px', maxWidth: '780px' }}>
              Standard LLMs default to generic, sycophantic word salad (&quot;in today&apos;s fast-paced digital world...&quot;).
              ADIOS enforces crisp, signal-first communication across both daily high-volume tasks and expensive high-impact strategic documentation.
            </p>
          </div>

          {/* Filters & Search Control Bar */}
          <div
            className="ms-card"
            style={{
              padding: '12px 18px',
              marginBottom: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              background: 'var(--ms-surface-alt)'
            }}
          >
            {/* Category tabs */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`ms-btn ms-btn-sm ${selectedCategory === 'all' ? 'ms-btn-primary' : 'ms-btn-secondary'}`}
              >
                All 20 Deliverables
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('High-Volume Communication')}
                className={`ms-btn ms-btn-sm ${selectedCategory === 'High-Volume Communication' ? 'ms-btn-primary' : 'ms-btn-secondary'}`}
              >
                High-Volume (1-15)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory('High-Impact Strategy')}
                className={`ms-btn ms-btn-sm ${selectedCategory === 'High-Impact Strategy' ? 'ms-btn-primary' : 'ms-btn-secondary'}`}
              >
                High-Impact Strategy (16-20)
              </button>
            </div>

            {/* Search Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
              <Search size={15} color="var(--ms-text-secondary)" />
              <input
                type="text"
                placeholder="Search deliverable or use case..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ height: '32px', width: '100%', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Master-Detail Interactive Deliverables Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 1fr) minmax(360px, 1.4fr)',
              gap: '24px',
              alignItems: 'start'
            }}
          >
            {/* Left: Scrollable List of Deliverables */}
            <div
              className="ms-card"
              style={{
                maxHeight: '620px',
                overflowY: 'auto',
                padding: '8px'
              }}
            >
              {filteredUnslop.map(item => {
                const isSelected = item.id === activeUnslopId;
                const isHighImpact = item.category === 'High-Impact Strategy';

                return (
                  <div
                    key={item.id}
                    onClick={() => setActiveUnslopId(item.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--ms-radius-sm)',
                      background: isSelected ? 'var(--ms-blue-light)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--ms-blue)' : '3px solid transparent',
                      cursor: 'pointer',
                      marginBottom: '4px',
                      transition: 'all 120ms ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isHighImpact ? 'var(--ms-orange)' : 'var(--ms-blue)' }}>
                        {isHighImpact ? 'High Impact' : 'High Volume'} · #{item.id}
                      </span>
                      <span className="ms-badge" style={{ background: 'var(--ms-surface-subtle)', color: 'var(--ms-text-secondary)', fontSize: '10.5px' }}>
                        {item.deliverableBadge}
                      </span>
                    </div>

                    <div style={{ fontWeight: isSelected ? 700 : 600, fontSize: '14px', color: isSelected ? 'var(--ms-blue)' : 'var(--ms-text)' }}>
                      {item.title}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--ms-text-secondary)', marginTop: '4px', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.solution}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Active Deliverable Side-by-Side Comparison */}
            <div
              className="ms-card"
              style={{
                padding: '28px',
                border: '1px solid var(--ms-border-strong)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ms-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Deliverable #{activeDeliverable.id} · {activeDeliverable.category}
                  </div>
                  <h3 style={{ fontSize: '22px' }}>{activeDeliverable.title}</h3>
                </div>

                <span className="ms-badge" style={{ background: 'var(--ms-blue-light)', color: 'var(--ms-blue)', padding: '5px 10px', fontSize: '12px' }}>
                  {activeDeliverable.deliverableBadge}
                </span>
              </div>

              {/* The Core Problem vs Solution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '22px' }}>
                <div style={{ background: 'var(--ms-surface-subtle)', padding: '14px', borderRadius: 'var(--ms-radius-sm)', border: '1px solid var(--ms-border)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ms-orange)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <AlertCircle size={14} />
                    <span>The Generic AI Slop Failure:</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ms-text-secondary)', lineHeight: 1.5 }}>
                    {activeDeliverable.problem}
                  </div>
                </div>

                <div style={{ background: 'var(--ms-blue-light)', padding: '14px', borderRadius: 'var(--ms-radius-sm)', border: '1px solid var(--ms-blue-tint)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ms-blue)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <CheckCircle2 size={14} />
                    <span>The ADIOS Unslop Standard:</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--ms-text)', lineHeight: 1.5 }}>
                    {activeDeliverable.solution}
                  </div>
                </div>
              </div>

              {/* Direct Text Teardown Example */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ms-text-secondary)', marginBottom: '8px' }}>
                  Direct Output Comparison:
                </div>

                {/* AI Slop Quote */}
                <div style={{ background: 'rgba(216, 59, 1, 0.05)', borderLeft: '3px solid var(--ms-orange)', padding: '12px 14px', borderRadius: '0 var(--ms-radius-sm) var(--ms-radius-sm) 0', marginBottom: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ms-orange)', marginBottom: '3px', textTransform: 'uppercase' }}>
                    Typical LLM Draft (Fluff &amp; Filler):
                  </div>
                  <div style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--ms-text)' }}>
                    {activeDeliverable.slopExample}
                  </div>
                </div>

                {/* Unslop Quote */}
                <div style={{ background: 'rgba(16, 124, 16, 0.06)', borderLeft: '3px solid var(--ms-green)', padding: '12px 14px', borderRadius: '0 var(--ms-radius-sm) var(--ms-radius-sm) 0' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ms-green)', marginBottom: '3px', textTransform: 'uppercase' }}>
                    ADIOS Verified Delivery:
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--ms-text)' }}>
                    {activeDeliverable.unslopExample}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--ms-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--ms-text-tertiary)' }}>
                  Integrated across all 5 ADIOS Application Suites
                </span>

                <a href="#suites" className="ms-btn ms-btn-primary ms-btn-sm">
                  <span>Activate with Desktop Suite</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. THE 5 ADIOS APPLICATION SUITES (MICROSOFT 365 APP MATRIX) */}
        <section id="suites" style={{ marginBottom: '64px', borderTop: '1px solid var(--ms-border)', paddingTop: '48px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px', gap: '16px' }}>
            <div>
              <div style={{ color: 'var(--ms-blue)', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Enterprise Product Catalog
              </div>
              <h2>Application Suites Matrix</h2>
              <p style={{ marginTop: '6px', maxWidth: '680px' }}>
                Independent compiled desktop systems sharing the common offline SQLite runtime. Configure your custom suite package below.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '13px', color: 'var(--ms-text-secondary)' }}>Multi-app bundle saves up to 25%</span>
              <a href="#pricing" className="ms-btn ms-btn-secondary ms-btn-sm">
                <span>View Cart ({cart.length})</span>
                <ChevronRight size={14} />
              </a>
            </div>
          </div>

          {/* Suites Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '20px'
            }}
          >
            {SUITE_APPS.map(app => {
              const inCart = cart.includes(app.id);
              const isLive = app.status === 'available';

              return (
                <div
                  key={app.id}
                  className="ms-card"
                  style={{
                    padding: '24px',
                    borderColor: inCart ? 'var(--ms-blue)' : 'var(--ms-border)',
                    boxShadow: inCart ? 'var(--ms-shadow-16)' : 'var(--ms-shadow-2)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background: inCart ? 'var(--ms-blue-light)' : 'var(--ms-surface)'
                  }}
                >
                  <div>
                    {/* Badge row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span className="ms-badge" style={{ background: 'var(--ms-surface-subtle)', color: 'var(--ms-text)' }}>
                        {app.badge}
                      </span>
                      <span
                        className="ms-badge"
                        style={{
                          background: isLive ? 'var(--ms-green-light)' : 'var(--ms-orange-light)',
                          color: isLive ? 'var(--ms-green)' : 'var(--ms-orange)'
                        }}
                      >
                        {app.statusLabel}
                      </span>
                    </div>

                    {/* Suite Name & Icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: 'var(--ms-radius-sm)',
                          background: `${app.accentColor}15`,
                          border: `1px solid ${app.accentColor}30`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {app.id === 'personal' && <Users size={20} color={app.accentColor} />}
                        {app.id === 'hospital' && <Building2 size={20} color={app.accentColor} />}
                        {app.id === 'hotel' && <Hotel size={20} color={app.accentColor} />}
                        {app.id === 'billing' && <Receipt size={20} color={app.accentColor} />}
                        {app.id === 'academics' && <GraduationCap size={20} color={app.accentColor} />}
                      </div>

                      <div>
                        <h3 style={{ fontSize: '18px' }}>{app.name}</h3>
                        <div style={{ fontSize: '12.5px', color: 'var(--ms-text-tertiary)' }}>
                          {app.category}
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '14px', lineHeight: 1.5, marginBottom: '16px' }}>
                      {app.description}
                    </p>

                    {/* Feature bullets */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                      {app.features.map((feat, fIdx) => (
                        <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--ms-text)' }}>
                          <Check size={14} color="var(--ms-blue)" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div
                    style={{
                      borderTop: '1px solid var(--ms-border)',
                      paddingTop: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--ms-text-secondary)', textTransform: 'uppercase' }}>
                        Perpetual License
                      </div>
                      <div className="font-mono" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--ms-text)' }}>
                        ₹{app.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleCartItem(app.id)}
                      className={inCart ? 'ms-btn ms-btn-secondary' : 'ms-btn ms-btn-primary'}
                      style={{ height: '36px', fontSize: '13px' }}
                    >
                      {inCart ? (
                        <>
                          <Check size={14} color="var(--ms-green)" />
                          <span>Added in Cart</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. PRICING & UPI CART CHECKOUT (MICROSOFT STORE STYLE) */}
        <section id="pricing" style={{ marginBottom: '64px', borderTop: '1px solid var(--ms-border)', paddingTop: '48px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(320px, 1fr)',
              gap: '36px',
              alignItems: 'start'
            }}
          >
            {/* Left: Licensing Guarantee Matrix */}
            <div>
              <div style={{ color: 'var(--ms-blue)', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Transparent Commercial Terms
              </div>
              <h2>Perpetual Licensing Philosophy</h2>
              <p style={{ marginTop: '8px', marginBottom: '20px' }}>
                We believe in genuine software ownership. You pay once for your digital license key, operate your business offline with full control, and never worry about arbitrary price increases.
              </p>

              <table>
                <thead>
                  <tr>
                    <th>Capability &amp; Support Guarantee</th>
                    <th style={{ textAlign: 'center', width: '130px' }}>Offline Free</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Lifetime License</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>All core suite modules &amp; features</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                  </tr>
                  <tr>
                    <td>Local SQLite database engine</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                  </tr>
                  <tr>
                    <td>Custom directory automated backups</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                  </tr>
                  <tr>
                    <td>Multi-device encrypted cloud sync</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-text-disabled)' }}>—</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                  </tr>
                  <tr>
                    <td>Priority key re-issue &amp; emergency recovery</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-text-disabled)' }}>—</td>
                    <td style={{ textAlign: 'center', color: 'var(--ms-green)', fontWeight: 600 }}>✓</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right: Interactive Suite Cart Checkout */}
            <div
              className="ms-card ms-card-elevated"
              style={{
                padding: '28px',
                background: 'var(--ms-surface)',
                border: '1px solid var(--ms-border-strong)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={18} color="var(--ms-blue)" />
                  <h3 style={{ fontSize: '18px' }}>Suite Order Summary</h3>
                </div>
                <span className="ms-badge" style={{ background: 'var(--ms-blue-light)', color: 'var(--ms-blue)' }}>
                  {cart.length} {cart.length === 1 ? 'Suite' : 'Suites'}
                </span>
              </div>

              {selectedApps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ms-text-secondary)', fontSize: '14px' }}>
                  Your cart is empty. Choose suites above to bundle your software.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {selectedApps.map(item => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'var(--ms-surface-subtle)',
                        border: '1px solid var(--ms-border)',
                        borderRadius: 'var(--ms-radius-sm)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
                        <div className="font-mono" style={{ fontSize: '11px', color: 'var(--ms-text-secondary)' }}>
                          Prefix: {item.keyPrefix}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="font-mono" style={{ fontWeight: 700 }}>
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCartItem(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ms-text-secondary)' }}
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Calculation Box */}
              {selectedApps.length > 0 && (
                <div style={{ background: 'var(--ms-surface-subtle)', border: '1px solid var(--ms-border)', borderRadius: 'var(--ms-radius-sm)', padding: '14px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--ms-text-secondary)' }}>Subtotal:</span>
                    <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountRate > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: 'var(--ms-green)', marginBottom: '6px' }}>
                      <span>Bundle Savings ({Math.round(discountRate * 100)}% off):</span>
                      <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 700, borderTop: '1px dashed var(--ms-border-strong)', paddingTop: '8px', marginTop: '4px' }}>
                    <span>Total Amount:</span>
                    <span className="font-mono" style={{ color: 'var(--ms-blue)' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => handleStartPurchase()}
                disabled={selectedApps.length === 0}
                className="ms-btn ms-btn-primary"
                style={{ width: '100%', height: '42px', fontSize: '14px' }}
              >
                Pay ₹{totalAmount.toLocaleString('en-IN')} via UPI / QR
              </button>

              <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: 'var(--ms-text-tertiary)' }}>
                Official UPI QR delivery · Manual verification within 1 hour
              </div>
            </div>
          </div>
        </section>

        {/* 6. DOWNLOADS TABLE */}
        <section id="downloads" style={{ marginBottom: '64px', borderTop: '1px solid var(--ms-border)', paddingTop: '48px' }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ color: 'var(--ms-blue)', fontSize: '12.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
              Installation Packages
            </div>
            <h2>Download Desktop Binaries</h2>
            <p style={{ marginTop: '6px' }}>
              Standard Windows and Linux executables. Standalone offline operation with no external runtime dependencies.
            </p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Platform</th>
                <th>Operating System</th>
                <th>Format</th>
                <th>Release Lifecycle</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><b>Windows</b></td>
                <td>Windows 10 / 11 (64-bit)</td>
                <td><code className="font-mono">.exe (Inno Setup)</code></td>
                <td>
                  <span className="ms-badge" style={{ background: 'var(--ms-green-light)', color: 'var(--ms-green)' }}>
                    Available (v2.0.0-alpha.1)
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <a href="/api/download" download className="ms-btn ms-btn-primary ms-btn-sm">
                    <Download size={13} />
                    <span>Download .exe</span>
                  </a>
                </td>
              </tr>
              <tr>
                <td><b>Linux</b></td>
                <td>Ubuntu, Debian, Fedora, Arch</td>
                <td><code className="font-mono">PyPI Package</code></td>
                <td>
                  <span className="ms-badge" style={{ background: 'var(--ms-green-light)', color: 'var(--ms-green)' }}>
                    Available (PyPI)
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button type="button" onClick={handleCopyLinux} className="ms-btn ms-btn-secondary ms-btn-sm font-mono">
                    {copiedLinux ? 'Copied pip command' : 'pip install adios-manager'}
                  </button>
                </td>
              </tr>
              <tr>
                <td><b>macOS</b></td>
                <td>Apple Silicon &amp; Intel</td>
                <td><code className="font-mono">.dmg universal</code></td>
                <td>
                  <span className="ms-badge" style={{ background: 'var(--ms-orange-light)', color: 'var(--ms-orange)' }}>
                    Early Preview (Q1 2027)
                  </span>
                </td>
                <td style={{ textAlign: 'right', color: 'var(--ms-text-disabled)', fontSize: '13px' }}>
                  Coming soon
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>

      {/* 7. MICROSOFT FOOTER */}
      <footer
        style={{
          background: 'var(--ms-surface)',
          borderTop: '1px solid var(--ms-border)',
          padding: '36px 24px',
          fontSize: '13px',
          color: 'var(--ms-text-secondary)'
        }}
      >
        <div
          style={{
            maxWidth: 'var(--container-max)',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ fontWeight: 600, color: 'var(--ms-text)', marginBottom: '3px' }}>
              ADIOS Management Suites &amp; AI Unslop Platform
            </div>
            <div>Built with Microsoft Fluent principles by Sayan Maity. 100% Offline-first guarantee.</div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ms-text-secondary)' }}>
              GitHub Repo
            </a>
            <Link href="/community" style={{ color: 'var(--ms-text-secondary)' }}>Community</Link>
            <Link href="/privacy" style={{ color: 'var(--ms-text-secondary)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--ms-text-secondary)' }}>Terms of Service</Link>
          </div>
        </div>
      </footer>

      {/* 8. AUTHENTICATION & TESTER MODAL */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="ms-card" style={{ maxWidth: '420px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '18px' }}>
                {authMode === 'signin' ? 'Sign in to ADIOS' : authMode === 'tester' ? 'Register as Alpha Tester' : 'Create an Account'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAuthModal(false); setAuthError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ms-text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {/* Mode selection buttons */}
            <div style={{ display: 'flex', background: 'var(--ms-surface-subtle)', borderRadius: 'var(--ms-radius-sm)', padding: '3px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  border: 'none',
                  borderRadius: 'var(--ms-radius-sm)',
                  background: authMode === 'signin' ? 'var(--ms-surface)' : 'transparent',
                  color: authMode === 'signin' ? 'var(--ms-text)' : 'var(--ms-text-secondary)',
                  fontWeight: authMode === 'signin' ? 600 : 400,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: authMode === 'signin' ? 'var(--ms-shadow-2)' : 'none'
                }}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  border: 'none',
                  borderRadius: 'var(--ms-radius-sm)',
                  background: authMode === 'signup' ? 'var(--ms-surface)' : 'transparent',
                  color: authMode === 'signup' ? 'var(--ms-text)' : 'var(--ms-text-secondary)',
                  fontWeight: authMode === 'signup' ? 600 : 400,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: authMode === 'signup' ? 'var(--ms-shadow-2)' : 'none'
                }}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('tester'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  border: 'none',
                  borderRadius: 'var(--ms-radius-sm)',
                  background: authMode === 'tester' ? 'var(--ms-surface)' : 'transparent',
                  color: authMode === 'tester' ? 'var(--ms-blue)' : 'var(--ms-text-secondary)',
                  fontWeight: authMode === 'tester' ? 600 : 400,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  boxShadow: authMode === 'tester' ? 'var(--ms-shadow-2)' : 'none'
                }}
              >
                Alpha Tester
              </button>
            </div>

            {authMode === 'tester' && (
              <div style={{ background: 'var(--ms-blue-light)', border: '1px solid var(--ms-blue-tint)', padding: '10px 12px', borderRadius: 'var(--ms-radius-sm)', fontSize: '12.5px', color: 'var(--ms-text)', marginBottom: '16px', lineHeight: 1.5 }}>
                ✨ <b>Alpha Tester Program</b>: Instant complimentary testing license key provisioned to your account upon signup.
              </div>
            )}

            {authError && (
              <div style={{ background: 'var(--ms-orange-light)', border: '1px solid var(--ms-orange)', color: 'var(--ms-orange)', padding: '10px 12px', fontSize: '12.5px', borderRadius: 'var(--ms-radius-sm)', marginBottom: '14px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    required
                    placeholder="Sayan Maity"
                    style={{ width: '100%', height: '36px' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                  placeholder="your.email@example.com"
                  style={{ width: '100%', height: '36px' }}
                />
              </div>

              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                    Phone number (optional)
                  </label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={e => setAuthPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    style={{ width: '100%', height: '36px' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                  style={{ width: '100%', height: '36px' }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="ms-btn ms-btn-primary"
                style={{ width: '100%', height: '38px' }}
              >
                {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign in' : authMode === 'tester' ? 'Register as Alpha Tester' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 9. UPI CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="ms-card" style={{ maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px' }}>UPI Payment Reference</h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ms-text-secondary)' }}
              >
                ✕
              </button>
            </div>

            {orderSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'var(--ms-green-light)', color: 'var(--ms-green)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Check size={22} />
                </div>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Payment Reference Submitted</h4>
                <p style={{ fontSize: '13.5px', color: 'var(--ms-text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
                  Thank you, <b>{user?.name}</b>. Your UPI reference (<b>{utrNumber}</b>) has been recorded.
                  Your key will be issued directly to your profile and email once verified.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowCheckoutModal(false); setOrderSubmitted(false); }}
                  className="ms-btn ms-btn-primary"
                  style={{ width: '100%' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: 'var(--ms-surface-subtle)',
                    border: '1px solid var(--ms-border)',
                    padding: '16px',
                    borderRadius: 'var(--ms-radius-sm)',
                    textAlign: 'center',
                    marginBottom: '18px'
                  }}
                >
                  <div style={{ display: 'inline-block', background: '#ffffff', padding: '10px', borderRadius: 'var(--ms-radius-sm)', marginBottom: '10px' }}>
                    <svg width="140" height="140" viewBox="0 0 100 100" fill="#1b1b1b">
                      <rect x="0" y="0" width="30" height="30" fill="#1b1b1b" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" fill="#0078d4" />
                      <rect x="70" y="0" width="30" height="30" fill="#1b1b1b" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" fill="#0078d4" />
                      <rect x="0" y="70" width="30" height="30" fill="#1b1b1b" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" fill="#0078d4" />
                      <rect x="40" y="10" width="10" height="20" />
                      <rect x="55" y="15" width="8" height="8" />
                      <rect x="40" y="40" width="20" height="20" fill="#0078d4" />
                      <rect x="70" y="40" width="10" height="10" />
                      <rect x="85" y="55" width="12" height="12" />
                      <rect x="40" y="70" width="15" height="15" />
                      <rect x="65" y="75" width="10" height="20" />
                      <rect x="85" y="80" width="10" height="10" />
                    </svg>
                  </div>

                  <div className="font-mono" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                    sayanjc3639q@oksbi
                  </div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--ms-blue)', marginTop: '4px' }}>
                    Total: ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--ms-text-secondary)', marginTop: '2px' }}>
                    Includes {cart.length} suite{cart.length > 1 ? 's' : ''} ({Math.round(discountRate * 100)}% bundle discount applied)
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, marginBottom: '4px' }}>
                      UPI Reference / UTR Number (12 Digits)*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 432190821941"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      required
                      className="font-mono"
                      style={{ width: '100%', height: '38px' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="ms-btn ms-btn-primary"
                    style={{ width: '100%', height: '40px' }}
                  >
                    {submittingOrder ? 'Submitting...' : 'Submit Payment Reference'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 10. USER PROFILE & KEYS MODAL */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="ms-card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '17px' }}>Account &amp; License Keys</h3>
                <div style={{ fontSize: '12.5px', color: 'var(--ms-text-secondary)' }}>
                  Manage your verified profile and genuine ADIOS perpetual keys.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--ms-text-secondary)' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: 'var(--ms-surface-subtle)', border: '1px solid var(--ms-border)', padding: '14px', borderRadius: 'var(--ms-radius-sm)', marginBottom: '20px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ms-text-secondary)' }}>Name:</span>
                <b>{user?.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--ms-text-secondary)' }}>Email:</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              {user?.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--ms-text-secondary)' }}>Phone:</span>
                  <span className="font-mono">{user?.phone}</span>
                </div>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14.5px' }}>Genuine Product Keys</h4>
                <button
                  type="button"
                  onClick={() => user?.email && fetchUserProfile(user.email)}
                  style={{ background: 'none', border: 'none', color: 'var(--ms-blue)', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Refresh
                </button>
              </div>

              {loadingProfile ? (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ms-text-secondary)' }}>
                  Loading license keys...
                </div>
              ) : profileData?.productKeys && profileData.productKeys.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {profileData.productKeys.map((pk, idx) => {
                    const isRevealed = revealedKeys[pk.key] || false;
                    const maskedKey = pk.key.slice(0, 10) + '••••-••••';
                    const isCopied = copiedKey === pk.key;

                    return (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--ms-surface)',
                          border: '1px solid var(--ms-border)',
                          borderRadius: 'var(--ms-radius-sm)',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, fontSize: '12.5px', color: 'var(--ms-blue)' }}>
                            {pk.plan}
                          </span>
                          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--ms-text-tertiary)' }}>
                            Order: {pk.orderId}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--ms-surface-subtle)', border: '1px solid var(--ms-border)', borderRadius: 'var(--ms-radius-sm)', padding: '6px 10px' }}>
                          <span className="font-mono" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                            {isRevealed ? pk.key : maskedKey}
                          </span>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => toggleRevealKey(pk.key)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ms-text-secondary)' }}
                              title={isRevealed ? 'Hide' : 'Reveal'}
                            >
                              {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(pk.key)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCopied ? 'var(--ms-green)' : 'var(--ms-text-secondary)' }}
                              title="Copy"
                            >
                              {isCopied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--ms-text-tertiary)', fontSize: '13px' }}>
                  No active keys found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
