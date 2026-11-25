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
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
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
              <span style={{ fontSize: '18px', fontWeight: 600, color: '#1a1429', letterSpacing: '-0.02em' }}>
                ADIOS
              </span>
            </Link>

            {/* Top Nav Menu matching Surface showcase styling */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '22px' }} className="desktop-nav">
              <Link href="/product/personal" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
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
                    color: '#262626',
                    fontSize: '13px',
                    fontWeight: 450,
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
                      paddingTop: '8px',
                      zIndex: 150
                    }}
                  >
                    <div
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e6e6e6',
                        borderRadius: '4px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
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
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
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
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
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
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        Academics
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Single small name for GST POS Billing -> POS */}
              <Link href="/product/billing" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                POS
              </Link>

              {/* Clean Pricing link pointing to pricing section */}
              <a href="#pricing" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                Pricing
              </a>

              {/* Direct Link to About ADIOS Uniqueness Section */}
              <a href="#about" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                About ADIOS
              </a>

              {/* Direct Link to FAQs */}
              <a href="#faqs" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                FAQs
              </a>

              <a href="#downloads" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                Downloads
              </a>
              <Link href="/community" style={{ color: '#262626', fontSize: '13px', fontWeight: 450 }}>
                Community
              </Link>
            </nav>
          </div>

          {/* Right: All Suites dropdown, Search, Cart & Profile with First/Last Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <a href="#suites" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '13px', color: '#262626', fontWeight: 450, textDecoration: 'none' }}>
              <span>All Suites</span>
              <ChevronDown size={14} />
            </a>

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
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#737373', display: 'flex' }}
                  >
                    <X size={16} />
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
                    color: '#262626'
                  }}
                >
                  <span>Search</span>
                  <Search size={15} />
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
                    background: '#ffffff',
                    border: '1px solid #e6e6e6',
                    borderRadius: '4px',
                    boxShadow: '0 12px 28px rgba(0,0,0,0.14)',
                    zIndex: 200,
                    maxHeight: '340px',
                    overflowY: 'auto'
                  }}
                >
                  <div style={{ padding: '8px 12px', fontSize: '11px', textTransform: 'uppercase', color: '#737373', borderBottom: '1px solid #f2f2f2', fontWeight: 600 }}>
                    Matching Products ({filteredProducts.length})
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: '16px', fontSize: '13px', color: '#737373', textAlign: 'center' }}>
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
                          borderBottom: '1px solid #f7f7f7',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9f9f9')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ fontSize: '13.5px', fontWeight: 500, color: '#262626' }}>{prod.name}</div>
                        <div style={{ fontSize: '11.5px', color: '#737373', marginTop: '2px' }}>₹{prod.price.toLocaleString('en-IN')} · {prod.category}</div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Cart Link leading directly to /cart */}
            <Link
              href="/cart"
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
            </Link>

            {/* Profile Section: Profile Icon or First + Last Name */}
            {user ? (
              <div
                onClick={handleOpenProfile}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #e6e6e6',
                  background: '#f9f9f9'
                }}
                title={`Signed in as ${user.name}`}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#0067b8',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <User size={13} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}>
                  {user.name}
                </span>
              </div>
            ) : (
              <div
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #8a8886',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#262626',
                  cursor: 'pointer',
                  background: '#ffffff',
                  transition: 'background 0.15s ease'
                }}
                title="Sign in to ADIOS"
                onMouseEnter={e => (e.currentTarget.style.background = '#f2f2f2')}
                onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
              >
                <User size={15} />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. FULL-BLEED HERO: SURFACE SHOWCASE WITH THIN ELEGANT FONTS */}
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
                  fontWeight: 500,
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
                fontWeight: 400,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
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
                lineHeight: 1.55,
                marginBottom: '28px',
                fontWeight: 350
              }}
            >
              Big ideas, busy operations, zero latency. ADIOS Personal, Hospital, Hotel, POS and Academics
              are engineered offline-first with compiled C++/Qt performance and SQLite persistence.
            </p>

            {/* "Explore Suites" Primary Button */}
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

              {/* Floating Architecture Badge */}
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
                <div style={{ width: '18px', height: '18px', borderRadius: '3px', background: '#0067b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                  A
                </div>
                <div>
                  <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9d91b8' }}>ENGINE ARCHITECTURE</div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>Qt 6 · Offline SQLite</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK NAV CATEGORY ICONS (Microsoft.com Surface row) */}
      <section style={{ padding: '36px 6% 20px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
          <Link href="/product/personal" className="ms-quick-link">
            <Cpu size={22} />
            <span>Personal Manager</span>
          </Link>
          <Link href="/product/hospital" className="ms-quick-link">
            <Building2 size={22} />
            <span>Hospital HMS</span>
          </Link>
          <Link href="/product/hotel" className="ms-quick-link">
            <Hotel size={22} />
            <span>Hotel PMS</span>
          </Link>
          <Link href="/product/billing" className="ms-quick-link">
            <Receipt size={22} />
            <span>POS &amp; GST Billing</span>
          </Link>
          <Link href="/product/academics" className="ms-quick-link">
            <GraduationCap size={22} />
            <span>Academics Suite</span>
          </Link>
        </div>
      </section>

      {/* 3. PRODUCT SHOWCASE SECTION (EXACT MICROSOFT STORE 4-COLUMN CARDS) */}
      <section id="suites" style={{ padding: '40px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ marginBottom: '36px' }}>
          <h2 style={{ fontSize: '28px', color: '#262626', marginBottom: '8px', fontWeight: 400 }}>
            Featured Management Suites
          </h2>
          <p style={{ fontSize: '15px', color: '#505050', fontWeight: 350 }}>
            Purpose-built native applications engineered with compiled Qt performance and zero cloud lock-in.
          </p>
        </div>

        {/* 4-to-5 Column Product Cards Grid matching the uploaded image */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '28px'
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
                <div style={{ position: 'relative', width: '100%', height: '170px', background: '#f5f5f5', overflow: 'hidden' }}>
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
                      background: app.status === 'available' ? '#107c10' : '#78248c',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 500,
                      padding: '3px 8px',
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
                    <h3 style={{ fontSize: '18px', color: '#262626', fontWeight: 450, marginBottom: '8px' }}>
                      {app.name}
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#505050', lineHeight: 1.5, marginBottom: '16px', fontWeight: 350 }}>
                      {app.shortDescription}
                    </p>

                    <div style={{ fontSize: '12.5px', color: '#737373', marginBottom: '18px' }}>
                      Perpetual license: <b style={{ color: '#262626', fontWeight: 600 }}>₹{app.price.toLocaleString('en-IN')}</b>
                    </div>
                  </div>

                  {/* Button Action Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '12px', borderTop: '1px solid #f2f2f2' }}>
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
                      className={inCart ? 'ms-secondary-btn' : 'ms-secondary-btn'}
                      style={{
                        height: '36px',
                        padding: '0 12px',
                        fontSize: '12.5px',
                        border: '1px solid #e6e6e6',
                        color: inCart ? '#107c10' : '#0067b8',
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

      {/* 4. ABOUT ADIOS & ITS UNIQUENESS (ALTERNATING IMAGE + STORY LAYOUT) */}
      <section id="about" style={{ padding: '40px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%', borderTop: '1px solid #e6e6e6' }}>
        <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 64px auto' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78248c', fontWeight: 600, marginBottom: '8px' }}>
            ENGINEERING PHILOSOPHY
          </div>
          <h2 style={{ fontSize: '32px', color: '#1a1429', fontWeight: 400, marginBottom: '16px', lineHeight: 1.2 }}>
            About ADIOS: What Makes It Different
          </h2>
          <p style={{ fontSize: '16px', color: '#505050', lineHeight: 1.6, fontWeight: 350 }}>
            In an industry obsessed with forced cloud subscriptions, recurring micro-transactions, and latency-ridden web apps,
            ADIOS returns computing power to the physical device on your desk.
          </p>
        </div>

        {/* Alternating Story Blocks (Image left / Text right, then reversed) */}
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
                      background: '#f8f8fa',
                      border: '1px solid #e6e6e6',
                      borderRadius: '8px',
                      padding: '24px',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.06)',
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
                        border: '1px solid rgba(0,0,0,0.08)'
                      }}
                    />

                    {/* Floating Badge Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: '#1a1429',
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
                        borderTop: '1px solid #ebebeb',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        textAlign: 'center'
                      }}
                    >
                      {story.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <div style={{ fontSize: '11px', color: '#737373', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
                          <div className="font-mono" style={{ fontSize: '16px', fontWeight: 600, color: '#0067b8', marginTop: '2px' }}>{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Narrative / Description Content */}
                <div style={{ order: isReversed ? 1 : 2 }}>
                  <div style={{ fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0067b8', fontWeight: 600, marginBottom: '10px' }}>
                    {story.tag}
                  </div>

                  <h3 style={{ fontSize: '26px', color: '#1a1429', fontWeight: 400, lineHeight: 1.25, marginBottom: '16px' }}>
                    {story.title}
                  </h3>

                  <p style={{ fontSize: '15px', color: '#505050', lineHeight: 1.6, fontWeight: 350, marginBottom: '24px' }}>
                    {story.description}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                    {story.points.map((pt, pIdx) => (
                      <div key={pIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#262626' }}>
                        <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dff6dd', color: '#107c10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                          <Check size={12} />
                        </div>
                        <span style={{ fontWeight: 350 }}>{pt}</span>
                      </div>
                    ))}
                  </div>

                  <Link href="#pricing" className="ms-secondary-btn" style={{ padding: '0', color: '#0067b8', fontWeight: 500, fontSize: '14px' }}>
                    Explore Perpetual Pricing →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQS) ACCORDION */}
      <section id="faqs" style={{ padding: '60px 6% 60px 6%', maxWidth: '1000px', margin: '0 auto', width: '100%', borderTop: '1px solid #e6e6e6' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0067b8', fontWeight: 600, marginBottom: '8px' }}>
            TRANSPARENT ANSWERS
          </div>
          <h2 style={{ fontSize: '30px', color: '#262626', fontWeight: 400, marginBottom: '12px' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ fontSize: '15px', color: '#505050', fontWeight: 350 }}>
            Everything you need to know about ADIOS architecture, offline SQLite data storage, and perpetual software licenses.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={index}
                style={{
                  border: '1px solid #e6e6e6',
                  borderRadius: '6px',
                  background: isOpen ? '#fafafa' : '#ffffff',
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
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#737373', letterSpacing: '0.04em', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      {faq.category}
                    </span>
                    <span style={{ fontSize: '16px', color: '#262626', fontWeight: 450 }}>
                      {faq.question}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? '#0067b8' : '#737373',
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </button>

                {isOpen && (
                  <div style={{ padding: '0 24px 22px 24px', color: '#505050', fontSize: '14.5px', lineHeight: 1.6, fontWeight: 350, borderTop: '1px solid #f2f2f2', paddingTop: '16px' }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '36px', textAlign: 'center', fontSize: '13.5px', color: '#737373' }}>
          Have more questions? Join the discussion on our{' '}
          <Link href="/community" style={{ color: '#0067b8', fontWeight: 500 }}>
            Community Forum
          </Link>{' '}
          or inspect the open architecture on{' '}
          <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" style={{ color: '#0067b8', fontWeight: 500 }}>
            GitHub
          </a>.
        </div>
      </section>

      {/* 6. PERPETUAL LICENSING & CART PREVIEW */}
      <section id="pricing" style={{ padding: '20px 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
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
            <h2 style={{ fontSize: '24px', marginBottom: '8px', fontWeight: 400 }}>
              Perpetual Licensing Philosophy
            </h2>
            <p style={{ fontSize: '14.5px', color: '#505050', marginBottom: '20px', fontWeight: 350 }}>
              Unlike recurring SaaS subscription models, ADIOS is built on genuine perpetual software ownership.
              Your software runs offline on your own hardware forever.
            </p>

            <table style={{ width: '100%', background: '#ffffff', border: '1px solid #e6e6e6', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f2f2f2' }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Capability</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Community Free</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Lifetime License</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>All core modules &amp; features</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>Local SQLite database storage</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px', borderBottom: '1px solid #f2f2f2' }}>Custom directory backups</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 14px' }}>Multi-device encrypted cloud sync</td>
                  <td style={{ textAlign: 'center', color: '#a19f9d' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 500 }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Cart Summary Box with link to dedicated /cart */}
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '17px', fontWeight: 500, color: '#262626' }}>Selected Suite Cart</div>
              <span style={{ fontSize: '12px', background: '#eff6fc', color: '#0067b8', padding: '2px 8px', fontWeight: 500 }}>
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
                      <div style={{ fontWeight: 500 }}>{item.name}</div>
                      <div className="font-mono" style={{ fontSize: '11px', color: '#737373' }}>Prefix: {item.keyPrefix}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="font-mono" style={{ fontWeight: 500 }}>₹{item.price.toLocaleString('en-IN')}</span>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600, borderTop: '1px dashed #dcdcdc', paddingTop: '8px', marginTop: '4px' }}>
                  <span>Total:</span>
                  <span className="font-mono" style={{ color: '#0067b8' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}

            {/* Exactly says "Checkout" per instruction */}
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

      {/* 7. DOWNLOADS TABLE */}
      <section id="downloads" style={{ padding: '0 6% 60px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px', fontWeight: 400 }}>Downloads &amp; Runtime</h2>
        <table style={{ width: '100%', border: '1px solid #e6e6e6', borderCollapse: 'collapse', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ background: '#f2f2f2' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Platform</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Architecture</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Channel</th>
              <th style={{ padding: '10px 14px', textAlign: 'right', borderBottom: '1px solid #e6e6e6', fontWeight: 500 }}>Get it</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2' }}><b>Windows</b></td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2' }}>Windows 10 / 11 (64-bit)</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2', color: '#107c10', fontWeight: 500 }}>Available (v2.0.0-alpha.1)</td>
              <td style={{ padding: '12px 14px', borderBottom: '1px solid #f2f2f2', textAlign: 'right' }}>
                <a href="/api/download" download className="ms-hero-btn" style={{ height: '30px', padding: '0 12px', fontSize: '12.5px' }}>
                  Download .exe
                </a>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 14px' }}><b>Linux</b></td>
              <td style={{ padding: '12px 14px' }}>Ubuntu, Debian, Fedora, Arch</td>
              <td style={{ padding: '12px 14px', color: '#107c10', fontWeight: 500 }}>Available (PyPI)</td>
              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                <code className="font-mono" style={{ background: '#f2f2f2', padding: '4px 8px', fontSize: '12px' }}>pip install adios-manager</code>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 8. REDESIGNED PROFESSIONAL MICROSOFT-GRADE FOOTER */}
      <footer style={{ background: '#f2f2f2', borderTop: '1px solid #e6e6e6', padding: '48px 6% 36px 6%', fontSize: '13px', color: '#616161' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Multi-column sitemap matching Microsoft footer */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '36px',
              marginBottom: '44px'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '14px' }}>Management Suites</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/product/personal" className="ms-footer-link">Personal Manager</Link></li>
                <li><Link href="/product/hospital" className="ms-footer-link">Hospital HMS</Link></li>
                <li><Link href="/product/hotel" className="ms-footer-link">Hotel PMS</Link></li>
                <li><Link href="/product/billing" className="ms-footer-link">POS &amp; GST Billing</Link></li>
                <li><Link href="/product/academics" className="ms-footer-link">Academics Management</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '14px' }}>Store &amp; Licensing</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/cart" className="ms-footer-link">Shopping Cart</Link></li>
                <li><a href="#pricing" className="ms-footer-link">Perpetual Pricing</a></li>
                <li><a href="#downloads" className="ms-footer-link">Windows Installer (.exe)</a></li>
                <li><a href="#downloads" className="ms-footer-link">Linux Package (PyPI)</a></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '14px' }}>Developer &amp; Community</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <li><Link href="/community" className="ms-footer-link">Alpha Feedback Forum</Link></li>
                <li><a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="ms-footer-link">GitHub Repository</a></li>
                <li><Link href="/admin" className="ms-footer-link">Admin Portal</Link></li>
                <li><Link href="/community" className="ms-footer-link">Release Notes &amp; Roadmap</Link></li>
              </ul>
            </div>

            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '14px' }}>About ADIOS</div>
              <p style={{ fontSize: '12.5px', color: '#616161', lineHeight: 1.6, marginBottom: '12px', fontWeight: 350 }}>
                High-performance offline desktop ecosystem engineered by Sayan Maity with compiled Qt 6 and local SQLite persistence.
              </p>
              <div style={{ fontSize: '12px', color: '#737373' }}>
                Engine Architecture: <b>Qt 6.7 · Python 3.11 · SQLite 3</b>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '24px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                <Image src="/logo.png" alt="ADIOS Logo" width={20} height={20} style={{ objectFit: 'contain' }} />
              </div>
              <span style={{ fontSize: '12px', color: '#616161' }}>
                © 2026 ADIOS Software Ecosystem. All rights reserved.
              </span>
            </div>

            <div style={{ display: 'flex', gap: '24px', fontSize: '12px' }}>
              <Link href="/privacy" className="ms-footer-link">Privacy Statement</Link>
              <Link href="/terms" className="ms-footer-link">Terms of Use</Link>
              <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="ms-footer-link">Source Code</a>
            </div>
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

      {/* USER PROFILE MODAL */}
      {showProfileModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '28px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontWeight: 600, fontSize: '18px' }}>User Account Profile</div>
              <button type="button" onClick={() => setShowProfileModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ marginBottom: '20px', padding: '16px', background: '#f7f7f7', border: '1px solid #e6e6e6' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#262626' }}>{user?.name}</div>
              <div style={{ fontSize: '13px', color: '#505050', marginTop: '2px' }}>{user?.email}</div>
              {user?.phone && <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>{user.phone}</div>}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>Issued Product Keys</h4>
              {loadingProfile ? (
                <div style={{ fontSize: '13px', color: '#737373' }}>Loading license keys...</div>
              ) : profileData?.productKeys && profileData.productKeys.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {profileData.productKeys.map((k, i) => (
                    <div key={i} style={{ padding: '10px', border: '1px solid #e6e6e6', background: '#ffffff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#737373', marginBottom: '4px' }}>
                        <span>{k.plan}</span>
                        <span>{new Date(k.issuedAt).toLocaleDateString()}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <code className="font-mono" style={{ fontSize: '13px', fontWeight: 600 }}>
                          {revealedKeys[k.key] ? k.key : '••••••••••••••••••••'}
                        </code>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button type="button" onClick={() => toggleRevealKey(k.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0067b8' }}>
                            {revealedKeys[k.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <button type="button" onClick={() => handleCopyKey(k.key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0067b8' }}>
                            {copiedKey === k.key ? <Check size={15} /> : <Copy size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '13px', color: '#737373', fontStyle: 'italic' }}>
                  No perpetual license keys registered yet.
                </div>
              )}
            </div>

            <button type="button" onClick={() => { setUser(null); setShowProfileModal(false); }} className="ms-secondary-btn" style={{ width: '100%', color: '#d83b01' }}>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
