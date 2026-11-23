'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  IndianRupee,
  CheckSquare,
  Calendar,
  CreditCard,
  Users,
  Timer,
  ClipboardList,
  Sparkles,
  GitCommit,
  Share2,
  User,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';

export default function HomePage() {
  // Authentication Modal / State for Purchasing
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Payment Checkout Modal
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

  // Linux command copy state
  const [copiedLinux, setCopiedLinux] = useState(false);

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
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
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

  const handleStartPurchase = () => {
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

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: user.name,
          email: user.email,
          phone: user.phone,
          utrNumber,
          amount: 999,
          plan: 'Pro Lifetime Key'
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
      {/* 5.1 Top bar */}
      <header
        style={{
          background: 'var(--accent)',
          color: '#ffffff',
          height: '40px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(0,0,0,0.1)'
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Left: Logo mark + ADIOS + v2.0 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image
              src="/logo.png"
              alt="ADIOS logo"
              width={20}
              height={20}
              style={{ objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 600, fontSize: '15px', color: '#ffffff', letterSpacing: '0.2px' }}>
              ADIOS
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.85)',
                marginLeft: '2px'
              }}
            >
              v2.0
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px'
            }}
            className="desktop-nav"
          >
            <a
              href="#downloads"
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Platforms
            </a>
            <a
              href="#pricing"
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Get key (UPI)
            </a>
            <a
              href="#faq"
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              FAQs
            </a>
            <Link
              href="/community"
              style={{ color: '#ffffff', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}
              onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Community
            </Link>

            {user ? (
              <button
                type="button"
                onClick={handleOpenProfile}
                className="font-mono"
                style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="View Profile & Product Keys"
              >
                <User size={13} strokeWidth={2} />
                <span>{user.name}</span>
                <span style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '2px', opacity: 0.9 }}>
                  <Key size={11} strokeWidth={2} />
                  <span>Keys</span>
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
                onMouseOver={e => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseOut={e => (e.currentTarget.style.textDecoration = 'none')}
              >
                Sign in
              </button>
            )}

            <a
              href="/api/download"
              download
              style={{
                background: '#ffffff',
                color: 'var(--accent)',
                height: '26px',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: 600,
                borderRadius: 'var(--radius)',
                border: '1px solid #ffffff',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1
              }}
            >
              Download .exe
            </a>
          </nav>

          {/* Mobile Details Menu */}
          <details className="mobile-nav" style={{ position: 'relative', border: 'none', padding: 0 }}>
            <summary
              style={{
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '4px 8px',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 'var(--radius)'
              }}
            >
              Menu
            </summary>
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '32px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '12px',
                borderRadius: 'var(--radius)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minWidth: '160px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}
            >
              <a href="#downloads" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px' }}>Platforms</a>
              <a href="#pricing" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px' }}>Get key (UPI)</a>
              <a href="#faq" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px' }}>FAQs</a>
              <Link href="/community" style={{ color: 'var(--text)', textDecoration: 'none', fontSize: '13px' }}>Community</Link>
              {user ? (
                <button
                  type="button"
                  onClick={handleOpenProfile}
                  className="font-mono"
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <User size={13} strokeWidth={2} />
                  <span>{user.name}</span>
                  <span style={{ color: 'var(--text-muted)' }}>(View Keys)</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: 0
                  }}
                >
                  Sign in
                </button>
              )}
              <a href="/api/download" download className="btn btn-primary" style={{ height: '30px', fontSize: '12px' }}>
                Download .exe
              </a>
            </div>
          </details>
        </div>
      </header>

      {/* Main Content Container (max-width 980px) */}
      <main style={{ maxWidth: '980px', width: '100%', margin: '0 auto', padding: '36px 20px', flex: 1 }}>
        {/* 5.2 Intro Section */}
        <section
          aria-labelledby="intro-heading"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '36px',
            alignItems: 'start',
            marginBottom: '48px'
          }}
        >
          {/* Left Column */}
          <div>
            <div
              className="font-mono"
              style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}
            >
              Windows / Linux · offline-first · SQLite
            </div>
            <h1 id="intro-heading" style={{ marginBottom: '14px' }}>
              A desktop manager for money, exams and study.
            </h1>
            <p style={{ color: 'var(--text)', marginBottom: '20px', lineHeight: 1.6 }}>
              I built ADIOS to keep my finances (in ₹), exams, subscriptions and skills in one app instead of five.
              It stores everything locally in SQLite and works without an account. If you use more than one machine,
              an optional product key turns on encrypted sync.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
              <a
                href="/api/download"
                download
                className="btn btn-primary"
                style={{ height: '36px', padding: '0 18px', fontSize: '14px' }}
              >
                Download for Windows (.exe)
              </a>
              <button
                type="button"
                onClick={handleStartPurchase}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  padding: 0
                }}
              >
                Buy a lifetime key (UPI / QR)
              </button>
            </div>

            <div
              className="font-mono"
              style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}
            >
              ADIOS-Setup-2.0.exe · 64-bit · ~48 MB · updated 2026-11-23
            </div>
          </div>

          {/* Right Column: Screenshot in real CSS Window Frame */}
          <div>
            <div
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                borderRadius: 'var(--radius)',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              {/* Window Title Bar */}
              <div
                style={{
                  background: '#0078d4',
                  color: '#ffffff',
                  height: '28px',
                  padding: '0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="#ffffff">
                    <rect x="2" y="2" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                  </svg>
                  <span>ADIOS - Personal Desktop Manager</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', fontFamily: 'monospace' }}>
                  <span>─</span>
                  <span>□</span>
                  <span>✕</span>
                </div>
              </div>

              {/* Real App Screenshot */}
              <div style={{ position: 'relative', width: '100%', height: 'auto', background: '#f3f3f3' }}>
                <Image
                  src="/app-screenshot.png"
                  alt="ADIOS desktop application interface showing Money tab, transactions in rupees and dashboard summary panels"
                  width={1280}
                  height={720}
                  priority
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'var(--text-muted)',
                marginTop: '6px',
                textAlign: 'left'
              }}
            >
              The Money tab and dashboard, as in v2.0.
            </div>
          </div>
        </section>

        {/* 5.3 Downloads Section */}
        <section
          id="downloads"
          aria-labelledby="downloads-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="downloads-heading">Downloads</h2>

          <div style={{ overflowX: 'auto', marginBottom: '14px' }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Platform</th>
                  <th scope="col">Requirements</th>
                  <th scope="col">Format</th>
                  <th scope="col">Status</th>
                  <th scope="col">Get it</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><b>Windows</b></td>
                  <td>Windows 10 / 11, 64-bit</td>
                  <td><code className="font-mono">.exe</code> (Inno Setup)</td>
                  <td style={{ color: 'var(--ok)', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--ok)', marginRight: '6px' }}></span>
                    Available
                  </td>
                  <td>
                    <a
                      href="/api/download"
                      download
                      className="btn btn-secondary"
                      style={{ height: '28px', padding: '0 12px', fontSize: '13px' }}
                    >
                      Download
                    </a>
                  </td>
                </tr>
                <tr>
                  <td><b>Linux</b></td>
                  <td>Ubuntu, Debian, Fedora, Arch</td>
                  <td><code className="font-mono">AppImage / PyPI</code></td>
                  <td style={{ color: 'var(--ok)', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--ok)', marginRight: '6px' }}></span>
                    Available
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <a href="#linux-code" style={{ fontSize: '13px' }}>Get AppImage</a>
                      <span style={{ color: 'var(--border-strong)' }}>·</span>
                      <a href="#linux-code" style={{ fontSize: '13px' }}>PyPI</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><b>macOS</b></td>
                  <td>Apple Silicon (M1-M4) and Intel</td>
                  <td><code className="font-mono">.dmg</code></td>
                  <td style={{ color: 'var(--warn)', fontWeight: 600 }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', background: 'var(--warn)', marginRight: '6px' }}></span>
                    Coming soon
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                    Not ready yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            All builds work fully offline and don&apos;t need an account. The Windows installer includes a custom backup directory selector.
          </p>

          <div
            id="linux-code"
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              padding: '10px 14px',
              borderRadius: 'var(--radius)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              maxWidth: '460px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-muted)', userSelect: 'none' }}>$</span>
              <code className="font-mono">pip install adios-manager</code>
            </div>
            <button
              type="button"
              onClick={handleCopyLinux}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                padding: '2px 6px'
              }}
            >
              {copiedLinux ? 'Copied' : 'Copy'}
            </button>
          </div>
        </section>

        {/* 5.4 What's inside Section */}
        <section
          aria-labelledby="modules-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="modules-heading">What&apos;s inside</h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px 28px'
            }}
          >
            {/* Money */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <IndianRupee size={17} strokeWidth={2} color="var(--mod-money)" />
              <div>
                <b>Money</b>: transactions, accounts and categories in ₹, with a monthly cash flow summary.
              </div>
            </div>

            {/* Exams */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckSquare size={17} strokeWidth={1.75} color="var(--mod-exams)" />
              <div>
                <b>Exams</b>: upcoming exams and dates.
              </div>
            </div>

            {/* Schedule */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={17} strokeWidth={1.75} color="var(--mod-schedule)" />
              <div>
                <b>Schedule</b>: events for today and the week.
              </div>
            </div>

            {/* Subscriptions */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CreditCard size={17} strokeWidth={1.75} color="var(--mod-subscriptions)" />
              <div>
                <b>Subscriptions</b>: tracks renewals and warns about the next 14 days.
              </div>
            </div>

            {/* Clubs & Societies */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={17} strokeWidth={1.75} color="var(--mod-clubs)" />
              <div>
                <b>Clubs &amp; societies</b>: tasks and due dates per club.
              </div>
            </div>

            {/* Study Tracker */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Timer size={17} strokeWidth={1.75} color="var(--mod-study)" />
              <div>
                <b>Study tracker</b>: study sessions with a Pomodoro timer.
              </div>
            </div>

            {/* Project Wishlist */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ClipboardList size={17} strokeWidth={1.75} color="var(--mod-wishlist)" />
              <div>
                <b>Project wishlist</b>: projects I want to build.
              </div>
            </div>

            {/* Skills Inventory */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={17} strokeWidth={1.75} color="var(--mod-skills)" />
              <div>
                <b>Skills inventory</b>: skills I have and want to learn.
              </div>
            </div>

            {/* Development Journey */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <GitCommit size={17} strokeWidth={1.75} color="var(--mod-journey)" />
              <div>
                <b>Development journey</b>: a running log of progress.
              </div>
            </div>

            {/* LinkedIn Queue */}
            <div style={{ borderBottom: '1px dotted var(--border)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Share2 size={17} strokeWidth={1.75} color="var(--mod-linkedin)" />
              <div>
                <b>LinkedIn queue</b>: drafts and scheduled posts.
              </div>
            </div>
          </div>
        </section>

        {/* 5.5 Offline vs Sync Section */}
        <section
          id="pricing"
          aria-labelledby="sync-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="sync-heading">Offline by default, sync if you want it</h2>
          <p style={{ marginBottom: '12px' }}>
            ADIOS is completely local. When you write transactions, exam notes or tasks, they go directly into an SQLite database on your hard drive.
          </p>
          <p style={{ marginBottom: '20px' }}>
            If you work across both a laptop and desktop, a lifetime key connects your machines over end-to-end encrypted sync without locking you into a recurring subscription.
          </p>

          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table>
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col" style={{ width: '130px', textAlign: 'center' }}>Free offline</th>
                  <th scope="col" style={{ width: '150px', textAlign: 'center' }}>With lifetime key</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>All 10 modules</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                </tr>
                <tr>
                  <td>Local SQLite storage</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                </tr>
                <tr>
                  <td>Custom backup folder selection</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                  <td style={{ textAlign: 'center' }}>✓</td>
                </tr>
                <tr>
                  <td>Multi-machine sync</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ok)' }}>✓</td>
                </tr>
                <tr>
                  <td>Encrypted cloud copy</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--ok)' }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bordered box for Lifetime key */}
          <div
            style={{
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              padding: '16px 20px',
              borderRadius: 'var(--radius)',
              maxWidth: '460px'
            }}
          >
            <h3 style={{ marginBottom: '8px' }}>Lifetime key</h3>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              Price: <span className="font-mono" style={{ fontWeight: 600 }}>₹999</span> (one-time payment)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Payment via UPI / QR. Keys are verified and issued directly to your email.
            </div>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleStartPurchase}
                className="btn btn-primary"
                style={{ height: '32px', fontSize: '13px' }}
              >
                Pay via UPI / QR
              </button>
              <a
                href="#faq"
                style={{ fontSize: '13px', textDecoration: 'underline' }}
              >
                How to activate the key
              </a>
            </div>
          </div>
        </section>

        {/* 5.6 Changelog */}
        <section
          aria-labelledby="changelog-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="changelog-heading">Changelog</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                2026-11-23 · v2.0
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Native desktop rewrite with Qt Fusion engine. Added Money tab with rupee cash flow calculations,
                dockable dashboard panels, rolling SQLite backups, and Inno Setup installer.
              </p>
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                2026-11-20 · v1.8
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Added study tracker Pomodoro timer, subscription 14-day renewal warnings, and automated SQLite schema migration.
              </p>
            </div>
            <div>
              <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                2026-11-15 · v1.5
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Initial cross-platform release for Windows and Linux with local database file export.
              </p>
            </div>
          </div>
        </section>

        {/* 5.7 FAQ Section */}
        <section
          id="faq"
          aria-labelledby="faq-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="faq-heading">FAQ</h2>
          <div style={{ maxWidth: '680px' }}>
            <details>
              <summary>Do I need a product key if I only use ADIOS offline?</summary>
              <p>
                No. ADIOS is free and works offline forever. All 10 modules, SQLite storage, and rolling backups run locally on your computer without a key.
              </p>
            </details>
            <details>
              <summary>How does payment and license key issuance work?</summary>
              <p>
                Sign in with your name and email, pay ₹999 via the official UPI QR code or UPI ID, and submit your 12-digit transaction reference (UTR). I manually verify the payment and email your key.
              </p>
            </details>
            <details>
              <summary>What personal data do you collect?</summary>
              <p>
                I only store your name, email, and phone number for support and key delivery. Your local financial records and personal notes never leave your computer.
              </p>
            </details>
            <details>
              <summary>Can I delete my synchronized cloud data later?</summary>
              <p>
                Yes. You can purge all cloud data at any time from the app under Settings → Account &amp; Cloud Sync → Purge Cloud Data.
              </p>
            </details>
            <details>
              <summary>Can I install ADIOS on multiple computers?</summary>
              <p>
                Yes. A lifetime key lets you sync your data across both your laptop and desktop.
              </p>
            </details>
          </div>
        </section>

        {/* 5.8 Community Section */}
        <section
          aria-labelledby="community-heading"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '40px', marginBottom: '48px' }}
        >
          <h2 id="community-heading">Community</h2>
          <p style={{ marginBottom: '10px' }}>
            If you have questions, feedback, or need help with a backup, join the discussions or open an issue on GitHub.
          </p>
          <div style={{ display: 'flex', gap: '14px', fontSize: '14px' }}>
            <Link href="/community">Community discussion</Link>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer">
              GitHub repository
            </a>
          </div>
        </section>
      </main>

      {/* 5.9 Footer (status bar style) */}
      <footer
        style={{
          background: 'var(--surface-alt)',
          borderTop: '1px solid var(--border)',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}
      >
        <div
          style={{
            maxWidth: '980px',
            width: '100%',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>ADIOS v2.0 · Personal Desktop Manager</div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <span>Built by Sayan Maity</span>
            <span>·</span>
            <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
              GitHub
            </a>
            <span>·</span>
            <Link href="/privacy" style={{ color: 'var(--text-muted)' }}>Privacy</Link>
            <span>·</span>
            <Link href="/terms" style={{ color: 'var(--text-muted)' }}>Terms</Link>
          </div>
        </div>
      </footer>

      {/* 1. SIGN IN / SIGN UP MODAL */}
      {showAuthModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px' }}>
                {authMode === 'signin' ? 'Sign in' : 'Create account'}
              </h3>
              <button
                type="button"
                onClick={() => { setShowAuthModal(false); setAuthError(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  border: 'none',
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: authMode === 'signin' ? 600 : 400,
                  borderBottom: authMode === 'signin' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: authMode === 'signin' ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer'
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
                  background: 'none',
                  fontSize: '13px',
                  fontWeight: authMode === 'signup' ? 600 : 400,
                  borderBottom: authMode === 'signup' ? '2px solid var(--accent)' : '2px solid transparent',
                  color: authMode === 'signup' ? 'var(--accent)' : 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                Create account
              </button>
            </div>

            {authError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  padding: '8px 10px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius)',
                  marginBottom: '14px'
                }}
              >
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Full name
                  </label>
                  <input
                    type="text"
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '34px',
                    padding: '0 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px'
                  }}
                />
              </div>

              {authMode === 'signup' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                    Contact number (for support &amp; notifications)
                  </label>
                  <input
                    type="tel"
                    value={authPhone}
                    onChange={e => setAuthPhone(e.target.value)}
                    style={{
                      width: '100%',
                      height: '34px',
                      padding: '0 10px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                  Password
                </label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '34px',
                    padding: '0 10px',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="submit"
                  disabled={authLoading}
                  className="btn btn-primary"
                  style={{ flex: 1, height: '34px' }}
                >
                  {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="btn btn-secondary"
                  style={{ height: '34px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPI CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '440px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px' }}>Pay via UPI</h3>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {orderSubmitted ? (
              <div>
                <h4 style={{ fontSize: '15px', color: 'var(--ok)', marginBottom: '8px' }}>Payment reference received</h4>
                <p style={{ fontSize: '14px', color: 'var(--text)', marginBottom: '16px', lineHeight: 1.5 }}>
                  Thank you, <b>{user?.name}</b>. Your UPI reference (<b>{utrNumber}</b>) has been submitted.
                  I will manually verify the payment and email your lifetime product key.
                </p>
                <button
                  type="button"
                  onClick={() => { setShowCheckoutModal(false); setOrderSubmitted(false); }}
                  className="btn btn-primary"
                  style={{ height: '34px' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '14px', lineHeight: 1.5 }}>
                  Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM) or transfer to the UPI ID.
                </p>

                {/* Plain bordered QR card */}
                <div
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1px solid var(--border)',
                    padding: '14px',
                    borderRadius: 'var(--radius)',
                    textAlign: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <div
                    style={{
                      display: 'inline-block',
                      background: '#ffffff',
                      padding: '10px',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      marginBottom: '8px'
                    }}
                  >
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
                  <div className="font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>
                    sayanjc3639q@oksbi
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Amount: <span className="font-mono" style={{ fontWeight: 600, color: 'var(--text)' }}>₹999.00</span>
                  </div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                      UPI reference / UTR number (12 digits)*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 432190821941"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      required
                      className="font-mono"
                      style={{
                        width: '100%',
                        height: '34px',
                        padding: '0 10px',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius)',
                        fontSize: '13px'
                      }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Found in your payment app transaction receipt.
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingOrder}
                    className="btn btn-primary"
                    style={{ width: '100%', height: '34px' }}
                  >
                    {submittingOrder ? 'Submitting...' : 'Submit payment reference'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. USER PROFILE & PRODUCT KEYS MODAL */}
      {showProfileModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div className="card" style={{ maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px' }}>Account &amp; License Keys</h3>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Manage your personal profile and access your genuine ADIOS product keys.
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* User Details Box */}
            <div
              style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                padding: '12px 14px',
                borderRadius: 'var(--radius)',
                marginBottom: '18px',
                fontSize: '13px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Name:</span>
                <b>{user?.name}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                <span className="font-mono">{user?.email}</span>
              </div>
              {user?.phone && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phone:</span>
                  <span className="font-mono">{user?.phone}</span>
                </div>
              )}
            </div>

            {/* Product Keys Section */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600 }}>Your Genuine Product Keys</h4>
                <button
                  type="button"
                  onClick={() => user?.email && fetchUserProfile(user.email)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Refresh
                </button>
              </div>

              {loadingProfile ? (
                <div style={{ padding: '16px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
                  Loading your product keys...
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
                          background: 'var(--surface)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius)',
                          padding: '12px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--ok)' }}></span>
                            <span>{pk.plan}</span>
                          </span>
                          <span className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {pk.issuedAt}
                          </span>
                        </div>

                        {/* Hidden / Revealed Key Input + Action Buttons */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input
                            type="text"
                            readOnly
                            value={isRevealed ? pk.key : maskedKey}
                            className="font-mono"
                            style={{
                              flex: 1,
                              height: '32px',
                              padding: '0 8px',
                              fontSize: '13px',
                              fontWeight: 600,
                              background: 'var(--surface-alt)',
                              border: '1px solid var(--border)',
                              borderRadius: 'var(--radius)',
                              color: 'var(--text)',
                              letterSpacing: '0.5px'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => toggleRevealKey(pk.key)}
                            className="btn btn-secondary"
                            style={{ height: '32px', padding: '0 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title={isRevealed ? 'Hide product key' : 'Reveal full product key'}
                          >
                            {isRevealed ? <EyeOff size={13} strokeWidth={2} /> : <Eye size={13} strokeWidth={2} />}
                            <span>{isRevealed ? 'Hide' : 'Reveal'}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(pk.key)}
                            className="btn btn-primary"
                            style={{ height: '32px', padding: '0 8px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="Copy product key to clipboard"
                          >
                            {isCopied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={2} />}
                            <span>{isCopied ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Paste this key in the desktop app under <b>Help → Activate Product Key</b> to enable cloud sync.
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div
                  style={{
                    background: 'var(--surface-alt)',
                    border: '1px dashed var(--border)',
                    padding: '16px',
                    borderRadius: 'var(--radius)',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: 'var(--text-muted)'
                  }}
                >
                  <p style={{ marginBottom: '8px' }}>No active product key registered under this account yet.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileModal(false);
                      setShowCheckoutModal(true);
                    }}
                    className="btn btn-secondary"
                    style={{ height: '30px', fontSize: '12px' }}
                  >
                    Buy Lifetime Key (₹999)
                  </button>
                </div>
              )}
            </div>

            {/* Pending Verifications */}
            {profileData?.orders && profileData.orders.some(o => o.status === 'Pending Verification') && (
              <div
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fef3c7',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius)',
                  fontSize: '12px',
                  color: '#92400e',
                  marginBottom: '16px'
                }}
              >
                <b>Pending Verification:</b> A payment reference is currently under review by our admin team.
                Your key will appear here as soon as the transaction is confirmed.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setUser(null);
                  setShowProfileModal(false);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b91c1c',
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="btn btn-secondary"
                style={{ height: '32px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global CSS for Mobile Nav Toggle */}
      <style jsx global>{`
        .desktop-nav {
          display: flex;
        }
        .mobile-nav {
          display: none;
        }
        @media (max-width: 720px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-nav {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
