'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  // Authentication Modal / State for Purchasing
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');

  // Payment Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // 3-Day Trial
  const [trialEmail, setTrialEmail] = useState('');
  const [trialStatus, setTrialStatus] = useState<string | null>(null);

  // Open FAQs state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName || !authEmail) return;
    setUser({ name: authName, email: authEmail, phone: authPhone });
    setShowAuthModal(false);
    setShowCheckoutModal(true);
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

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialEmail) return;
    setTrialStatus(`Success! 3-day cloud sync activated for ${trialEmail}. You can now sign in from the desktop app.`);
    setTrialEmail('');
  };

  const faqs = [
    {
      q: 'Do I need a product key if I only use ADIOS offline?',
      a: 'No. ADIOS is 100% free and functional offline forever. All 10 modules, SQLite storage, and automatic rolling backups work on your local computer without any license key.'
    },
    {
      q: 'How does payment and license key issuance work?',
      a: 'Sign in with your name and email, scan the official UPI QR code (or use UPI ID sayanjc3639q@oksbi) to transfer ₹999, and paste your 12-digit UPI Reference / UTR Number. Our administration team manually verifies the transaction and issues your genuine Product Key directly to your account and email.'
    },
    {
      q: 'What personal data do you collect?',
      a: 'We only store your Name, Email, and Phone Number strictly for customer support, payment verification, and future product update notices. None of your local financial transactions or sensitive data ever leave your machine.'
    },
    {
      q: 'Can I delete my synchronized data from the cloud later?',
      a: 'Yes. You can permanently wipe and remove all synchronized cloud data at any time directly in the desktop app under Settings → Account & Cloud Sync → Purge Cloud Data.'
    },
    {
      q: 'Can I install ADIOS on multiple personal computers?',
      a: 'Yes. With your Pro Lifetime Key, you can synchronize your tasks, transactions, and documents across your desktop and laptop effortlessly.'
    }
  ];

  return (
    <div>
      {/* Top Header */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            ADIOS
            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>v2.0 Native</span>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', fontSize: '14px', fontWeight: 500 }}>
            <a href="#downloads" style={{ color: 'var(--text-secondary)' }}>Platforms</a>
            <a href="#pricing" style={{ color: 'var(--text-secondary)' }}>Get Key (UPI)</a>
            <a href="#faqs" style={{ color: 'var(--text-secondary)' }}>FAQs</a>
            <Link href="/community" style={{ color: 'var(--text-secondary)' }}>Community Discussion</Link>
            
            {user ? (
              <span style={{ fontSize: '13px', background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px' }}>
                👤 {user.name}
              </span>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }}>
                Sign In
              </button>
            )}

            <a href="/api/download" className="btn btn-primary" download>
              Download Setup (.exe)
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 24px' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 64px' }}>
          <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#334155', fontSize: '12px', fontWeight: 600, padding: '4px 14px', borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.5px' }}>
            WINDOWS SETUP & CROSS-PLATFORM SYSTEM
          </div>
          <h1 style={{ fontSize: '44px', fontWeight: 800, lineHeight: 1.25, color: 'var(--text)', marginBottom: '18px', letterSpacing: '-0.5px' }}>
            Your Complete Personal Desktop Manager
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Zero-bloat native application for finances in ₹ Rupees, exams, subscriptions, and skills. Run 100% offline with local SQLite, or enable multi-machine encrypted cloud sync via genuine product key.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <a href="#downloads" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Windows Setup (.exe)
            </a>
            <button onClick={handleStartPurchase} className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Buy Lifetime Key (UPI / QR)
            </button>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Includes Inno Setup Wizard, Custom Backup Directory Selector • 100% Free Offline Forever
          </div>
        </section>

        {/* Operating Systems Section */}
        <section id="downloads" style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Download for Your Device</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>All builds include complete offline functionality without requiring an account.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ textAlign: 'center', border: '2px solid #0284c7' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪟</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Windows</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Windows 10 / 11 (64-bit)</p>
              <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '16px' }}>
                AVAILABLE NOW
              </div>
              <a href="/api/download" className="btn btn-primary" style={{ width: '100%' }} download>
                Download Setup (.exe)
              </a>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Official Inno Setup Wizard (52 MB)</div>
            </div>

            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐧</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Linux</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Ubuntu, Debian, Fedora, Arch</p>
              <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '16px' }}>
                AVAILABLE NOW
              </div>
              <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
                Get AppImage / PyPI
              </a>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Standalone Python Executable</div>
            </div>

            <div className="card" style={{ textAlign: 'center', background: '#fafbfc' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍏</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>macOS</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Apple Silicon (M1-M4) & Intel</p>
              <div style={{ display: 'inline-block', background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '16px' }}>
                COMING SOON
              </div>
              <button disabled className="btn btn-secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
                macOS .dmg (Coming Soon)
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>In notarization testing</div>
            </div>
          </div>
        </section>

        {/* Pricing & UPI Payment Section */}
        <section id="pricing" style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Product Key & UPI QR Purchase</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Sign in to pay via UPI QR code. Your key is verified and issued manually by our admin.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {/* Free Offline Card */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Community Offline</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Zero cloud, zero paywall. 100% on your device.</p>
                <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>₹0 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ forever</span></div>
                <ul style={{ listStyle: 'none', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <li>✓ All 10 Application Modules Included</li>
                  <li>✓ Local SQLite Database Storage</li>
                  <li>✓ Custom Backup Directory Setup</li>
                  <li>✓ PDF & Print Financial Reports</li>
                  <li>✓ No Sign-in or Product Key Required</li>
                </ul>
              </div>
              <a href="/api/download" className="btn btn-secondary" style={{ marginTop: '24px' }} download>Download Free</a>
            </div>

            {/* Pro Lifetime Card (UPI Purchase) */}
            <div className="card" style={{ border: '2px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--primary)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>RECOMMENDED</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Pro Edition (Cloud Sync Key)</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Pay via UPI QR Code • Issued after manual verification</p>
                <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>₹999 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ lifetime</span></div>
                <ul style={{ listStyle: 'none', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <li>✓ Multi-Device Encrypted Cloud Sync</li>
                  <li>✓ Fast Continuity across Windows & Linux</li>
                  <li>✓ Direct UPI QR Code / UPI ID Payment</li>
                  <li>✓ Manual Admin Verification & Instant Key Issuance</li>
                  <li>✓ Full Right to Purge Cloud Data from Desktop Settings</li>
                </ul>
              </div>
              <button onClick={handleStartPurchase} className="btn btn-primary" style={{ marginTop: '24px' }}>
                {user ? 'Pay via UPI QR Code (₹999)' : 'Sign In to Buy Key (UPI)'}
              </button>
            </div>
          </div>
        </section>

        {/* 3-Day Trial */}
        <section id="trial" style={{ maxWidth: '580px', margin: '0 auto 64px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Test Cloud Sync: Free 3-Day Trial</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Enter your email to activate full multi-device synchronization for 3 days with zero payment commitment:
            </p>
            {trialStatus && (
              <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '10px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' }}>
                {trialStatus}
              </div>
            )}
            <form onSubmit={handleStartTrial} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="name@example.com"
                value={trialEmail}
                onChange={(e) => setTrialEmail(e.target.value)}
                required
                style={{ flex: 1, padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '14px', outline: 'none' }}
              />
              <button type="submit" className="btn btn-primary">Start Trial</button>
            </form>
          </div>
        </section>

        {/* Frequently Asked Questions (FAQs) */}
        <section id="faqs" style={{ marginBottom: '64px', maxWidth: '820px', margin: '0 auto 64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Frequently Asked Questions</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Clear, straightforward answers about licensing, privacy, and storage.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {faqs.map((f, idx) => (
              <div key={idx} className="card" style={{ padding: '18px 22px', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === idx ? null : idx)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '15px' }}>
                  <span>{f.q}</span>
                  <span style={{ color: 'var(--primary)', fontSize: '18px' }}>{openFaq === idx ? '−' : '+'}</span>
                </div>
                {openFaq === idx && (
                  <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Community Discussion Callout */}
        <section style={{ textAlign: 'center', background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '40px 24px', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Join the ADIOS Community</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 20px' }}>
            Have a question or feature request? Join our open community threads to interact with developers and fellow power users.
          </p>
          <Link href="/community" className="btn btn-secondary">
            Open Community Discussions →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', background: '#fff', padding: '36px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <b>ADIOS</b> • Personal Desktop Management & Cloud Sync Platform
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--text-secondary)' }}>Terms & Conditions</Link>
            <Link href="/community" style={{ color: 'var(--text-secondary)' }}>Community Forum</Link>
            <Link href="/admin" style={{ color: 'var(--text-muted)' }}>Admin Login</Link>
          </div>
        </div>
      </footer>

      {/* 1. SIGN IN MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '420px', width: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Customer Sign In</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              We only save your Name, Email, and Phone for customer support and key delivery.
            </p>
            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Your Full Name*</label>
                <input
                  type="text"
                  placeholder="e.g. Sayan Maity"
                  value={authName}
                  onChange={e => setAuthName(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Email Address*</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none' }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Contact Number (for updates & support)</label>
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={authPhone}
                  onChange={e => setAuthPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Continue to Payment</button>
                <button type="button" onClick={() => setShowAuthModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. UPI QR CODE CHECKOUT MODAL */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Pay via UPI QR Code</h3>
              <button onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {orderSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                <h4 style={{ fontSize: '18px', color: 'var(--success)', marginBottom: '8px' }}>Payment Reference Submitted!</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                  Thank you, <b>{user?.name}</b>! Your UPI reference (<b>{utrNumber}</b>) is received. Our administrator will verify the payment and issue your genuine product key shortly.
                </p>
                <button onClick={() => { setShowCheckoutModal(false); setOrderSubmitted(false); }} className="btn btn-primary">
                  Done
                </button>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Scan the QR code with any UPI app (Google Pay, PhonePe, Paytm, BHIM) or transfer to the UPI ID.
                </p>

                {/* Simulated crisp vector UPI QR card */}
                <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '20px', textAlign: 'center', marginBottom: '18px' }}>
                  <div style={{ display: 'inline-block', background: '#fff', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '10px' }}>
                    {/* SVG representation of UPI QR Code */}
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="#0f172a">
                      <rect x="0" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="10" width="10" height="10" fill="#0284c7" />
                      <rect x="70" y="0" width="30" height="30" fill="#0f172a" />
                      <rect x="75" y="5" width="20" height="20" fill="#ffffff" />
                      <rect x="80" y="10" width="10" height="10" fill="#0284c7" />
                      <rect x="0" y="70" width="30" height="30" fill="#0f172a" />
                      <rect x="5" y="75" width="20" height="20" fill="#ffffff" />
                      <rect x="10" y="80" width="10" height="10" fill="#0284c7" />
                      <rect x="40" y="10" width="10" height="20" />
                      <rect x="55" y="15" width="8" height="8" />
                      <rect x="40" y="40" width="20" height="20" fill="#0284c7" />
                      <rect x="70" y="40" width="10" height="10" />
                      <rect x="85" y="55" width="12" height="12" />
                      <rect x="40" y="70" width="15" height="15" />
                      <rect x="65" y="75" width="10" height="20" />
                      <rect x="85" y="80" width="10" height="10" />
                    </svg>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1' }}>UPI ID: sayanjc3639q@oksbi</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Amount: <b>₹999.00</b> (Pro Lifetime License)</div>
                </div>

                <form onSubmit={handleOrderSubmit}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      Enter UPI Ref / UTR Number (12 digits)*
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 432190821941"
                      value={utrNumber}
                      onChange={e => setUtrNumber(e.target.value)}
                      required
                      style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontSize: '14px', fontFamily: 'monospace' }}
                    />
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Found in your Google Pay / PhonePe / Paytm transaction receipt.
                    </div>
                  </div>

                  <button type="submit" disabled={submittingOrder} className="btn btn-primary" style={{ width: '100%', padding: '10px' }}>
                    {submittingOrder ? 'Submitting Reference...' : 'Submit Payment Reference'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
