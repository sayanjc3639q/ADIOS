'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, ShieldCheck, Zap, Sparkles, Building2, GraduationCap, Code2, Users, Download, HelpCircle } from 'lucide-react';
import { SUITE_APPS } from '../lib/suites';

export default function PricingPage() {
  const [selectedCategory, setSelectedCategory] = useState<'standard' | 'special'>('standard');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Top Header */}
      <header
        style={{
          height: '66px',
          background: '#ffffff',
          borderBottom: '1px solid #e6e6e6',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6%',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ width: '100%', maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0067b8', fontSize: '13.5px', fontWeight: 500 }}>
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </Link>
            <span style={{ color: '#c7c7c7' }}>|</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#1a1429', letterSpacing: '0.02em' }}>
              ADIOS
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Plans &amp; Licensing</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/cart" className="ms-secondary-btn" style={{ fontSize: '13.5px' }}>
              Cart &amp; Checkout
            </Link>
            <Link href="/api/download" download className="ms-hero-btn" style={{ padding: '7px 18px', fontSize: '13px', borderRadius: '4px' }}>
              Free Download
            </Link>
          </div>
        </div>
      </header>

      {/* Main Pricing Hero */}
      <main style={{ flex: 1, padding: '56px 6% 96px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        {/* Title & Tagline */}
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 48px auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eff6ff', color: '#0067b8', border: '1px solid #bfdbfe', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '16px' }}>
            <Sparkles size={13} />
            <span>100% Perpetual • Zero Monthly Subscriptions</span>
          </div>
          <h1
            style={{
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 600,
              color: '#0f172a',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '18px'
            }}
          >
            Predictable, honest pricing for everyone
          </h1>
          <p style={{ fontSize: '17px', color: '#475569', lineHeight: 1.6, fontWeight: 350 }}>
            Buy once, own forever on your own physical computer. No cloud outages, no vendor surveillance, and never a monthly bill.
          </p>

          {/* Category Toggle Tabs */}
          <div style={{ display: 'inline-flex', padding: '4px', background: '#f1f5f9', borderRadius: '30px', border: '1px solid #e2e8f0', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => setSelectedCategory('standard')}
              style={{
                padding: '8px 24px',
                borderRadius: '24px',
                border: 'none',
                background: selectedCategory === 'standard' ? '#ffffff' : 'transparent',
                color: selectedCategory === 'standard' ? '#0f172a' : '#64748b',
                fontWeight: selectedCategory === 'standard' ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: selectedCategory === 'standard' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Standard Editions (Free, Personal, Business, Enterprise)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory('special')}
              style={{
                padding: '8px 24px',
                borderRadius: '24px',
                border: 'none',
                background: selectedCategory === 'special' ? '#ffffff' : 'transparent',
                color: selectedCategory === 'special' ? '#0f172a' : '#64748b',
                fontWeight: selectedCategory === 'special' ? 600 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: selectedCategory === 'special' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              Student or Developer
            </button>
          </div>
        </div>

        {/* 1. STANDARD TIERS (Free, Personal, Business, Enterprise) */}
        {selectedCategory === 'standard' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
              gap: '24px',
              marginBottom: '64px'
            }}
          >
            {/* TIER 1: FREE */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Community
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Free Edition
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px', minHeight: '42px' }}>
                  Complete offline utility for everyday individual use with zero licensing fee.
                </p>

                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '38px', fontWeight: 700, color: '#0f172a' }}>₹0</span>
                  <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '6px' }}>/ forever</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Included Capabilities:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Full SQLite local database</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Single-workstation execution</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Manual JSON &amp; CSV export</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Public open-source core</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/api/download"
                download
                className="ms-secondary-btn"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Download Community
              </Link>
            </div>

            {/* TIER 2: PERSONAL */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #0067b8',
                borderRadius: '16px',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 12px 30px rgba(0, 103, 184, 0.08)',
                position: 'relative'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#0067b8',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  padding: '3px 12px',
                  borderRadius: '12px'
                }}
              >
                Most Popular
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0067b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Individual Pro
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Personal Pro
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px', minHeight: '42px' }}>
                  For power users, investors and students managing finances, tasks and schedules.
                </p>

                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '38px', fontWeight: 700, color: '#0f172a' }}>₹499</span>
                  <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '6px' }}>one-time key</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Everything in Free, plus:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Automated hot background backups</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Full financial cash-flow &amp; report PDF generation</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Encrypted multi-device sync access</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Priority updates &amp; support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/cart?add=personal"
                className="ms-hero-btn"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Buy Personal Key
              </Link>
            </div>

            {/* TIER 3: BUSINESS */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Commercial
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Business Suite
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px', minHeight: '42px' }}>
                  Hospital HMS, Hotel PMS, Retail POS, or Academics ERP for multi-counter operations.
                </p>

                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '38px', fontWeight: 700, color: '#0f172a' }}>₹999</span>
                  <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '6px' }}>/ suite perpetual</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Business Superpowers:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Commercial GST &amp; thermal receipt printing</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Local LAN multi-workstation networking</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Hardware integration (barcodes, card encoders)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>1-year complimentary version updates</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/cart?add=hospital"
                className="ms-secondary-btn"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Choose Business Suite
              </Link>
            </div>

            {/* TIER 4: ENTERPRISE */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Full Ecosystem
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Enterprise All-Pack
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, marginBottom: '24px', minHeight: '42px' }}>
                  Complete unlimited pack containing all 5 management suites for enterprise institutions.
                </p>

                <div style={{ marginBottom: '28px' }}>
                  <span style={{ fontSize: '38px', fontWeight: 700, color: '#0f172a' }}>₹2,999</span>
                  <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '6px' }}>all 5 suites</span>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                    Enterprise Advantages:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13.5px', color: '#334155' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>All 5 Suites bundled (Personal, Hosp, Hotel, POS, Acad)</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Unlimited multi-seat LAN workstations</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Custom SQL schema migration assistance</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Check size={16} color="#107c10" />
                      <span>Direct developer line &amp; SLA support</span>
                    </li>
                  </ul>
                </div>
              </div>

              <Link
                href="/cart"
                className="ms-secondary-btn"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '8px',
                  border: '1px solid #0067b8',
                  color: '#0067b8',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Configure Enterprise Pack
              </Link>
            </div>
          </div>
        )}

        {/* 2. STUDENT OR DEVELOPER */}
        {selectedCategory === 'special' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '32px',
              maxWidth: '960px',
              margin: '0 auto 64px auto'
            }}
          >
            {/* SPECIAL CASE 1: STUDENTS */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #10b981',
                borderRadius: '16px',
                padding: '40px 32px',
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.08)'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', color: '#059669', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '14px' }}>
                <GraduationCap size={14} />
                <span>Academic Verification</span>
              </div>

              <h3 style={{ fontSize: '26px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Student &amp; Educator Grant
              </h3>
              <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                We believe students shouldn't have to choose between their education and software subscriptions. Any student with an active institutional ID gets full access.
              </p>

              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, color: '#059669' }}>Free</span>
                <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '8px' }}>/ with student email verification</span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '28px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                  What Students Receive:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>Complimentary ADIOS Personal Pro lifetime key</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>Exams tracker, study planner, and syllabus progress tracker</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>No ads, zero telemetry, and 100% offline study privacy</span>
                  </li>
                </ul>
              </div>

              <Link
                href="/community"
                className="ms-hero-btn"
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#059669',
                  borderRadius: '8px',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Claim Student License
              </Link>
            </div>

            {/* SPECIAL CASE 2: DEVELOPERS & OPEN SOURCE */}
            <div
              style={{
                background: '#ffffff',
                border: '1.5px solid #6366f1',
                borderRadius: '16px',
                padding: '40px 32px',
                boxShadow: '0 12px 30px rgba(99, 102, 241, 0.08)'
              }}
            >
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '14px' }}>
                <Code2 size={14} />
                <span>Community &amp; Open Source</span>
              </div>

              <h3 style={{ fontSize: '26px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                Open-Source Developers
              </h3>
              <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: 1.6, marginBottom: '24px' }}>
                Contributors, open-source maintainers, and CLI hackers are the backbone of our sovereign ecosystem. Compile from source or request a developer license.
              </p>

              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, color: '#4f46e5' }}>Free</span>
                <span style={{ fontSize: '14px', color: '#64748b', marginLeft: '8px' }}>/ for verified contributors</span>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', marginBottom: '28px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Developer Perks:
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', color: '#334155' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>Free developer access keys for plugin and schema authoring</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>Direct access to ADIOS C++/Qt and Python core repositories</span>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Check size={16} color="#107c10" />
                    <span>CLI toolchain &amp; automated database headless integration</span>
                  </li>
                </ul>
              </div>

              <a
                href="https://github.com/sayanjc3639q/ADIOS"
                target="_blank"
                rel="noopener noreferrer"
                className="ms-hero-btn"
                style={{
                  width: '100%',
                  height: '44px',
                  background: '#4f46e5',
                  borderRadius: '8px',
                  fontWeight: 600,
                  justifyContent: 'center',
                  textDecoration: 'none'
                }}
              >
                Inspect GitHub &amp; Contribute
              </a>
            </div>
          </div>
        )}

        {/* Feature Matrix Table */}
        <section style={{ maxWidth: '1080px', margin: '40px auto 0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Detailed Tier Comparison
            </h2>
            <p style={{ fontSize: '15px', color: '#64748b' }}>
              Transparent feature-by-feature breakdown across every edition.
            </p>
          </div>

          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#ffffff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>Feature &amp; Specification</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>Free</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: '#0067b8' }}>Personal</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>Business</th>
                  <th style={{ padding: '16px 20px', textAlign: 'center', fontWeight: 600, color: '#78248c' }}>Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Offline SQLite Persistence</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Perpetual Lifetime Ownership</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Zero Telemetry / Surveillance</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Hot Automated Background Backups</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Thermal &amp; Commercial GST Invoicing</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Local Multi-Workstation LAN Network</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
                <tr>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>Hardware Scanners &amp; Keycard Encoders</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#94a3b8' }}>—</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                  <td style={{ textAlign: 'center', color: '#107c10', fontWeight: 600 }}>✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '36px 6%', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        <p>© 2026 ADIOS Software Ecosystem. Built for permanent ownership.</p>
      </footer>
    </div>
  );
}
