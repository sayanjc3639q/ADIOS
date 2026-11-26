'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  LogOut,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<{ id?: number; name: string; email: string; phone: string; role?: string } | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [productKeys, setProductKeys] = useState<Array<{ key: string; plan: string; orderId: string; issuedAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Key Visibility
  const [revealedKeys, setRevealedKeys] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Authentication State if not signed in
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Load existing session from Supabase or localStorage
  useEffect(() => {
    async function initAuth() {
      // 1. Check Supabase session first
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const supaUser = {
            id: 1,
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            phone: session.user.user_metadata?.phone || '',
            role: 'user'
          };
          setUser(supaUser);
          setEditName(supaUser.name);
          setEditPhone(supaUser.phone);
          fetchProfileData(supaUser.email);
          return;
        }
      } catch {
        // Fallback cleanly
      }

      // 2. Check LocalStorage fallback
      const savedUser = localStorage.getItem('adios_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setEditName(parsed.name || '');
          setEditPhone(parsed.phone || '');
          fetchProfileData(parsed.email);
        } catch {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const fetchProfileData = async (userEmail: string) => {
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

  // Sign In / Sign Up handler
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail) return;

    setSubmittingAuth(true);
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
        setEditName(data.user.name);
        setEditPhone(data.user.phone);
        localStorage.setItem('adios_user', JSON.stringify(data.user));
        fetchProfileData(data.user.email);
      } else {
        setAuthError(data.message || 'Authentication failed. Please check credentials.');
      }
    } catch {
      setAuthError('Network error connecting to authentication service.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Profile Information Update
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);

    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_profile',
          email: user.email,
          name: editName,
          phone: editPhone
        })
      });

      const data = await res.json();
      if (data.success) {
        const updated = { ...user, name: editName, phone: editPhone };
        setUser(updated);
        localStorage.setItem('adios_user', JSON.stringify(updated));
        setProfileSuccess('Profile information updated successfully.');
      } else {
        setProfileError(data.message || 'Failed to update profile.');
      }
    } catch {
      setProfileError('Network error updating profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setPasswordSuccess('');
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/user/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_password',
          email: user.email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (data.success) {
        setPasswordSuccess('Password has been changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(data.message || 'Failed to update password.');
      }
    } catch {
      setPasswordError('Network error changing password.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Clean sign out
    }
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

  // Active Subscription Plan Calculation
  const activePlanName = productKeys.length > 0 
    ? productKeys[0].plan 
    : user?.role === 'tester' 
    ? 'Alpha Testing Plan' 
    : 'Community Free';

  const isPerpetual = productKeys.length > 0;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Header */}
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
        <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0067b8', fontSize: '13.5px', fontWeight: 500 }}>
              <ArrowLeft size={15} />
              <span>Back to Home</span>
            </Link>
            <span style={{ color: '#c7c7c7' }}>|</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: '#0f172a', letterSpacing: '0.02em' }}>
              ADIOS
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>My Account</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                  padding: '6px 14px',
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

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '48px 6% 80px 6%', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
        {/* 1. NOT SIGNED IN VIEW */}
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
                Sign in to manage your profile, active subscriptions, and perpetual keys.
              </p>
            </div>

            {authError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', padding: '10px 14px', borderRadius: '6px', marginBottom: '18px' }}>
                <AlertCircle size={15} />
                <span>{authError}</span>
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
                      value={authName}
                      onChange={e => setAuthName(e.target.value)}
                      placeholder="Jane Doe"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Phone Number</label>
                    <input
                      type="tel"
                      value={authPhone}
                      onChange={e => setAuthPhone(e.target.value)}
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
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Password</label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
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

        {/* 2. SIGNED IN PROFILE DASHBOARD */}
        {user && (
          <div>
            {/* Top Overview Card */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '32px 36px',
                marginBottom: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #0067b8 0%, #1e40af 100%)',
                    color: '#ffffff',
                    fontSize: '26px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 18px rgba(0, 103, 184, 0.2)'
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 style={{ fontSize: '26px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>
                    {user.name}
                  </h1>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b', fontSize: '14px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} />
                      {user.email}
                    </span>
                    {user.phone && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} />
                        {user.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Current Subscription Badge Card */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  minWidth: '240px'
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: '4px' }}>
                  Current License / Plan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#0067b8" />
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>
                    {activePlanName}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: isPerpetual ? '#059669' : '#64748b', marginTop: '4px', fontWeight: 500 }}>
                  {isPerpetual ? '● Lifetime Perpetual Ownership' : 'Standard Offline Edition'}
                </div>
              </div>
            </div>

            {/* Grid: 2 Columns (Left: Edit Details & Change Password, Right: Active Licenses & Invoices) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1.25fr)', gap: '32px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: Profile Settings & Security */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 1. Account Details Form */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <User size={18} color="#0067b8" />
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                      Profile Information
                    </h2>
                  </div>

                  {profileSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                      <CheckCircle2 size={16} />
                      <span>{profileSuccess}</span>
                    </div>
                  )}

                  {profileError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                      <AlertCircle size={16} />
                      <span>{profileError}</span>
                    </div>
                  )}

                  <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        Email Address (Read-only)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user.email}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: '14px', cursor: 'not-allowed' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={e => setEditPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="ms-hero-btn"
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        marginTop: '6px',
                        cursor: savingProfile ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <Save size={15} />
                      <span>{savingProfile ? 'Saving...' : 'Save Profile'}</span>
                    </button>
                  </form>
                </div>

                {/* 2. Change Password Form */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Lock size={18} color="#0067b8" />
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                      Security &amp; Change Password
                    </h2>
                  </div>

                  {passwordSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                      <CheckCircle2 size={16} />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  {passwordError && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                      <AlertCircle size={16} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        New Password (min 6 chars)
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="ms-secondary-btn"
                      style={{
                        height: '40px',
                        borderRadius: '8px',
                        border: '1px solid #0067b8',
                        color: '#0067b8',
                        fontSize: '13.5px',
                        fontWeight: 600,
                        marginTop: '6px',
                        justifyContent: 'center',
                        cursor: changingPassword ? 'not-allowed' : 'pointer'
                      }}
                    >
                      <span>{changingPassword ? 'Updating Password...' : 'Change Password'}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* RIGHT COLUMN: Current Subscriptions, Perpetual Licenses & Orders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                
                {/* 1. Perpetual Licenses Card */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Key size={18} color="#0067b8" />
                      <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                        Active Perpetual Keys
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => fetchProfileData(user.email)}
                      style={{ background: 'transparent', border: 'none', color: '#0067b8', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}
                    >
                      <RefreshCw size={13} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {loading ? (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                      Loading license records...
                    </div>
                  ) : productKeys.length === 0 ? (
                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '32px', textAlign: 'center' }}>
                      <Key size={28} color="#94a3b8" style={{ margin: '0 auto 10px auto' }} />
                      <div style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>
                        No activated commercial keys
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '18px' }}>
                        You are currently using the Community Free edition. Upgrade to unlock LAN networking and automated hot backups.
                      </p>
                      <Link href="/pricing" className="ms-hero-btn" style={{ borderRadius: '6px', fontSize: '13px', padding: '8px 18px' }}>
                        Browse Lifetime Plans
                      </Link>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {productKeys.map((pk, idx) => {
                        const isRevealed = revealedKeys[pk.key] || false;
                        const isCopied = copiedKey === pk.key;

                        return (
                          <div
                            key={idx}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '12px',
                              padding: '18px 20px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                              <span style={{ fontSize: '15px', fontWeight: 600, color: '#0f172a' }}>
                                {pk.plan}
                              </span>
                              <span style={{ fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px' }}>
                                PERPETUAL ACTIVE
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px' }}>
                              <code style={{ fontSize: '13.5px', fontWeight: 600, letterSpacing: '0.06em', color: '#0f172a' }}>
                                {isRevealed ? pk.key : '••••••••-••••-••••-••••••••••••'}
                              </code>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => toggleRevealKey(pk.key)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                                  title={isRevealed ? 'Hide' : 'Reveal'}
                                >
                                  {isRevealed ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(pk.key)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isCopied ? '#107c10' : '#0067b8', padding: '4px' }}
                                  title="Copy"
                                >
                                  {isCopied ? <Check size={15} /> : <Copy size={15} />}
                                </button>
                              </div>
                            </div>

                            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '8px' }}>
                              Order ID: {pk.orderId} • Activated: {pk.issuedAt}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. Order History & Invoices Card */}
                <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px 32px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <Layers size={18} color="#0067b8" />
                    <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>
                      Order &amp; Purchase History
                    </h2>
                  </div>

                  {orders.length === 0 ? (
                    <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13.5px' }}>
                      No purchase records registered yet.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {orders.map((order, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '14px 18px',
                            fontSize: '13px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 600, color: '#0f172a' }}>{order.plan}</span>
                            <span style={{ fontWeight: 600, color: '#0067b8' }}>₹{order.amount}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
                            <span>UTR: {order.utrNumber}</span>
                            <span style={{ color: order.status === 'Approved & Key Issued' ? '#107c10' : '#d97706', fontWeight: 600 }}>
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
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0', padding: '24px 6%', textAlign: 'center', fontSize: '13px', color: '#64748b' }}>
        <p>© 2026 ADIOS Software Ecosystem. Hardware-bound sovereign licenses.</p>
      </footer>
    </div>
  );
}
