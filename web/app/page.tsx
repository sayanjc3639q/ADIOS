'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [trialEmail, setTrialEmail] = useState('');
  const [trialStatus, setTrialStatus] = useState<string | null>(null);

  const handleStartTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trialEmail) return;
    setTrialStatus(`Success! 3-day cloud sync activated for ${trialEmail}. You can now sign in from the desktop app.`);
    setTrialEmail('');
  };

  return (
    <div>
      {/* Navigation */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 700 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            ADIOS
            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>v2.0.0 Setup</span>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center', fontSize: '14px', fontWeight: 500 }}>
            <a href="#downloads" style={{ color: 'var(--text-secondary)' }}>Platforms</a>
            <a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a>
            <a href="#pricing" style={{ color: 'var(--text-secondary)' }}>Product Keys</a>
            <Link href="/admin" style={{ color: 'var(--text-muted)' }}>Admin Portal</Link>
            <a href="/api/download" className="btn btn-primary" download>
              Download Windows Setup
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '56px 24px' }}>
        <section style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 56px' }}>
          <div style={{ display: 'inline-block', background: '#e2e8f0', color: '#334155', fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', marginBottom: '20px', letterSpacing: '0.5px' }}>
            OFFICIAL CROSS-PLATFORM RELEASE
          </div>
          <h1 style={{ fontSize: '42px', fontWeight: 800, lineHeight: 1.25, color: 'var(--text)', marginBottom: '18px', letterSpacing: '-0.5px' }}>
            Your Complete Personal Desktop Manager
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '32px' }}>
            Zero-bloat native management for finances in ₹ Rupees, exams, subscriptions, and skills. Comes with an official Windows Setup Wizard, Linux package, and macOS support.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '14px' }}>
            <a href="#downloads" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Choose Platform & Download
            </a>
            <a href="#trial" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '15px' }}>
              Free 3-Day Cloud Trial
            </a>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Includes Windows Uninstaller, Custom Backup Folder Selector • 100% Free for Offline Use
          </div>
        </section>

        {/* Platform Downloads Section */}
        <section id="downloads" style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Download for Your Operating System</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Select your OS package below. All builds include 100% local SQLite offline functionality.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {/* Windows */}
            <div className="card" style={{ textAlign: 'center', border: '2px solid #0284c7' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🪟</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Windows</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Windows 10 / 11 (64-bit)</p>
              <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '18px' }}>
                AVAILABLE NOW
              </div>
              <a href="/api/download" className="btn btn-primary" style={{ width: '100%' }} download>
                Download Setup (.exe)
              </a>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Inno Setup Installer (52 MB)</div>
            </div>

            {/* Linux */}
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🐧</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>Linux</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Ubuntu, Debian, Fedora, Arch</p>
              <div style={{ display: 'inline-block', background: 'var(--success-light)', color: 'var(--success)', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '18px' }}>
                AVAILABLE NOW
              </div>
              <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
                Get AppImage / PyPI
              </a>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Run via Python / AppImage</div>
            </div>

            {/* macOS (Apple Silicon & Intel) */}
            <div className="card" style={{ textAlign: 'center', background: '#fafbfc' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🍏</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>macOS</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Apple Silicon (M1/M2/M3/M4) & Intel</p>
              <div style={{ display: 'inline-block', background: '#fef3c7', color: '#b45309', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', marginBottom: '18px' }}>
                COMING SOON
              </div>
              <button disabled className="btn btn-secondary" style={{ width: '100%', opacity: 0.6, cursor: 'not-allowed' }}>
                macOS .dmg (Coming Soon)
              </button>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>Currently in notarization testing</div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section id="features" style={{ marginBottom: '64px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Built for Freedom & Speed</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>All core features work locally with zero cloud dependencies.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>📦</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Dedicated Setup Wizard</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Customizable installer. Choose where ADIOS lives and where your automatic rolling backups are archived. Includes full Windows uninstaller.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>🔒</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>100% Offline-First</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                All 10 sections use local SQLite. No internet required. If you don't need cloud sync, you never have to pay or register.
              </p>
            </div>
            <div className="card">
              <div style={{ fontSize: '24px', marginBottom: '12px' }}>☁️</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Optional Cloud Sync</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Sync across your laptop and PC seamlessly using your genuine product key or activate a free 3-day trial.
              </p>
            </div>
          </div>
        </section>

        {/* 3-Day Trial Box */}
        <section id="trial" style={{ maxWidth: '580px', margin: '0 auto 64px' }}>
          <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>Activate 3-Day Free Cloud Trial</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Enter your email to test multi-machine encrypted cloud sync with zero credit card commitment:
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

        {/* Pricing */}
        <section id="pricing">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Product Key Licensing</h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Pay once for cloud continuity or keep it free offline forever.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Community Offline</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Full desktop application running locally</p>
                <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>₹0 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ forever</span></div>
                <ul style={{ listStyle: 'none', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <li>✓ All 10 Application Modules</li>
                  <li>✓ Local SQLite Database</li>
                  <li>✓ Automatic Rolling Backups</li>
                  <li>✓ Print & PDF Reports</li>
                  <li>✓ No Product Key Required</li>
                </ul>
              </div>
              <a href="/api/download" className="btn btn-secondary" style={{ marginTop: '24px' }} download>Download Free</a>
            </div>

            <div className="card" style={{ border: '2px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-11px', right: '20px', background: 'var(--primary)', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }}>RECOMMENDED</div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Pro License Key</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Lifetime key for multi-machine synchronization</p>
                <div style={{ fontSize: '32px', fontWeight: 700, marginBottom: '20px' }}>₹999 <span style={{ fontSize: '14px', fontWeight: 400, color: 'var(--text-muted)' }}>/ lifetime</span></div>
                <ul style={{ listStyle: 'none', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <li>✓ Unlimited Cloud Sync</li>
                  <li>✓ Multi-Device Continuity</li>
                  <li>✓ Priority Server Bandwidth</li>
                  <li>✓ All Future Updates Included</li>
                </ul>
              </div>
              <button onClick={() => alert('Product Key assigned: ADIOS-PRO-2026-X1. Copy this into ADIOS desktop settings!')} className="btn btn-primary" style={{ marginTop: '24px' }}>
                Purchase License Key
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', background: '#fff', textAlign: 'center', padding: '32px 24px', fontSize: '13px', color: 'var(--text-muted)' }}>
        ADIOS Personal Desktop Management • Available on Windows & Linux (macOS Coming Soon)
      </footer>
    </div>
  );
}
