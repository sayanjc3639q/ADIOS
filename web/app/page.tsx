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
  ArrowRight,
  Sparkles,
  ExternalLink,
  X,
  HelpCircle,
  Zap,
  Layers,
  Database
} from 'lucide-react';
import { SUITE_APPS, SuiteApp } from './lib/suites';
import { FAQS, UNIQUENESS_STORIES } from './lib/about-adios';

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
  const [suitesMenuOpen, setSuitesMenuOpen] = useState(false);

  // Search feature state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Downloads tab state: 'windows' | 'macos' | 'linux' | 'googlebook'
  const [downloadPlatform, setDownloadPlatform] = useState<'windows' | 'macos' | 'linux' | 'googlebook'>('windows');
  const [copiedCliCommand, setCopiedCliCommand] = useState(false);

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

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

  // Filtered products for search
  const filteredProducts = searchQuery.trim()
    ? SUITE_APPS.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* 1. ORIGINAL BLUE TITLEBAR HEADER */}
      <header
        style={{
          height: '42px',
          background: 'var(--accent)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5%',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid rgba(0, 0, 0, 0.25)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left: Logo mark + ADIOS title + navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '22px', height: '22px' }}>
                <Image
                  src="/logo.png"
                  alt="ADIOS Logo"
                  width={22}
                  height={22}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <span style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', letterSpacing: '0.2px' }}>
                ADIOS
              </span>
              <span
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontFamily: 'monospace',
                  background: 'rgba(255, 255, 255, 0.15)',
                  padding: '1px 6px',
                  borderRadius: '3px'
                }}
              >
                v2.0
              </span>
            </Link>

            {/* Nav Menu with white text on accent blue */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '22px' }} className="desktop-nav">
              <Link href="/product/personal" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                Personal
              </Link>

              {/* Business Suites Dropdown Group */}
              <div
                style={{ position: 'relative' }}
                onMouseEnter={() => setSuitesMenuOpen(true)}
                onMouseLeave={() => setSuitesMenuOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setSuitesMenuOpen(!suitesMenuOpen)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  <span>Suites</span>
                  <ChevronDown size={13} style={{ transform: suitesMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
                </button>

                {suitesMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      paddingTop: '6px',
                      zIndex: 150
                    }}
                  >
                    <div
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                        minWidth: '220px',
                        padding: '6px 0'
                      }}
                    >
                      <Link
                        href="/product/hospital"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          color: 'var(--text)',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Hospital HMS
                      </Link>
                      <Link
                        href="/product/hotel"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          color: 'var(--text)',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Hotel PMS
                      </Link>
                      <Link
                        href="/product/academics"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'block',
                          padding: '8px 16px',
                          color: 'var(--text)',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Academics
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Single small name for GST POS Billing -> POS */}
              <Link href="/product/billing" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                POS
              </Link>

              {/* Clean Pricing link pointing to pricing section */}
              <a href="#pricing" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                Pricing
              </a>

              {/* Direct Link to About ADIOS Uniqueness Section */}
              <a href="#about" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                About ADIOS
              </a>

              {/* Direct Link to FAQs */}
              <a href="#faqs" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                FAQs
              </a>

              <a href="#downloads" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                Downloads
              </a>
              <Link href="/community" style={{ color: '#ffffff', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
                Community
              </Link>
            </nav>
          </div>

          {/* Right: Search, Cart & User Profile Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
            {/* Functional Search Bar */}
            <div style={{ position: 'relative' }}>
              {searchOpen ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search suites, features..."
                    autoFocus
                    className="ms-search-input"
                  />
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ffffff', display: 'flex' }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#ffffff'
                  }}
                >
                  <span>Search</span>
                  <Search size={14} />
                </button>
              )}

              {/* Search Results Dropdown */}
              {searchOpen && searchQuery.trim() && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '320px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.5)',
                    zIndex: 200,
                    maxHeight: '340px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', fontWeight: 600 }}>
                    Matching Products ({filteredProducts.length})
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '16px', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No matching suites found.
                    </div>
                  ) : (
                    filteredProducts.map(prod => (
                      <Link
                        key={prod.id}
                        href={`/product/${prod.id}`}
                        onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                        style={{
                          display: 'block',
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border)',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#ffffff' }}>{prod.name}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>₹{prod.price.toLocaleString('en-IN')} · {prod.category}</div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart Link */}
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                color: '#ffffff',
                textDecoration: 'none'
              }}
            >
              <span>Cart</span>
              <ShoppingCart size={14} />
              {cart.length > 0 && (
                <span style={{ fontSize: '11px', background: '#ffffff', color: 'var(--accent)', fontWeight: 700, padding: '1px 5px', borderRadius: '50%' }}>
                  {cart.length}
                </span>
              )}
            </Link>

            {/* Profile Section: Profile Icon or Name */}
            {user ? (
              <div
                onClick={handleOpenProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.2)'
                }}
                title={`Signed in as ${user.name}`}
              >
                <User size={13} />
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff' }}>
                  {user.name}
                </span>
              </div>
            ) : (
              <div
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  cursor: 'pointer',
                  background: 'rgba(255, 255, 255, 0.2)',
                  transition: 'background 0.15s ease'
                }}
                title="Sign in to ADIOS"
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              >
                <User size={14} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. ORIGINAL INTRO HERO SECTION (Same structure, dark native canvas) */}
      <section
        style={{
          width: '100%',
          minHeight: '520px',
          background: 'radial-gradient(ellipse at top right, #252836 0%, #1a1c24 50%, #14151a 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          padding: '56px 6% 64px 6%',
          overflow: 'hidden',
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) minmax(360px, 1.25fr)',
            gap: '48px',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Product Statement */}
          <div style={{ maxWidth: '560px', zIndex: 2 }}>
            <div
              className="font-mono"
              style={{ fontSize: '13px', color: '#4da6ff', marginBottom: '14px', letterSpacing: '0.04em' }}
            >
              Windows / Linux · offline-first · SQLite
            </div>

            <h1
              style={{
                color: '#ffffff',
                fontSize: 'clamp(36px, 4.4vw, 54px)',
                fontWeight: 500,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '16px'
              }}
            >
              A desktop manager for money, exams and study.
            </h1>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '16px',
                lineHeight: 1.6,
                marginBottom: '28px',
                fontWeight: 350
              }}
            >
              I built ADIOS to keep my finances (in ₹), exams, subscriptions and skills in one app instead of five.
              It stores everything locally in SQLite and works without an account. If you use more than one machine,
              an optional product key turns on encrypted sync.
            </p>

            {/* Action Buttons: Blue Primary Button + Buy Lifetime Key link */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
              <a
                href="/api/download"
                download
                className="ms-hero-btn"
                style={{ height: '38px', padding: '0 20px', fontSize: '14px' }}
              >
                Download for Windows (.exe)
              </a>

              <Link
                href="/cart"
                style={{
                  color: '#4da6ff',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px'
                }}
              >
                Buy a lifetime key (UPI / QR)
              </Link>
            </div>

            <div className="font-mono" style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              ADIOS-Setup-2.0.0-alpha.1.exe · 64-bit · ~48 MB · updated 2026-11-25
            </div>
          </div>

          {/* Right Column: High-Resolution Product Showcase */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '680px',
                filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.6))'
              }}
            >
              <Image
                src="/app-screenshot.png"
                alt="ADIOS Personal Desktop Manager"
                width={1280}
                height={720}
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 20px 45px rgba(0, 0, 0, 0.5)'
                }}
              />

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', textAlign: 'center' }}>
                The Money tab and dashboard, as in v2.0
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK NAV CATEGORY ICONS */}
      <section style={{ padding: '36px 6% 20px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <Link href="/product/personal" className="ms-quick-link">
            <Cpu size={20} style={{ color: 'var(--accent)' }} />
            <span>Personal Manager</span>
          </Link>
          <Link href="/product/hospital" className="ms-quick-link">
            <Building2 size={20} style={{ color: 'var(--accent)' }} />
            <span>Hospital HMS</span>
          </Link>
          <Link href="/product/hotel" className="ms-quick-link">
            <Hotel size={20} style={{ color: 'var(--accent)' }} />
            <span>Hotel PMS</span>
          </Link>
          <Link href="/product/billing" className="ms-quick-link">
            <Receipt size={20} style={{ color: 'var(--accent)' }} />
            <span>POS &amp; GST Billing</span>
          </Link>
          <Link href="/product/academics" className="ms-quick-link">
            <GraduationCap size={20} style={{ color: 'var(--accent)' }} />
            <span>Academics Suite</span>
          </Link>
        </div>
      </section>

      {/* 3. PRODUCT SHOWCASE SECTION (ORIGINAL DARK SURFACE STORE CARDS) */}
      <section id="suites" style={{ padding: '40px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '8px', fontWeight: 500 }}>
            Featured Management Suites
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 350 }}>
            Purpose-built native applications engineered with compiled Qt performance and zero cloud lock-in.
          </p>
        </div>

        {/* 4-to-5 Column Product Cards Grid in dark surface theme */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {SUITE_APPS.map(app => {
            const inCart = cart.includes(app.id);

            return (
              <div
                key={app.id}
                className="ms-product-card"
              >
                {/* Product Card Top Image Banner */}
                <div style={{ position: 'relative', width: '100%', height: '170px', background: '#181818', overflow: 'hidden' }}>
                  <Image
                    src={app.image}
                    alt={app.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 320px"
                    style={{ objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: app.status === 'available' ? 'var(--ok-bg)' : 'var(--warn-bg)',
                      color: app.status === 'available' ? 'var(--ok)' : 'var(--warn)',
                      border: `1px solid ${app.status === 'available' ? 'var(--ok)' : 'var(--warn)'}`,
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '2px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em'
                    }}
                  >
                    {app.statusLabel}
                  </div>
                </div>

                {/* Product Card Content */}
                <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', color: '#ffffff', fontWeight: 500, marginBottom: '8px' }}>
                      {app.name}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px', fontWeight: 350 }}>
                      {app.shortDescription}
                    </p>

                    <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                      Perpetual license: <b style={{ color: '#ffffff', fontWeight: 600 }}>₹{app.price.toLocaleString('en-IN')}</b>
                    </div>
                  </div>

                  {/* Button Action Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                    <Link
                      href={`/product/${app.id}`}
                      className="ms-hero-btn"
                      style={{
                        flex: 1,
                        height: '36px',
                        fontSize: '13px',
                        padding: '0 12px'
                      }}
                    >
                      Learn more
                    </Link>

                    <button
                      type="button"
                      onClick={() => toggleCartItem(app.id)}
                      className="ms-secondary-btn"
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        fontSize: '12.5px',
                        color: inCart ? 'var(--ok)' : '#4da6ff',
                        borderColor: inCart ? 'var(--ok)' : 'var(--border)',
                        fontWeight: 500
                      }}
                    >
                      {inCart ? '✓ Added' : '+ Cart'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. ABOUT ADIOS & ITS UNIQUENESS (ALTERNATING STORY IN ORIGINAL DARK PALETTE) */}
      <section id="about" style={{ padding: '60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px auto' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4da6ff', fontWeight: 600, marginBottom: '8px' }}>
            ENGINEERING PHILOSOPHY
          </div>
          <h2 style={{ fontSize: '32px', color: '#ffffff', fontWeight: 500, marginBottom: '16px', lineHeight: 1.2 }}>
            About ADIOS: What Makes It Different
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 350 }}>
            In an industry obsessed with forced cloud subscriptions, recurring micro-transactions, and latency-ridden web apps,
            ADIOS returns computing power to the physical device on your desk.
          </p>
        </div>

        {/* Alternating Story Blocks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '80px' }}>
          {UNIQUENESS_STORIES.map((story, index) => {
            const isReversed = index % 2 === 1;

            return (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '56px',
                  alignItems: 'center'
                }}
              >
                {/* Visual / Screenshot with Deep Shadow */}
                <div style={{ order: isReversed ? 2 : 1, position: 'relative' }}>
                  <div
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '24px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={story.image}
                      alt={story.title}
                      width={1280}
                      height={720}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />

                    {/* Floating Badge Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: 'var(--accent)',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '2px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {story.badge}
                    </div>

                    {/* Quick Metric Bar */}
                    <div
                      style={{
                        marginTop: '18px',
                        paddingTop: '16px',
                        borderTop: '1px solid var(--border)',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        textAlign: 'center'
                      }}
                    >
                      {story.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                          <div className="font-mono" style={{ fontSize: '16px', fontWeight: 600, color: '#4da6ff', marginTop: '2px' }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Narrative / Description Content */}
                <div style={{ order: isReversed ? 1 : 2 }}>
                  <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#4da6ff', fontWeight: 600, marginBottom: '10px' }}>
                    {story.tag}
                  </div>

                  <h3 style={{ fontSize: '26px', color: '#ffffff', fontWeight: 500, lineHeight: 1.25, marginBottom: '16px' }}>
                    {story.title}
                  </h3>

                  <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, fontWeight: 350, marginBottom: '24px' }}>
                    {story.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {story.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: 'var(--text)' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'var(--ok-bg)', color: 'var(--ok)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                          <Check size={12} />
                        </div>
                        <span style={{ fontWeight: 350 }}>{pt}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="#pricing" className="ms-secondary-btn" style={{ padding: '8px 16px', color: '#4da6ff', fontWeight: 500, fontSize: '14px' }}>
                    Explore Perpetual Pricing →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQS) ACCORDION */}
      <section id="faqs" style={{ padding: '60px 6%', maxWidth: '1000px', margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4da6ff', fontWeight: 600, marginBottom: '8px' }}>
            TRANSPARENT ANSWERS
          </div>
          <h2 style={{ fontSize: '30px', color: '#ffffff', fontWeight: 500, marginBottom: '12px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', fontWeight: 350 }}>
            Everything you need to know about ADIOS architecture, offline SQLite data storage, and perpetual software licenses.
          </p>
        </div>

        {/* FAQ Accordion List in dark theme */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={index}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  background: isOpen ? 'var(--surface-alt)' : 'var(--surface)',
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: '16px', color: '#ffffff', fontWeight: 500 }}>
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? '#4da6ff' : 'var(--text-muted)',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 22px 24px', color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: 1.6, fontWeight: 350, borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. PERPETUAL LICENSING & CART PREVIEW */}
      <section id="pricing" style={{ padding: '40px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.2fr) minmax(300px, 1fr)',
            gap: '36px',
            alignItems: 'start'
          }}
        >
          {/* Left: Licensing matrix */}
          <div>
            <h2 style={{ fontSize: '24px', color: '#ffffff', marginBottom: '8px', fontWeight: 500 }}>
              Perpetual Licensing Philosophy
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 350 }}>
              Unlike recurring SaaS subscription models, ADIOS is built on genuine perpetual software ownership.
              Your software runs offline on your own hardware forever.
            </p>

            <table style={{ width: '100%', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid var(--border)', fontWeight: 500, color: '#ffffff' }}>Capability</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 500, color: '#ffffff' }}>Community Free</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid var(--border)', fontWeight: 500, color: '#ffffff' }}>Lifetime License</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>All core modules &amp; features</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Local SQLite database storage</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)' }}>Custom directory backups</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px' }}>Multi-device encrypted cloud sync</td>
                  <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>—</td>
                  <td style={{ textAlign: 'center', color: 'var(--ok)', fontWeight: 500 }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Cart Summary Box */}
          <div style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '6px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 500, color: '#ffffff' }}>Selected Suite Cart</div>
              <span style={{ fontSize: '12px', background: 'rgba(0, 120, 212, 0.2)', color: '#4da6ff', padding: '2px 8px', fontWeight: 500, borderRadius: '4px' }}>
                {cart.length} {cart.length === 1 ? 'Suite' : 'Suites'}
              </span>
            </div>

            {selectedApps.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: '13.5px' }}>
                Your cart is empty. Choose suites above to bundle your software.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {selectedApps.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', fontSize: '13px' }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#ffffff' }}>{item.name}</div>
                      <div className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Prefix: {item.keyPrefix}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 500, color: '#ffffff' }}>₹{item.price.toLocaleString('en-IN')}</span>
                      <button type="button" onClick={() => toggleCartItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedApps.length > 0 && (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '4px', padding: '12px', marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                  <span className="font-mono" style={{ color: '#ffffff' }}>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ok)', marginBottom: '4px' }}>
                    <span>Bundle Savings ({Math.round(discountRate * 100)}%):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600, borderTop: '1px dashed var(--border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: '#ffffff' }}>Total:</span>
                  <span className="font-mono" style={{ color: '#4da6ff' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            <Link
              href="/cart"
              className="ms-hero-btn"
              style={{ width: '100%', height: '40px', fontSize: '14px', textDecoration: 'none' }}
            >
              Checkout
            </Link>
          </div>
        </div>
      </section>

      {/* 7. DOWNLOAD ADIOS & CLI (MATCHING SCREENSHOT LAYOUT IN DARK THEME) */}
      <section id="downloads" style={{ padding: '60px 6% 80px 6%', maxWidth: '1080px', margin: '0 auto', width: '100%', borderTop: '1px solid var(--border)' }}>
        {/* Main Title matching screenshot */}
        <div style={{ marginBottom: '32px' }}>
          <h1
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 500,
              color: '#ffffff',
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              marginBottom: '28px'
            }}
          >
            Download ADIOS
          </h1>

          {/* OS Platform Selector Pills (macOS, Windows, Linux, Googlebook) */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {/* macOS Pill */}
            <button
              type="button"
              onClick={() => setDownloadPlatform('macos')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '24px',
                border: downloadPlatform === 'macos' ? '1px solid #4da6ff' : '1px solid var(--border)',
                background: downloadPlatform === 'macos' ? 'var(--accent)' : 'var(--surface)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="15" height="15" viewBox="0 0 170 170" fill="currentColor">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.99-9.13-10.74-19.56-14.25-31.28-3.52-11.73-5.28-23.08-5.28-34.07 0-14.35 3.52-26.24 10.56-35.66 7.04-9.42 16.03-14.19 26.96-14.32 4.58 0 9.82 1.15 15.72 3.44 5.9 2.29 9.87 3.47 11.9 3.56 1.83 0 5.86-1.19 12.09-3.56 6.22-2.38 11.45-3.48 15.69-3.3 12.16.59 21.84 4.87 29.02 12.83-10.63 6.43-15.84 15.22-15.63 26.37.22 8.7 3.55 15.93 10 21.68 6.45 5.75 14.12 8.97 23.01 9.66-2.29 7.08-5.15 14.16-8.58 21.23zM119.22 33.64c0-7.39 2.65-14.25 7.96-20.59 5.3-6.33 11.83-10.23 19.59-11.7.92 7.17-1.39 14.1-6.93 20.8-5.54 6.7-12.42 10.74-20.62 11.49z"/>
              </svg>
              <span>macOS</span>
            </button>

            {/* Windows Pill */}
            <button
              type="button"
              onClick={() => setDownloadPlatform('windows')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '24px',
                border: downloadPlatform === 'windows' ? '1px solid #4da6ff' : '1px solid var(--border)',
                background: downloadPlatform === 'windows' ? 'var(--accent)' : 'var(--surface)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 2.222L6.5 1.333V7.5H0V2.222zm7.5-1.467L16 0v7.5H7.5V.755zM0 8.5h6.5v6.167L0 13.778V8.5zm7.5 0H16V16l-8.5-.755V8.5z"/>
              </svg>
              <span>Windows</span>
            </button>

            {/* Linux Pill */}
            <button
              type="button"
              onClick={() => setDownloadPlatform('linux')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '24px',
                border: downloadPlatform === 'linux' ? '1px solid #4da6ff' : '1px solid var(--border)',
                background: downloadPlatform === 'linux' ? 'var(--accent)' : 'var(--surface)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ fontSize: '15px' }}>🐧</span>
              <span>Linux</span>
            </button>

            {/* Googlebook Pill */}
            <button
              type="button"
              onClick={() => setDownloadPlatform('googlebook')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '24px',
                border: downloadPlatform === 'googlebook' ? '1px solid #4da6ff' : '1px solid var(--border)',
                background: downloadPlatform === 'googlebook' ? 'var(--accent)' : 'var(--surface)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              <span>Googlebook</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: ADIOS APP */}
        <div style={{ paddingTop: '28px', paddingBottom: '36px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#ffffff' }}>
              ADIOS App
            </h2>
            <span
              style={{
                background: 'rgba(0, 120, 212, 0.2)',
                color: '#4da6ff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              v2.0.0-alpha.1
            </span>
          </div>

          {/* Action Download Buttons matching screenshot: Download for x64 / Download for ARM64 */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            {downloadPlatform === 'windows' && (
              <>
                <a
                  href="/api/download"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
                >
                  Download for x64
                </a>
                <a
                  href="/api/download"
                  download
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-alt)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-alt)')}
                >
                  Download for ARM64
                </a>
              </>
            )}

            {downloadPlatform === 'macos' && (
              <>
                <a
                  href="/api/download?platform=mac-apple-silicon"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  Download for Apple Silicon (M1-M4)
                </a>
                <a
                  href="/api/download?platform=mac-intel"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-alt)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  Download for Intel x64
                </a>
              </>
            )}

            {downloadPlatform === 'linux' && (
              <>
                <a
                  href="/api/download?platform=linux-appimage"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  Download AppImage (.tar.gz)
                </a>
                <a
                  href="https://pypi.org/project/adios-manager/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--surface-alt)',
                    color: 'var(--text)',
                    border: '1px solid var(--border)',
                    padding: '12px 28px',
                    borderRadius: '24px',
                    fontSize: '14.5px',
                    fontWeight: 500,
                    textDecoration: 'none'
                  }}
                >
                  View on PyPI
                </a>
              </>
            )}

            {downloadPlatform === 'googlebook' && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.4)',
                    padding: '10px 20px',
                    borderRadius: '24px',
                    fontSize: '13.5px',
                    fontWeight: 500
                  }}
                >
                  ChromeOS / Linux Crostini Container Build Available
                </span>
              </div>
            )}
          </div>

          {/* Minimum Requirements */}
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            <div style={{ fontWeight: 500, color: 'var(--text)' }}>Minimum Requirements</div>
            <div>
              {downloadPlatform === 'windows' && 'Windows 10 (64-bit) or later · 4 GB RAM · 200 MB Disk space'}
              {downloadPlatform === 'macos' && 'macOS 12.0 Monterey or later · Apple Silicon or Intel 64-bit'}
              {downloadPlatform === 'linux' && 'glibc 2.28+ · Ubuntu 20.04+, Debian 11+, Fedora 34+, Arch'}
              {downloadPlatform === 'googlebook' && 'ChromeOS with Linux (Beta) developer mode activated'}
            </div>
          </div>
        </div>

        {/* SECTION 2: ADIOS CLI */}
        <div style={{ paddingTop: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#ffffff' }}>
              ADIOS CLI
            </h2>
            <span
              style={{
                background: 'rgba(0, 120, 212, 0.2)',
                color: '#4da6ff',
                fontSize: '12px',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'monospace'
              }}
            >
              v1.5.16
            </span>
          </div>

          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', marginBottom: '20px', fontWeight: 350, maxWidth: '680px' }}>
            A fast, headless command-line interface for headless servers, backup cronjobs, automated licensing, and database migration tasks.
          </p>

          {/* Terminal Code Snippet for Instant Installation */}
          <div
            style={{
              background: '#141416',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              maxWidth: '680px',
              marginBottom: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '13px', userSelect: 'none' }}>$</span>
              <code className="font-mono" style={{ color: '#4da6ff', fontSize: '13.5px' }}>
                curl -fsSL https://get.adios.dev/cli.sh | sh
              </code>
            </div>

            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText('curl -fsSL https://get.adios.dev/cli.sh | sh');
                setCopiedCliCommand(true);
                setTimeout(() => setCopiedCliCommand(false), 2000);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid var(--border)',
                color: '#ffffff',
                borderRadius: '4px',
                padding: '6px 12px',
                fontSize: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              {copiedCliCommand ? <Check size={13} style={{ color: 'var(--ok)' }} /> : <Copy size={13} />}
              <span>{copiedCliCommand ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Architecture Download Buttons for CLI binaries */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
            <a
              href="/api/download?type=cli&arch=x64"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--accent)',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: '24px',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Download for x64
            </a>
            <a
              href="/api/download?type=cli&arch=arm64"
              download
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--surface-alt)',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                padding: '10px 24px',
                borderRadius: '24px',
                fontSize: '13.5px',
                fontWeight: 500,
                textDecoration: 'none'
              }}
            >
              Download for ARM64
            </a>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            <span>Also available via Python package manager: </span>
            <code className="font-mono" style={{ background: 'var(--surface-alt)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: '4px', color: '#4da6ff' }}>
              pip install adios-cli
            </code>
          </div>
        </div>
      </section>

      {/* 8. ORIGINAL NATIVE FOOTER (Status-bar style with sitemap links) */}
      <footer style={{ background: '#181818', borderTop: '1px solid var(--border)', padding: '40px 6% 30px 6%', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '36px',
              marginBottom: '36px'
            }}
          >
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>Management Suites</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link href="/product/personal" className="ms-footer-link">Personal Manager</Link></li>
                <li><Link href="/product/hospital" className="ms-footer-link">Hospital HMS</Link></li>
                <li><Link href="/product/hotel" className="ms-footer-link">Hotel PMS</Link></li>
                <li><Link href="/product/billing" className="ms-footer-link">POS &amp; GST Billing</Link></li>
                <li><Link href="/product/academics" className="ms-footer-link">Academics Management</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>Store &amp; Licensing</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link href="/cart" className="ms-footer-link">Shopping Cart</Link></li>
                <li><a href="#pricing" className="ms-footer-link">Perpetual Pricing</a></li>
                <li><a href="#downloads" className="ms-footer-link">Windows Installer (.exe)</a></li>
                <li><a href="#downloads" className="ms-footer-link">Linux Package (PyPI)</a></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>Developer &amp; Community</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link href="/community" className="ms-footer-link">Alpha Feedback Forum</Link></li>
                <li><a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="ms-footer-link">GitHub Repository</a></li>
                <li><Link href="/admin" className="ms-footer-link">Admin Portal</Link></li>
                <li><Link href="/community" className="ms-footer-link">Release Notes &amp; Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff', marginBottom: '12px' }}>About ADIOS</div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px', fontWeight: 350 }}>
                High-performance offline desktop ecosystem engineered by Sayan Maity with compiled Qt 6 and local SQLite persistence.
              </p>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Engine Architecture: <b style={{ color: '#ffffff' }}>Qt 6.7 · Python 3.11 · SQLite 3</b>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                <Image src="/logo.png" alt="ADIOS Logo" width={20} height={20} style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                © 2026 ADIOS Software Ecosystem. All rights reserved.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '20px', fontSize: '12px' }}>
              <Link href="/privacy" className="ms-footer-link">Privacy Statement</Link>
              <Link href="/terms" className="ms-footer-link">Terms of Use</Link>
              <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="ms-footer-link">Source Code</a>
            </div>
          </div>
        </div>
      </footer>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '17px', color: '#ffffff' }}>
                {authMode === 'signin' ? 'Sign in' : authMode === 'tester' ? 'Join Alpha Testing' : 'Create Account'}
              </div>
              <button type="button" onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: '4px', padding: '2px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setAuthMode('signin')} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '3px', background: authMode === 'signin' ? 'var(--surface)' : 'transparent', color: '#ffffff', fontWeight: authMode === 'signin' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign in</button>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '3px', background: authMode === 'signup' ? 'var(--surface)' : 'transparent', color: '#ffffff', fontWeight: authMode === 'signup' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign up</button>
              <button type="button" onClick={() => setAuthMode('tester')} style={{ flex: 1, padding: '6px', border: 'none', borderRadius: '3px', background: authMode === 'tester' ? 'var(--surface)' : 'transparent', color: authMode === 'tester' ? '#4da6ff' : 'var(--text-muted)', fontWeight: authMode === 'tester' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Alpha Tester</button>
            </div>

            {authError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '8px 10px', borderRadius: '4px', fontSize: '12px', marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Full name</label>
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required placeholder="Sayan Maity" style={{ width: '100%', height: '36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: '#ffffff', padding: '0 10px', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email address</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="your.email@example.com" style={{ width: '100%', height: '36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: '#ffffff', padding: '0 10px', fontSize: '13px' }} />
              </div>
              {(authMode === 'signup' || authMode === 'tester') && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Phone number (optional)</label>
                  <input type="tel" value={authPhone} onChange={e => setAuthPhone(e.target.value)} placeholder="+91 9876543210" style={{ width: '100%', height: '36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: '#ffffff', padding: '0 10px', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Password</label>
                <input type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required style={{ width: '100%', height: '36px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: '#ffffff', padding: '0 10px', fontSize: '13px' }} />
              </div>
              <button type="submit" disabled={authLoading} className="ms-hero-btn" style={{ width: '100%', height: '38px', fontSize: '13.5px' }}>
                {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign in' : authMode === 'tester' ? 'Register as Tester' : 'Create account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER PROFILE MODAL */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '18px', color: '#ffffff' }}>User Account Profile</div>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: 'var(--surface-alt)', border: '1px solid var(--border)', borderRadius: '4px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>{user?.email}</div>
              {user?.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.phone}</div>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>Issued Product Keys</h4>
              {loadingProfile ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading license keys...</div>
              ) : profileData?.productKeys && profileData.productKeys.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileData.productKeys.map((k, i) => (
                    <div key={i} style={{ padding: '12px', border: '1px solid var(--border)', background: 'var(--bg)', borderRadius: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span>{k.plan}</span>
                        <span>{new Date(k.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <code className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#4da6ff' }}>
                          {revealedKeys[k.key] ? k.key : '••••••••••••••••••••'}
                        </code>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => toggleRevealKey(k.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4da6ff' }}>
                            {revealedKeys[k.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button type="button" onClick={() => handleCopyKey(k.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4da6ff' }}>
                            {copiedKey === k.key ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  No perpetual license keys registered yet.
                </div>
              )}
            </div>

            <button type="button" onClick={() => { setUser(null); setShowProfileModal(false); }} className="ms-secondary-btn" style={{ width: '100%', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
