'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Key, Eye, EyeOff, Copy, Check, Download, ShieldCheck, ShoppingCart, LogOut, RefreshCw } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productKeys, setProductKeys] = useState<Array<{ key: string; plan: string; orderId: string; issuedAt: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Signin form state if not logged in
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Load existing session from localStorage if present
  useEffect(() => {
    const savedUser = localStorage.getItem('adios_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        fetchProfile(parsed.email);
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (userEmail: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/profile?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setProductKeys(data.productKeys || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!email) return;

    setSubmittingAuth(true);
    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          name,
          email,
          phone,
          password
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        localStorage.setItem('adios_user', JSON.stringify(data.user));
        fetchProfile(data.user.email);
      } else {
        setAuthError(data.message || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setAuthError('Network error connecting to authentication service.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setOrders([]);
    setProductKeys([]);
    localStorage.removeItem('adios_user');
  };

  const toggleRevealKey = (key: string) => {
    setRevealedKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Header */}
      <header
        style={{
          height: '66px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6%',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0067b8', fontSize: '13.5px', fontWeight: 500 }}>
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </Link>
            <span style={{ color: '#c7c7c7' }}>|</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#0f172a', letterSpacing: '0.02em' }}>
              ADIOS
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>User Profile &amp; Licenses</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Link href="/pricing" style={{ fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
              Pricing
            </Link>
            <Link href="/cart" style={{ fontSize: '13.5px', color: '#475569', fontWeight: 500 }}>
              Cart
            </Link>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Profile Content */}
      <main style={{ flex: 1, padding: '48px 6% 80px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* If Not Signed In: Show Clean Login / Registration Card */}
        {!user && (
          <div style={{ maxWidth: '440px', margin: '40px auto 0 auto', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', boxShadow: '0 10px 30px rgba(0,0,0,0.04)' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#eff6ff', color: '#0067b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <User size={24} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                {authMode === 'signin' ? 'Sign In to ADIOS' : 'Create an Account'}
              </h1>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Access your perpetual product keys, order invoices, and sync settings.
              </p>
            </div>

            {authError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {authMode === 'signup' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Jane Doe"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <button
                type="submit"
                disabled={submittingAuth}
                className="ms-hero-btn"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '14px',
                  marginTop: '8px',
                  cursor: submittingAuth ? 'not-allowed' : 'pointer'
                }}
              >
                {submittingAuth ? 'Processing...' : authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#64748b' }}>
              {authMode === 'signin' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: '#0067b8', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => { setAuthMode('signin'); setAuthError(''); }}
                    style={{ background: 'none', border: 'none', color: '#0067b8', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* If Signed In: Show User Profile, Product Keys and Orders */}
        {user && (
          <div>
            {/* Top Info Banner */}
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px 36px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0067b8', color: '#ffffff', fontSize: '24px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                    {user.name}
                  </h1>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {user.email} • {user.phone || 'Phone not linked'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => fetchProfile(user.email)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer'
                  }}
                >
                  <RefreshCw size={13} />
                  <span>Refresh Keys</span>
                </button>
                <Link
                  href="/pricing"
                  className="ms-hero-btn"
                  style={{ borderRadius: '8px', height: '38px', fontSize: '13px', padding: '0 16px' }}
                >
                  Browse Suites
                </Link>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '32px', alignItems: 'start' }}>
              {/* Left Column: Product Keys */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a' }}>
                    Your Perpetual Product Keys
                  </h2>
                  <span style={{ fontSize: '12.5px', background: '#eff6ff', color: '#0067b8', fontWeight: 600, padding: '2px 10px', borderRadius: '12px' }}>
                    {productKeys.length} {productKeys.length === 1 ? 'Key' : 'Keys'}
                  </span>
                </div>

                {loading ? (
                  <div style={{ background: '#ffffff', borderRadius: '12px', padding: '36px', textAlign: 'center', color: '#64748b' }}>
                    Loading licenses...
                  </div>
                ) : productKeys.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px', textAlign: 'center' }}>
                    <Key size={32} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                      No active licenses found
                    </h3>
                    <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
                      Purchased license keys will appear here automatically once verified.
                    </p>
                    <Link href="/pricing" className="ms-hero-btn" style={{ borderRadius: '6px', fontSize: '13px' }}>
                      View Pricing Plans
                    </Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {productKeys.map((pk, idx) => {
                      const isRevealed = revealedKeys[pk.key] || false;
                      const isCopied = copiedKey === pk.key;

                      return (
                        <div
                          key={idx}
                          style={{
                            background: '#ffffff',
                            borderRadius: '14px',
                            border: '1px solid #e2e8f0',
                            padding: '24px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                            <div>
                              <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                                {pk.plan}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                Issued: {pk.issuedAt}
                              </div>
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px' }}>
                              LIFETIME ACTIVE
                            </span>
                          </div>

                          {/* Key Display Bar */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '10px 14px',
                              marginTop: '8px'
                            }}
                          >
                            <code style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.08em', color: '#0f172a' }}>
                              {isRevealed ? pk.key : '••••••••-••••-••••-••••••••••••'}
                            </code>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => toggleRevealKey(pk.key)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                                title={isRevealed ? 'Hide Key' : 'Reveal Key'}
                              >
                                {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(pk.key)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCopied ? '#107c10' : '#0067b8', padding: '4px' }}
                                title="Copy Key"
                              >
                                {isCopied ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Order History */}
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0f172a', marginBottom: '16px' }}>
                  Order History
                </h2>

                {orders.length === 0 ? (
                  <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                    No order receipts found.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {orders.map((order, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#ffffff',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                          padding: '18px 20px',
                          fontSize: '13.5px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.plan}</span>
                          <span style={{ fontWeight: 600, color: '#0067b8' }}>₹{order.amount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
                          <span>UTR: {order.utrNumber}</span>
                          <span style={{ color: order.status === 'Approved' ? '#107c10' : '#d97706', fontWeight: 500 }}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '28px 6%', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        <p>© 2026 ADIOS Software Ecosystem. All licenses are 100% perpetual and bound to local hardware.</p>
      </footer>
    </div>
  );
}
