'use client';

import React, { useState, useEffect } from 'react';
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

  // Cart & Pricing - Empty by default
  const [cart, setCart] = useState<string[]>([]);
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
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Auto slide interval for Hero
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroSlide(prev => (prev === 0 ? 1 : 0));
    }, 7000);
    return () => clearInterval(timer);
  }, []);

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
          height: '66px',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <span style={{ fontSize: '26px', fontWeight: 400, color: '#1a1429', fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                ADIOS
              </span>
            </Link>

            {/* Top Nav Menu matching Surface showcase styling */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: '26px' }} className="desktop-nav">
              <Link href="/product/personal" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
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
                    fontSize: '14px',
                    fontWeight: 450,
                    cursor: 'pointer'
                  }}
                >
                  <span>Suites</span>
                  <ChevronDown size={14} style={{ transform: suitesMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
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
                        borderRadius: '6px',
                        boxShadow: '0 10px 28px rgba(0,0,0,0.12)',
                        minWidth: '230px',
                        padding: '8px 0'
                      }}
                    >
                      <Link
                        href="/product/personal"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Image src="/suite-personal.png" alt="Personal" width={20} height={20} style={{ borderRadius: '4px' }} />
                        <span>Personal Manager</span>
                      </Link>
                      <Link
                        href="/product/hospital"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Image src="/suite-hospital.png" alt="Hospital" width={20} height={20} style={{ borderRadius: '4px' }} />
                        <span>Hospital HMS</span>
                      </Link>
                      <Link
                        href="/product/hotel"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Image src="/suite-hotel.png" alt="Hotel" width={20} height={20} style={{ borderRadius: '4px' }} />
                        <span>Hotel PMS</span>
                      </Link>
                      <Link
                        href="/product/billing"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Image src="/suite-billing.png" alt="POS & Billing" width={20} height={20} style={{ borderRadius: '4px' }} />
                        <span>POS &amp; GST Billing</span>
                      </Link>
                      <Link
                        href="/product/academics"
                        onClick={() => setSuitesMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 16px',
                          color: '#262626',
                          fontSize: '13px',
                          textDecoration: 'none'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f5f5f5')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Image src="/suite-academics.png" alt="Academics" width={20} height={20} style={{ borderRadius: '4px' }} />
                        <span>Academics</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Single small name for GST POS Billing -> POS */}
              <Link href="/product/billing" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                POS
              </Link>

              {/* Clean Pricing link pointing to pricing section */}
              <a href="#pricing" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Pricing
              </a>

              {/* Direct Link to About ADIOS Uniqueness Section */}
              <a href="#about" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                About ADIOS
              </a>

              {/* Direct Link to FAQs */}
              <a href="#faqs" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                FAQs
              </a>

              <a href="#downloads" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Downloads
              </a>
              <Link href="/community" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Community
              </Link>
            </nav>
          </div>

          {/* Right: All Suites dropdown, Search, Cart & Profile with First/Last Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <a href="#suites" style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontSize: '14px', color: '#262626', fontWeight: 450, textDecoration: 'none' }}>
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
                    fontSize: '14px',
                    color: '#262626'
                  }}
                >
                  <span>Search</span>
                  <Search size={16} />
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

      {/* 2. FULL-BLEED HERO SLIDER: PREVIOUS HERO + ALL-IN-ONE PACK SHOWCASE */}
      <section
        style={{
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Slider Track */}
        <div
          style={{
            display: 'flex',
            width: '200%',
            transform: `translateX(${activeHeroSlide === 0 ? '0%' : '-50%'})`,
            transition: 'transform 0.65s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* SLIDE 1: Original Artistic Showcase */}
          <div
            style={{
              width: '50%',
              minHeight: '620px',
              backgroundImage: 'url("/hero-bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center right',
              backgroundRepeat: 'no-repeat',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '56px 4% 72px 4%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 600px) 1fr',
                gap: '24px',
                alignItems: 'center'
              }}
            >
              <div
                style={{
                  maxWidth: '560px',
                  zIndex: 2,
                  background: 'rgba(255, 255, 255, 0.18)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  padding: '38px 40px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  boxShadow: '0 8px 32px rgba(107, 70, 193, 0.08)',
                  marginLeft: '0'
                }}
              >
                <h1
                  style={{
                    color: '#1a1429',
                    fontSize: 'clamp(34px, 4.2vw, 50px)',
                    fontWeight: 500,
                    lineHeight: 1.18,
                    letterSpacing: '-0.025em',
                    marginBottom: '16px'
                  }}
                >
                  Our most optimised management lineup
                </h1>

                <p
                  style={{
                    color: '#2c2242',
                    fontSize: '16.5px',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                    fontWeight: 350
                  }}
                >
                  Big ideas, busy operations, zero latency. ADIOS Personal, Hospital, Hotel, POS and Academics
                  are engineered offline-first with compiled C++/Qt performance and SQLite persistence.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <a href="#suites" className="ms-hero-btn">
                    Explore Suites
                  </a>

                  <a
                    href="/api/download"
                    download
                    className="ms-secondary-btn"
                    style={{ color: '#1a1429', fontWeight: 500, textDecoration: 'underline' }}
                  >
                    Download Desktop .exe
                  </a>
                </div>
              </div>

              <div style={{ minHeight: '440px' }} />
            </div>
          </div>

          {/* SLIDE 2: All-in-One Suite Pack Showcase */}
          <div
            style={{
              width: '50%',
              minHeight: '620px',
              background: 'linear-gradient(135deg, #f8f9fc 0%, #edf2f9 50%, #e2e8f0 100%)',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              padding: '56px 4% 72px 4%',
              boxSizing: 'border-box'
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: '1440px',
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 600px) minmax(320px, 1fr)',
                gap: '40px',
                alignItems: 'center'
              }}
            >
              {/* Left Column: Get The Pack Now */}
              <div
                style={{
                  zIndex: 2,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  padding: '40px 42px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 20px 40px rgba(0, 103, 184, 0.08)'
                }}
              >
                <h1
                  style={{
                    color: '#0f172a',
                    fontSize: 'clamp(34px, 4.2vw, 48px)',
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: '-0.025em',
                    marginBottom: '16px'
                  }}
                >
                  Get the complete <span style={{ fontFamily: 'var(--font-display)', color: '#0067b8' }}>ADIOS</span> pack now
                </h1>

                <p
                  style={{
                    color: '#475569',
                    fontSize: '16.5px',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                    fontWeight: 350
                  }}
                >
                  Empower your entire venture with all 5 flagship management suites: Personal, Hospital, Hotel, POS Billing, and Academics. Unified lifetime perpetual license with zero subscriptions.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                  <a
                    href="#suites"
                    className="ms-hero-btn"
                    style={{
                      padding: '12px 28px',
                      fontSize: '15px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      boxShadow: '0 8px 20px rgba(0, 103, 184, 0.25)'
                    }}
                  >
                    Get the Pack Now
                  </a>

                  <Link
                    href="/cart"
                    className="ms-secondary-btn"
                    style={{
                      color: '#0067b8',
                      fontWeight: 600,
                      fontSize: '14.5px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    View Bundle Pricing &rarr;
                  </Link>
                </div>
              </div>

              {/* Right Column: High Quality Suite Pack Artwork Showcase */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: '560px',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: '0 24px 50px rgba(15, 23, 42, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.8)'
                  }}
                >
                  <Image
                    src="/hero-suite-pack.jpg"
                    alt="ADIOS Complete Management Suite Pack"
                    width={1024}
                    height={576}
                    priority
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slide Navigation Dots & Arrows */}
        <div
          style={{
            position: 'absolute',
            bottom: '22px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(8px)',
            padding: '6px 14px',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.8)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveHeroSlide(0)}
            style={{
              width: activeHeroSlide === 0 ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              background: activeHeroSlide === 0 ? '#0067b8' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label="Go to slide 1"
          />
          <button
            type="button"
            onClick={() => setActiveHeroSlide(1)}
            style={{
              width: activeHeroSlide === 1 ? '28px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              background: activeHeroSlide === 1 ? '#0067b8' : '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            aria-label="Go to slide 2"
          />
        </div>
      </section>

      {/* QUICK NAV CATEGORY ICONS (Microsoft.com Surface row with modern 3D Suite App Logos) */}
      <section style={{ padding: '36px 6% 20px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: '32px' }}>
          <Link href="/product/personal" className="ms-quick-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/suite-personal.png" alt="Personal Manager" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span>Personal Manager</span>
          </Link>
          <Link href="/product/hospital" className="ms-quick-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/suite-hospital.png" alt="Hospital HMS" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span>Hospital HMS</span>
          </Link>
          <Link href="/product/hotel" className="ms-quick-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/suite-hotel.png" alt="Hotel PMS" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span>Hotel PMS</span>
          </Link>
          <Link href="/product/billing" className="ms-quick-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/suite-billing.png" alt="POS & GST Billing" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span>POS &amp; GST Billing</span>
          </Link>
          <Link href="/product/academics" className="ms-quick-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <Image src="/suite-academics.png" alt="Academics Suite" width={28} height={28} style={{ borderRadius: '6px' }} />
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
                <div>
                  {/* Top Suite App Logo & App Name Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                    {app.logo && (
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '6px',
                          flexShrink: 0
                        }}
                      >
                        <Image
                          src={app.logo}
                          alt={app.name}
                          width={32}
                          height={32}
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                        {app.name}
                      </div>
                    </div>
                  </div>

                  {/* Clean Headline */}
                  <h3 style={{ fontSize: '20px', color: '#0f172a', fontWeight: 600, lineHeight: 1.3, marginBottom: '14px' }}>
                    {app.shortDescription}
                  </h3>

                  {/* Brief Descriptive Copy */}
                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, fontWeight: 350, marginBottom: '24px' }}>
                    {app.description}
                  </p>
                </div>

                {/* Bottom Action Area */}
                <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                  <Link
                    href={`/product/${app.id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#0067b8',
                      fontSize: '14.5px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Learn more
                  </Link>
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
            About <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>ADIOS</span>: What Makes It Different
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
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '16px',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Main Image */}
                    <Image
                      src={story.image}
                      alt={story.title}
                      width={1280}
                      height={960}
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />

                    {/* Floating Badge Tag */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '16px',
                        left: '16px',
                        background: '#0f172a',
                        color: '#ffffff',
                        fontSize: '11px',
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '4px',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {story.badge}
                    </div>

                    {/* Quick Metric Bar */}
                    <div
                      style={{
                        padding: '16px 20px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '12px',
                        textAlign: 'center',
                        background: '#ffffff',
                        borderTop: '1px solid #f1f5f9'
                      }}
                    >
                      {story.metrics.map((m, mIdx) => (
                        <div key={mIdx}>
                          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{m.label}</div>
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

      {/* 7. DOWNLOAD ADIOS & CLI (IMMERSIVE BLUE THEME MATCHING REST OF WEBSITE) */}
      <section id="downloads" style={{ padding: '80px 6% 96px 6%', background: '#f8fafc', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', width: '100%' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          {/* Main Title matching clean modern style */}
          <div style={{ marginBottom: '44px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#e0f2fe', color: '#0284c7', padding: '4px 14px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
              <Download size={13} />
              <span>Official Binaries &amp; Runtime</span>
            </div>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(36px, 4.5vw, 54px)',
                fontWeight: 400,
                color: '#0f172a',
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
                marginBottom: '32px'
              }}
            >
              Download ADIOS
            </h2>

            {/* OS Platform Selector Rounded Pills */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              {/* macOS Pill */}
              <button
                type="button"
                onClick={() => setDownloadPlatform('macos')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '9px 24px',
                  borderRadius: '30px',
                  border: downloadPlatform === 'macos' ? '1.5px solid #0067b8' : '1px solid #cbd5e1',
                  background: downloadPlatform === 'macos' ? '#0067b8' : '#ffffff',
                  color: downloadPlatform === 'macos' ? '#ffffff' : '#334155',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: downloadPlatform === 'macos' ? '0 4px 14px rgba(0, 103, 184, 0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 170 170" fill="currentColor">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-5.99-9.13-10.74-19.56-14.25-31.28-3.52-11.73-5.28-23.08-5.28-34.07 0-14.35 3.52-26.24 10.56-35.66 7.04-9.42 16.03-14.19 26.96-14.32 4.58 0 9.82 1.15 15.72 3.44 5.9 2.29 9.87 3.47 11.9 3.56 1.83 0 5.86-1.19 12.09-3.56 6.22-2.38 11.45-3.48 15.69-3.3 12.16.59 21.84 4.87 29.02 12.83-10.63 6.43-15.84 15.22-15.63 26.37.22 8.7 3.55 15.93 10 21.68 6.45 5.75 14.12 8.97 23.01 9.66-2.29 7.08-5.15 14.16-8.58 21.23zM119.22 33.64c0-7.39 2.65-14.25 7.96-20.59 5.3-6.33 11.83-10.23 19.59-11.7.92 7.17-1.39 14.1-6.93 20.8-5.54 6.7-12.42 10.74-20.62 11.49z" />
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
                  gap: '9px',
                  padding: '9px 24px',
                  borderRadius: '30px',
                  border: downloadPlatform === 'windows' ? '1.5px solid #0067b8' : '1px solid #cbd5e1',
                  background: downloadPlatform === 'windows' ? '#0067b8' : '#ffffff',
                  color: downloadPlatform === 'windows' ? '#ffffff' : '#334155',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: downloadPlatform === 'windows' ? '0 4px 14px rgba(0, 103, 184, 0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M0 2.222L6.5 1.333V7.5H0V2.222zm7.5-1.467L16 0v7.5H7.5V.755zM0 8.5h6.5v6.167L0 13.778V8.5zm7.5 0H16V16l-8.5-.755V8.5z" />
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
                  gap: '9px',
                  padding: '9px 24px',
                  borderRadius: '30px',
                  border: downloadPlatform === 'linux' ? '1.5px solid #0067b8' : '1px solid #cbd5e1',
                  background: downloadPlatform === 'linux' ? '#0067b8' : '#ffffff',
                  color: downloadPlatform === 'linux' ? '#ffffff' : '#334155',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: downloadPlatform === 'linux' ? '0 4px 14px rgba(0, 103, 184, 0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
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
                  gap: '9px',
                  padding: '9px 24px',
                  borderRadius: '30px',
                  border: downloadPlatform === 'googlebook' ? '1.5px solid #0067b8' : '1px solid #cbd5e1',
                  background: downloadPlatform === 'googlebook' ? '#0067b8' : '#ffffff',
                  color: downloadPlatform === 'googlebook' ? '#ffffff' : '#334155',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  boxShadow: downloadPlatform === 'googlebook' ? '0 4px 14px rgba(0, 103, 184, 0.35)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                </svg>
                <span>Googlebook</span>
              </button>
            </div>
          </div>

          {/* SECTION 1: ADIOS APP CONTAINER */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '16px',
              padding: '40px',
              marginBottom: '36px',
              boxShadow: '0 10px 30px rgba(0, 103, 184, 0.07)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <h3 style={{ fontSize: '30px', fontWeight: 400, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  <span style={{ fontFamily: 'var(--font-display)' }}>ADIOS</span> App
                </h3>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#0067b8',
                    border: '1px solid #bfdbfe',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontFamily: 'monospace'
                  }}
                >
                  v2.0.0-alpha.1
                </span>
              </div>

              <div style={{ fontSize: '13.5px', color: '#0067b8', fontWeight: 500, background: '#eff6ff', padding: '4px 12px', borderRadius: '20px' }}>
                Native compiled desktop binary
              </div>
            </div>

            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '28px', fontWeight: 350, maxWidth: '780px' }}>
              Complete standalone desktop manager with full offline SQLite storage, zero-telemetry privacy, and compiled Qt 6 performance.
            </p>

            {/* Download Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '26px' }}>
              {downloadPlatform === 'windows' && (
                <>
                  <a
                    href="/api/download"
                    download
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#0067b8',
                      color: '#ffffff',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(0, 103, 184, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#005da6')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0067b8')}
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
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#e2e8f0';
                      e.currentTarget.style.borderColor = '#94a3b8';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#f1f5f9';
                      e.currentTarget.style.borderColor = '#cbd5e1';
                    }}
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
                      background: '#0067b8',
                      color: '#ffffff',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(0, 103, 184, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#005da6')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0067b8')}
                  >
                    Download for Apple Silicon (M1-M4)
                  </a>
                  <a
                    href="/api/download?platform=mac-intel"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
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
                      background: '#0067b8',
                      color: '#ffffff',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      boxShadow: '0 4px 14px rgba(0, 103, 184, 0.35)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#005da6')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0067b8')}
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
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      padding: '13px 32px',
                      borderRadius: '30px',
                      fontSize: '15px',
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
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe',
                      padding: '12px 24px',
                      borderRadius: '30px',
                      fontSize: '14.5px',
                      fontWeight: 500
                    }}
                  >
                    ChromeOS / Linux Crostini Container Build Available
                  </span>
                </div>
              )}
            </div>

            {/* Minimum Requirements */}
            <div style={{ fontSize: '13.5px', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '18px', lineHeight: 1.6 }}>
              <span style={{ color: '#0f172a', fontWeight: 600 }}>Minimum Requirements: </span>
              {downloadPlatform === 'windows' && 'Windows 10 (64-bit) or later · 4 GB RAM · 200 MB Disk space'}
              {downloadPlatform === 'macos' && 'macOS 12.0 Monterey or later · 4 GB RAM · Universal Apple Silicon / Intel'}
              {downloadPlatform === 'linux' && 'glibc 2.28+ · Ubuntu 20.04+, Debian 11+, Fedora 34+, Arch Linux'}
              {downloadPlatform === 'googlebook' && 'ChromeOS with Linux (Beta) environment enabled'}
            </div>
          </div>

          {/* SECTION 2: ADIOS CLI CONTAINER */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #bfdbfe',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 10px 30px rgba(0, 103, 184, 0.07)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <h3 style={{ fontSize: '30px', fontWeight: 400, color: '#0f172a', letterSpacing: '-0.02em' }}>
                  <span style={{ fontFamily: 'var(--font-display)' }}>ADIOS</span> CLI
                </h3>
                <span
                  style={{
                    background: '#eff6ff',
                    color: '#0067b8',
                    border: '1px solid #bfdbfe',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    padding: '3px 12px',
                    borderRadius: '20px',
                    fontFamily: 'monospace'
                  }}
                >
                  v1.5.16
                </span>
              </div>

              <div style={{ fontSize: '13.5px', color: '#0067b8', fontWeight: 500, background: '#eff6ff', padding: '4px 12px', borderRadius: '20px' }}>
                Headless command-line utility
              </div>
            </div>

            <p style={{ fontSize: '16px', color: '#475569', lineHeight: 1.6, marginBottom: '24px', fontWeight: 350, maxWidth: '780px' }}>
              A fast, headless command-line interface for headless servers, backup cronjobs, automated licensing, and database migration tasks.
            </p>

            {/* Terminal Code Snippet in Blue-tinted container */}
            <div
              style={{
                background: '#0f172a',
                borderRadius: '10px',
                padding: '18px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                maxWidth: '780px',
                marginBottom: '26px',
                border: '1px solid #1e293b',
                boxShadow: '0 6px 20px rgba(15, 23, 42, 0.25)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflowX: 'auto' }}>
                <span style={{ color: '#38bdf8', fontSize: '15px', userSelect: 'none' }}>$</span>
                <code className="font-mono" style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 500 }}>
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
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.25)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.15)')}
              >
                {copiedCliCommand ? <Check size={14} style={{ color: '#4ade80' }} /> : <Copy size={14} />}
                <span>{copiedCliCommand ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Architecture Download Buttons for CLI binaries */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px' }}>
              <a
                href="/api/download?type=cli&arch=x64"
                download
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#0067b8',
                  color: '#ffffff',
                  padding: '11px 26px',
                  borderRadius: '30px',
                  fontSize: '14.5px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(0, 103, 184, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#005da6')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0067b8')}
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
                  background: '#f1f5f9',
                  color: '#1e293b',
                  border: '1px solid #cbd5e1',
                  padding: '11px 26px',
                  borderRadius: '30px',
                  fontSize: '14.5px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#e2e8f0';
                  e.currentTarget.style.borderColor = '#94a3b8';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
              >
                Download for ARM64
              </a>
            </div>

            <div style={{ fontSize: '13.5px', color: '#64748b' }}>
              <span>Also available via Python package manager: </span>
              <code className="font-mono" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '4px', color: '#0369a1', fontWeight: 500 }}>
                pip install adios-cli
              </code>
            </div>
          </div>
        </div>
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
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#262626', marginBottom: '14px' }}>
                About <span style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>ADIOS</span>
              </div>
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
