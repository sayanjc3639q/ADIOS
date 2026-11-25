'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { SUITE_APPS } from '../lib/suites';
import { ArrowLeft, Trash2, Check, ShieldCheck, ShoppingCart, User } from 'lucide-react';

function CartContent() {
  const searchParams = useSearchParams();
  const [cart, setCart] = useState<string[]>(['personal']);
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string } | null>(null);

  // Auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Checkout modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    // Check if URL specifies an item to add, e.g. /cart?add=hospital
    const addId = searchParams.get('add');
    if (addId && SUITE_APPS.some(app => app.id === addId)) {
      setCart(prev => (prev.includes(addId) ? prev : [...prev, addId]));
    }
  }, [searchParams]);

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
        setShowCheckoutModal(true);
      } else {
        setAuthError(data.message || 'Authentication failed. Please check credentials.');
      }
    } catch (err) {
      setAuthError('Network error connecting to authentication service.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleStartCheckout = () => {
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Header */}
      <header
        style={{
          height: '54px',
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
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0067b8', fontSize: '13px', fontWeight: 500 }}>
              <ArrowLeft size={14} />
              <span>Continue Shopping</span>
            </Link>
            <span style={{ color: '#c7c7c7' }}>|</span>
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#262626' }}>
              Your Cart ({selectedApps.length})
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {user ? (
              <span style={{ fontSize: '13px', color: '#262626' }}>
                Signed in as <b>{user.name}</b>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setShowAuthModal(true); }}
                className="ms-secondary-btn"
                style={{ fontSize: '13px', padding: '4px 12px' }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Cart Body */}
      <main style={{ flex: 1, padding: '40px 6% 80px 6%', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 400, color: '#262626', marginBottom: '8px' }}>
          Cart &amp; Checkout
        </h1>
        <p style={{ fontSize: '14.5px', color: '#505050', marginBottom: '32px', fontWeight: 350 }}>
          Review your selected application suites. Bundling two or more suites qualifies for automatic volume discounts.
        </p>

        {selectedApps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fafafa', border: '1px solid #e6e6e6', borderRadius: '4px' }}>
            <ShoppingCart size={42} style={{ color: '#8a8886', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 500, color: '#262626', marginBottom: '8px' }}>Your cart is empty</h2>
            <p style={{ fontSize: '14px', color: '#737373', marginBottom: '24px' }}>
              Browse our high-performance desktop management suites and add perpetual licenses to checkout.
            </p>
            <Link href="/" className="ms-hero-btn">
              Explore Management Suites
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(300px, 1fr)', gap: '40px', alignItems: 'start' }}>
            {/* Left: Cart Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {selectedApps.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px',
                    border: '1px solid #e6e6e6',
                    borderRadius: '4px',
                    background: '#ffffff',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ maxWidth: '65%' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#737373', fontWeight: 600, letterSpacing: '0.04em' }}>
                      {item.category}
                    </div>
                    <div style={{ fontSize: '17px', fontWeight: 500, color: '#262626', margin: '4px 0 6px 0' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#505050', lineHeight: 1.4 }}>
                      {item.shortDescription}
                    </div>
                    <div className="font-mono" style={{ fontSize: '11.5px', color: '#737373', marginTop: '6px' }}>
                      License Key Format: {item.keyPrefix}-XXXX-XXXX
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-mono" style={{ fontSize: '18px', fontWeight: 600, color: '#262626', marginBottom: '8px' }}>
                      ₹{item.price.toLocaleString('en-IN')}
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleCartItem(item.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#d83b01',
                        fontSize: '12.5px',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ padding: '16px 20px', background: '#f9f9f9', border: '1px solid #e6e6e6', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={20} style={{ color: '#107c10', flexShrink: 0 }} />
                <div style={{ fontSize: '13px', color: '#505050' }}>
                  <b>Perpetual Ownership Guarantee:</b> All ADIOS licenses include offline standalone execution, zero monthly recurring fees, and minor version upgrades.
                </div>
              </div>
            </div>

            {/* Right: Order Summary Box */}
            <div style={{ background: '#f7f7f7', border: '1px solid #e6e6e6', padding: '24px', borderRadius: '4px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: '#262626', marginBottom: '16px' }}>
                Order Summary
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#505050' }}>Subtotal ({selectedApps.length} {selectedApps.length === 1 ? 'item' : 'items'}):</span>
                  <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {discountRate > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#107c10' }}>
                    <span>Bundle Discount ({Math.round(discountRate * 100)}%):</span>
                    <span className="font-mono">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #d1d1d1', paddingTop: '12px', marginTop: '6px', fontSize: '18px', fontWeight: 600 }}>
                  <span style={{ color: '#262626' }}>Total:</span>
                  <span className="font-mono" style={{ color: '#0067b8' }}>₹{totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Exact user request: remove "via upi/OR" say just checkout */}
              <button
                type="button"
                onClick={handleStartCheckout}
                className="ms-hero-btn"
                style={{ width: '100%', height: '42px', fontSize: '14.5px', marginBottom: '12px' }}
              >
                Checkout
              </button>

              <div style={{ fontSize: '12px', color: '#737373', textAlign: 'center', lineHeight: 1.4 }}>
                Instant license key generation upon UPI / bank confirmation.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e6e6e6', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontWeight: 600, fontSize: '17px' }}>
                {authMode === 'signin' ? 'Sign in to Continue' : 'Create Account'}
              </div>
              <button type="button" onClick={() => setShowAuthModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            <div style={{ display: 'flex', background: '#f2f2f2', padding: '2px', marginBottom: '16px' }}>
              <button type="button" onClick={() => setAuthMode('signin')} style={{ flex: 1, padding: '6px', border: 'none', background: authMode === 'signin' ? '#ffffff' : 'transparent', fontWeight: authMode === 'signin' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign in</button>
              <button type="button" onClick={() => setAuthMode('signup')} style={{ flex: 1, padding: '6px', border: 'none', background: authMode === 'signup' ? '#ffffff' : 'transparent', fontWeight: authMode === 'signup' ? 600 : 400, fontSize: '12px', cursor: 'pointer' }}>Sign up</button>
            </div>

            {authError && (
              <div style={{ background: '#fde7e9', border: '1px solid #d83b01', color: '#d83b01', padding: '8px 10px', fontSize: '12px', marginBottom: '12px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Full name</label>
                  <input type="text" value={authName} onChange={e => setAuthName(e.target.value)} required placeholder="Sayan Maity" style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
                </div>
              )}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>Email address</label>
                <input type="email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required placeholder="your.email@example.com" style={{ width: '100%', height: '34px', border: '1px solid #8a8886', padding: '0 8px', fontSize: '13px' }} />
              </div>
              {authMode === 'signup' && (
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
                {authLoading ? 'Verifying...' : authMode === 'signin' ? 'Sign in & Continue' : 'Create account'}
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
              <div style={{ fontWeight: 600, fontSize: '17px' }}>Payment Checkout</div>
              <button type="button" onClick={() => setShowCheckoutModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>

            {orderSubmitted ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#dff6dd', color: '#107c10', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                  <Check size={20} />
                </div>
                <div style={{ fontWeight: 600, fontSize: '16px', marginBottom: '6px' }}>Payment Reference Submitted</div>
                <p style={{ fontSize: '13px', color: '#505050', marginBottom: '16px' }}>
                  Thank you, <b>{user?.name}</b>. Your reference (<b>{utrNumber}</b>) has been recorded.
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

      {/* Footer */}
      <footer style={{ background: '#f2f2f2', borderTop: '1px solid #e6e6e6', padding: '36px 6%', fontSize: '12.5px', color: '#616161' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 500, color: '#262626', marginBottom: '2px' }}>ADIOS Management Ecosystem</div>
            <div>Compiled native desktop applications with 100% offline persistence.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" className="ms-footer-link">Home</Link>
            <Link href="/community" className="ms-footer-link">Community</Link>
            <Link href="/privacy" className="ms-footer-link">Privacy</Link>
            <Link href="/terms" className="ms-footer-link">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px', textAlign: 'center' }}>Loading Cart...</div>}>
      <CartContent />
    </Suspense>
  );
}
