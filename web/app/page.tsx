'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  ShoppingCart,
  ChevronDown,
  User,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Building2,
  Hotel,
  Receipt,
  GraduationCap,
  Users,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  HardDrive,
  Download,
  Cpu,
  Lock,
  ArrowRight
} from 'lucide-react';

interface SuiteApp {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_development' | 'planned';
  statusLabel: string;
  price: number;
  description: string;
  keyPrefix: string;
  features: string[];
  ctaLabel: string;
}

const SUITE_APPS: SuiteApp[] = [
  {
    id: 'personal',
    name: 'ADIOS Personal Manager',
    category: 'Productivity & Private Finances',
    status: 'available',
    statusLabel: 'Available now',
    price: 999,
    description: 'High-speed offline desktop manager for Indian Rupee cashflow, exam dates, study pomodoro, and local SQLite data.',
    keyPrefix: 'ADIOS-PERS',
    ctaLabel: 'Download for Windows',
    features: [
      '10 Core Modules built-in',
      '₹ Indian Rupee financial cash flow',
      'Integrated Study Pomodoro & Exam syllabus',
      '100% Offline SQLite local persistence'
    ]
  },
  {
    id: 'hospital',
    name: 'ADIOS Hospital Management (HMS)',
    category: 'Healthcare & Clinical',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 4999,
    description: 'Zero-latency hospital administration: OPD queue admissions, IPD bed matrix, doctor rosters, and pharmacy dispensing.',
    keyPrefix: 'ADIOS-HOSP',
    ctaLabel: 'Join Early Access',
    features: [
      'Patient OPD & IPD admissions',
      'Interactive bed & ward occupancy matrix',
      'Doctor appointment queues & clinical notes',
      'Pharmacy dispensing with batch management'
    ]
  },
  {
    id: 'hotel',
    name: 'ADIOS Hotel Management System',
    category: 'Hospitality & Front Desk',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 3999,
    description: 'Front-desk PMS engineered for speed: room booking matrix, guest photo ID verification, and restaurant dining POS.',
    keyPrefix: 'ADIOS-HOTL',
    ctaLabel: 'Join Early Access',
    features: [
      'Interactive room booking grid',
      'Guest ID proof capture at check-in',
      'Room service & restaurant dining POS',
      'Housekeeping & laundry schedules'
    ]
  },
  {
    id: 'billing',
    name: 'ADIOS Point of Sale & GST Billing',
    category: 'Commercial Retail & Wholesale',
    status: 'in_development',
    statusLabel: 'Coming soon',
    price: 2499,
    description: 'Fast barcode checkout and compliant GST tax invoices (B2B/B2C), inventory alerts, and 80mm thermal receipts.',
    keyPrefix: 'ADIOS-BILL',
    ctaLabel: 'Join Early Access',
    features: [
      'Instant barcode scanning checkout',
      'GST tax invoices (CGST/SGST/IGST + HSN)',
      'Real-time low-stock alerts & purchase ledger',
      '80mm & 58mm thermal receipt printing'
    ]
  },
  {
    id: 'academics',
    name: 'ADIOS Academics & School Management',
    category: 'Schools, Colleges & Coaching',
    status: 'planned',
    statusLabel: 'Planned',
    price: 3499,
    description: 'Educational institution suite: student admissions, fee collections with alerts, exam marksheet generator, and attendance.',
    keyPrefix: 'ADIOS-ACAD',
    ctaLabel: 'Join Waitlist',
    features: [
      'Student admissions & digital records archive',
      'Term fee receipts & balance reminders',
      'Daily student & faculty attendance tracking',
      'Exam marksheet & report card builder'
    ]
  }
];

export default function HomePage() {
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'tester'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Cart & Pricing
  const [cart, setCart] = useState<string[]>(['personal']);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileData, setProfileData] = useState<{
    orders: any[];
    productKeys: Array<{ key: string; plan: string; orderId: string; issuedAt: string }>;
  } | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

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
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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

  // User initials for circle badge like "SM" in screenshot
  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'SM';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* 1. ADIOS MANAGEMENT SUITES HEADER (Surface-style layout) */}
      <header
        style={{
          height: '54px',
          background: '#ffffff',
          borderBottom: '1px solid #e6e6e6',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5% 0 5%',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: ADIOS Logo Mark & Brand + Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '28px', height: '28px' }}>
                <Image
                  src="/logo.png"
                  alt="ADIOS Logo"
                  width={28}
                  height={28}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#1a1429', letterSpacing: '-0.02em' }}>
                ADIOS
              </span>
            </Link>

            {/* Version & Testing Status Badge in Nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  background: '#0067b8',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em'
                }}
              >
                v2.0.0-alpha.1
              </span>
              <span
                style={{
                  border: '1px solid rgba(16, 124, 16, 0.4)',
                  background: '#dff6dd',
                  color: '#107c10',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#107c10' }}></span>
                Open for Testing
              </span>
            </div>

            {/* Top Nav Menu matching Surface showcase styling */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }} className="desktop-nav">
              <a href="#personal" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Personal
              </a>
              <a href="#suites" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Hospital HMS
              </a>
              <a href="#suites" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Hotel PMS
              </a>
              <a href="#suites" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                GST POS Billing
              </a>
              <a href="#suites" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Academics
              </a>
              <a href="#pricing" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Pricing &amp; Cart
              </a>
              <a href="#downloads" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Downloads
              </a>
              <Link href="/community" style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>
                Community
              </Link>
            </nav>
          </div>

          {/* Right: All Suites dropdown, Search, Cart & User Circle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#262626', fontWeight: 500 }}>
              <span>All Suites</span>
              <ChevronDown size={14} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#262626' }}>
              <span>Search</span>
              <Search size={15} />
            </div>

            <a
              href="#pricing"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#262626',
                textDecoration: 'none'
              }}
            >
              <span>Cart</span>
              <ShoppingCart size={15} />
              {cart.length > 0 && (
                <span style={{ fontSize: '11px', background: '#0067b8', color: '#ffffff', padding: '1px 5px', borderRadius: '50%' }}>
                  {cart.length}
                </span>
              )}
            </a>

            {/* Circular Profile Avatar (exact match: SM icon circle) */}
            <div
              onClick={() => {
                if (user) handleOpenProfile();
                else { setAuthMode('signin'); setShowAuthModal(true); }
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '1px solid #737373',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 600,
                color: '#262626',
                cursor: 'pointer',
                background: '#ffffff'
              }}
              title={user ? `Signed in as ${user.name}` : 'Sign in to ADIOS'}
            >
              {userInitials}
            </div>
          </div>
        </div>
      </header>

      {/* 2. FULL-BLEED HERO: EXACT REPLICA OF MICROSOFT SURFACE SHOWCASE */}
      <section
        style={{
          width: '100%',
          minHeight: '540px',
          background: 'linear-gradient(135deg, #d3c7e8 0%, #b8a8dc 50%, #a291cf 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '48px 6% 64px 6%',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.25fr)',
            gap: '40px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Product Statement */}
          <div style={{ maxWidth: '540px', zIndex: 2 }}>
            {/* "Open for Testing" pill in purple styling */}
            <div style={{ marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="ms-pill">
                Open Alpha Testing
              </span>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.75)',
                  backdropFilter: 'blur(8px)',
                  color: '#2c2242',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.9)'
                }}
              >
                v2.0.0-alpha.1
              </span>
            </div>

            {/* Product Headline */}
            <h1
              style={{
                color: '#1a1429',
                fontSize: 'clamp(36px, 4.4vw, 54px)',
                fontWeight: 600,
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                marginBottom: '16px'
              }}
            >
              Our most optimised management lineup
            </h1>

            {/* Subtext description */}
            <p
              style={{
                color: '#2c2242',
                fontSize: '17px',
                lineHeight: 1.5,
                marginBottom: '28px',
                fontWeight: 400
              }}
            >
              Big ideas, busy operations, zero latency. ADIOS Personal, Hospital, Hotel, POS and Academics
              are engineered offline-first with compiled C++/Qt performance and SQLite persistence.
            </p>

            {/* "Learn more" Primary Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="#suites" className="ms-hero-btn">
                Explore Suites
              </a>

              <a
                href="/api/download"
                download
                className="ms-secondary-btn"
                style={{ color: '#1a1429', textDecoration: 'underline' }}
              >
                Download Desktop .exe
              </a>
            </div>
          </div>

          {/* Right Column: High-Resolution Product Showcase matching Laptop & Tablet visual */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                filter: 'drop-shadow(0 24px 40px rgba(24, 14, 46, 0.35))'
              }}
            >
              <Image
                src="/app-screenshot.png"
                alt="ADIOS Surface Management Lineup"
                width={1280}
                height={720}
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.3)'
                }}
              />

              {/* Snapdragon badge style floating badge (matching bottom-right badge in screenshot) */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '-16px',
                  right: '10px',
                  background: '#0f0c18',
                  color: '#ffffff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 18px rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ width: '18px', height: '18px', borderRadius: '3px', background: '#0067b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                  A
                </div>
                <div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9d91b8' }}>ENGINE ARCHITECTURE</div>
                  <div style={{ fontSize: '11px', fontWeight: 700 }}>Qt 6 · Offline SQLite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT SHOWCASE TILES: 5 SPECIALIZED MANAGEMENT SUITES */}
      <section id="suites" style={{ padding: '60px 6% 40px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', color: '#262626', marginBottom: '8px' }}>
            Engineered for High-Stakes Operations
          </h2>
          <p style={{ fontSize: '15px', color: '#505050' }}>
            Choose the dedicated management application for your business. Every edition includes local SQLite isolation and perpetual lifetime licenses.
          </p>
        </div>

        {/* 5-Suite Product Cards Grid (Microsoft Store format) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '24px'
          }}
        >
          {SUITE_APPS.map(app => {
            const inCart = cart.includes(app.id);

            return (
              <div
                key={app.id}
                className="ms-product-card"
                style={{
                  padding: '24px',
                  borderTop: inCart ? '4px solid #0067b8' : '1px solid #e6e6e6'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11.5px', color: '#737373', textTransform: 'uppercase', fontWeight: 600 }}>
                      {app.category}
                    </span>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 600,
                        color: app.status === 'available' ? '#107c10' : '#78248c',
                        background: app.status === 'available' ? '#dff6dd' : '#f2eafd',
                        padding: '2px 8px',
                        borderRadius: '2px'
                      }}
                    >
                      {app.statusLabel}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', color: '#262626', marginBottom: '8px' }}>
                    {app.name}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: '#505050', lineHeight: 1.5, marginBottom: '16px' }}>
                    {app.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                    {app.features.map((f, i) => (
                      <div key={i} style={{ fontSize: '12.5px', color: '#262626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#0067b8', fontWeight: 'bold' }}>✓</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f2f2f2', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#737373' }}>Perpetual license</div>
                    <div className="font-mono" style={{ fontSize: '18px', fontWeight: 700, color: '#262626' }}>
                      ₹{app.price.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCartItem(app.id)}
                    className={inCart ? 'ms-secondary-btn' : 'ms-hero-btn'}
                    style={{
                      height: '34px',
                      padding: '0 12px',
                      fontSize: '13px'
                    }}
                  >
                    {inCart ? (
                      <span style={{ color: '#107c10', fontWeight: 600 }}>✓ In Cart</span>
                    ) : (
                      <span>Add to Cart</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SURFACE PRICING & UPI CART CHECKOUT (MICROSOFT STORE STYLE) */}
      <section id="pricing" style={{ padding: '40px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: '#f7f7f7',
            border: '1px solid #e6e6e6',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* Left: Licensing matrix */}
          <div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>
              Perpetual Licensing Philosophy
            </h2>
            <p style={{ fontSize: '14.5px', color: '#505050', marginBottom: '20px' }}>
              Unlike recurring SaaS subscription models, ADIOS is built on genuine perpetual software ownership.
              Your software runs offline on your own hardware forever.
            </p>

            <table style={{ width: '100%', background: '#ffffff', border: '1px solid #e6e6e6', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6' }}>Capability</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #e6e6e6' }}>Community Free</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #e6e6e6' }}>Lifetime License</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>All core modules &amp; features</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>Local SQLite database storage</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>Custom directory backups</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px' }}>Multi-device encrypted cloud sync</td>
                  <td style={{ textAlign: 'center', color: '#a19f9d' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Cart Summary Box */}
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 600, color: '#262626' }}>Selected Suite Cart</div>
              <span style={{ fontSize: '12px', background: '#eff6fc', color: '#0067b8', padding: '2px 8px', fontWeight: 600 }}>
                {cart.length} {cart.length === 1 ? 'Suite' : 'Suites'}
              </span>
            </div>

            {selectedApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: '#737373', fontSize: '13.5px' }}>
                Your cart is empty. Choose suites above to bundle your software.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {selectedApps.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: '#fbfbfb', border: '1px solid #f2f2f2', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.name}</div>
                      <div className="font-mono" style={{ fontSize: '11px', color: '#737373' }}>Prefix: {item.keyPrefix}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</span>
                      <button type="button" onClick={() => toggleCartItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737373' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedApps.length > 0 && (
              <div style={{ background: '#f7f7f7', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#737373' }}>Subtotal:</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#107c10', marginBottom: '4px' }}>
                    <span>Bundle Savings ({Math.round(discountRate * 100)}%):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 700, borderTop: '1px dashed #dcdcdc', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total:</span>
                  <span className="font-mono" style={{ color: '#0067b8' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => handleStartPurchase()}
              disabled={selectedApps.length === 0}
              className="ms-hero-btn"
              style={{ width: '100%', height: '40px', fontSize: '14px' }}
            >
              Checkout via UPI / QR (₹{totalAmount.toLocaleString('en-IN')})
            </button>
          </div>
        </div>
      </section>

      {/* 5. DOWNLOADS TABLE */}
      <section id="downloads" style={{ padding: '0 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Downloads &amp; Runtime</h2>
        <table style={{ width: '100%', border: '1px solid #e6e6e6', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6' }}>Platform</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6' }}>Architecture</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6' }}>Channel</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid #e6e6e6' }}>Get it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2' }}><b>Windows</b></td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2' }}>Windows 10 / 11 (64-bit)</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2', color: '#107c10', fontWeight: 600 }}>Available (v2.0.0-alpha.1)</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2', textAlign: 'right' }}>
                <a href="/api/download" download className="ms-hero-btn" style={{ height: '30px', padding: '0 12px', fontSize: '12.5px' }}>
                  Download .exe
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 14px' }}><b>Linux</b></td>
              <td style={{ padding: '12px 14px' }}>Ubuntu, Debian, Fedora, Arch</td>
              <td style={{ padding: '12px 14px', color: '#107c10', fontWeight: 600 }}>Available (PyPI)</td>
              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                <code className="font-mono" style={{ background: '#f2f2f2', padding: '4px 8px', fontSize: '12px' }}>pip install adios-manager</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6. OFFICIAL MICROSOFT FOOTER */}
      <footer style={{ background: '#f2f2f2', borderTop: '1px solid #e6e6e6', padding: '36px 6%', fontSize: '12px', color: '#616161' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#262626', marginBottom: '2px' }}>Microsoft-Grade Offline Management Systems</div>
            <div>Built for speed and durability by Sayan Maity. 100% Offline-first guarantee.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" style={{ color: '#616161' }}>GitHub</a>
            <Link href="/community" style={{ color: '#616161' }}>Community</Link>
            <Link href="/privacy" style={{ color: '#616161' }}>Privacy</Link>
            <Link href="/terms" style={{ color: '#616161' }}>Terms</Link>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '17px' }}>
                {authMode === 'signin' ? 'Sign in' : authMode === 'tester' ? 'Join Alpha Testing' : 'Create Account'}
              </div>
              <button type="button" onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', background: '#f2f2f2', padding: '2px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setAuthMode('signin')} style={{ flex: 1, padding: '6px', border: 'none', background: authMode === 'signin' ? '#ffffff' : 'transparent', fontWeight: authMode === 'signin' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign in</button>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: '6px', border: 'none', background: authMode === 'signup' ? '#ffffff' : 'transparent', fontWeight: authMode === 'signup' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign up</button>
              <button type="button" onClick={() => setAuthMode('tester')} style={{ flex: 1, padding: '6px', border: 'none', background: authMode === 'tester' ? '#ffffff' : 'transparent', color: authMode === 'tester' ? '#0067b8' : 'inherit', fontWeight: authMode === 'tester' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Alpha Tester</button>
            </div>

            {authError && (
              <div style={{ background: '#fde7e9', border: '1px solid #d83b01', color: '#d83b01', padding: '8px 10px', fontSize: '12px', marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Full name</label>
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required placeholder="Sayan Maity" style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Email address</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="your.email@example.com" style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
              </div>
              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Phone number (optional)</label>
                  <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} placeholder="+91 9876543210" style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
              </div>
              <button type="submit" disabled={authLoading} className="ms-hero-btn" style={{ width: '100%', height: '36px', fontSize: '13.5px' }}>
                {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign in' : authMode === 'tester' ? 'Register as Tester' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '28px', maxWidth: '420px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '17px' }}>UPI Payment Checkout</div>
              <button type="button" onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {orderSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dff6dd', color: '#107c10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Check size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>Payment Reference Submitted</div>
                <p style={{ fontSize: '13px', color: '#505050', marginBottom: '16px' }}>
                  Thank you, <b>{user?.name}</b>. Your UPI reference (<b>{utrNumber}</b>) has been recorded.
                  Your license key will be issued upon bank verification.
                </p>
                <button type="button" onClick={() => { setShowCheckoutModal(false); setOrderSubmitted(false); }} className="ms-hero-btn" style={{ width: '100%' }}>Done</button>
              </div>
            ) : (
              <div>
                <div style={{ background: '#f7f7f7', border: '1px solid #e6e6e6', padding: '16px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'inline-block', background: '#ffffff', padding: '8px', border: '1px solid #e6e6e6', marginBottom: '8px' }}>
                    <svg width="130" height="130" viewBox="0 0 100 100" fill="#1b1b1b">
                      <rect x="0" y="0" width="30" height="30" fill="#1b1b1b" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" fill="#0067b8" />
                      <rect x="70" y="0" width="30" height="30" fill="#1b1b1b" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" fill="#0067b8" />
                      <rect x="0" y="70" width="30" height="30" fill="#1b1b1b" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" fill="#0067b8" />
                      <rect x="40" y="10" width="10" height="20" />
                      <rect x="55" y="15" width="8" height="8" />
                      <rect x="40" y="40" width="20" height="20" fill="#0067b8" />
                      <rect x="70" y="40" width="10" height="10" />
                      <rect x="85" y="55" width="12" height="12" />
                      <rect x="40" y="70" width="15" height="15" />
                      <rect x="65" y="75" width="10" height="20" />
                      <rect x="85" y="80" width="10" height="10" />
                    </svg>
                  </div>
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>sayanjc3639q@oksbi</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0067b8', marginTop: '4px' }}>Total: ₹{totalAmount.toLocaleString('en-IN')}</div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>UPI Reference / UTR Number (12 digits)*</label>
                    <input type="text" placeholder="e.g. 432190821941" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} required className="font-mono" style={{ width: '100%', height: '36px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
                  </div>
                  <button type="submit" disabled={submittingOrder} className="ms-hero-btn" style={{ width: '100%', height: '38px', fontSize: '13.5px' }}>
                    {submittingOrder ? 'Submitting...' : 'Submit Payment Reference'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '28px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '17px' }}>Account &amp; License Keys</div>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ background: '#f7f7f7', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
              <div><b>Name:</b> {user?.name}</div>
              <div><b>Email:</b> {user?.email}</div>
              {user?.phone && <div><b>Phone:</b> {user?.phone}</div>}
            </div>

            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '8px' }}>Your License Keys</div>
            {loadingProfile ? (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '13px', color: '#737373' }}>Loading keys...</div>
            ) : profileData?.productKeys && profileData.productKeys.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {profileData.productKeys.map((pk, idx) => {
                  const isRevealed = revealedKeys[pk.key] || false;
                  const maskedKey = pk.key.slice(0, 10) + '••••-••••';
                  const isCopied = copiedKey === pk.key;
                  return (
                    <div key={idx} style={{ background: '#fbfbfb', border: '1px solid #e6e6e6', padding: '10px 12px' }}>
                      <div style={{ fontSize: '12px', color: '#0067b8', fontWeight: 600, marginBottom: '4px' }}>{pk.plan}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>{isRevealed ? pk.key : maskedKey}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => toggleRevealKey(pk.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#737373' }}>
                            {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button type="button" onClick={() => handleCopyKey(pk.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCopied ? '#107c10' : '#737373' }}>
                            {isCopied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', fontSize: '13px', color: '#737373' }}>No active keys found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
