'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Key,
  ShieldAlert,
  Database,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  Copy,
  Check,
  Search,
  ExternalLink,
  Code
} from 'lucide-react';

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
  utrNumber: string;
  plan: string;
  status: 'Pending Verification' | 'Approved & Key Issued' | 'Rejected';
  issuedKey?: string;
  createdAt: string;
}

interface User {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Admin Data State
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'keys' | 'schema'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Check lockout status on initial mount
  useEffect(() => {
    const checkLockout = async () => {
      try {
        const res = await fetch('/api/admin/login');
        const data = await res.json();
        if (data.isLocked) {
          setIsLocked(true);
          setRemainingTime(Math.ceil(data.remainingSeconds / 60));
          setErrorMsg(`Account is temporarily locked for 1 hour due to multiple failed attempts. (${Math.ceil(data.remainingSeconds / 60)}m remaining)`);
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkLockout();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchAdminData();
    }
  }, [authorized]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) return;

    setAuthLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setAuthorized(true);
        setErrorMsg('');
        setIsLocked(false);
      } else {
        if (data.locked) {
          setIsLocked(true);
          setRemainingTime(data.remainingMinutes || 60);
          setErrorMsg(data.message || 'Account locked for 1 hour.');
        } else {
          setErrorMsg(data.message || 'Invalid admin credentials.');
        }
      }
    } catch {
      setErrorMsg('Network error connecting to authentication server.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleVerifyOrder = async (orderId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUserRoleChange = async (userId: string | number, newRole: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newRole })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Login Screen
  if (!authorized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '24px' }}>
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '440px', boxShadow: '0 12px 32px rgba(0,0,0,0.04)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <ShieldAlert size={24} />
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>Admin Console</h2>
            <p style={{ fontSize: '13.5px', color: '#64748b' }}>
              Manage users, issue perpetual license keys, and verify Supabase cloud state.
            </p>
          </div>

          {errorMsg && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '18px' }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Admin Email</label>
              <input
                type="email"
                placeholder="jcsayan7@gmail.com"
                value={emailInput}
                disabled={isLocked || authLoading}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                disabled={isLocked || authLoading}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>
            <button
              type="submit"
              className="ms-hero-btn"
              disabled={isLocked || authLoading}
              style={{ width: '100%', height: '42px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', cursor: (isLocked || authLoading) ? 'not-allowed' : 'pointer' }}
            >
              {authLoading ? 'Verifying...' : isLocked ? 'Locked' : 'Sign In to Console'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
            <Link href="/" style={{ color: '#0067b8', textDecoration: 'none' }}>&larr; Return to Public Website</Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending Verification');
  const approvedOrders = orders.filter(o => o.status === 'Approved & Key Issued');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
      {/* Top Admin Header */}
      <header style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 6%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: '#0f172a' }}>ADIOS</span>
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', letterSpacing: '0.04em' }}>
            ADMIN CONTROL
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13.5px' }}>
          <span style={{ color: '#64748b' }}>Admin: <b>jcsayan7@gmail.com</b></span>
          <button
            type="button"
            onClick={() => setAuthorized(false)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', color: '#dc2626' }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1280px', margin: '36px auto', padding: '0 6%', width: '100%' }}>
        {/* Metric Overview Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Pending UPI Verifications</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: pendingOrders.length > 0 ? '#d97706' : '#0f172a' }}>
              {pendingOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Active License Keys Issued</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#16a34a' }}>
              {approvedOrders.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Registered Customers</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>
              {users.length}
            </div>
          </div>

          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Verified Revenue</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#0067b8' }}>
              ₹{approvedOrders.reduce((acc, o) => acc + (o.amount || 0), 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Tab Navigation Navigation */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'orders' ? '2.5px solid #0067b8' : '2.5px solid transparent',
              color: activeTab === 'orders' ? '#0067b8' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Orders &amp; UPI Approvals ({pendingOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keys')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'keys' ? '2.5px solid #0067b8' : '2.5px solid transparent',
              color: activeTab === 'keys' ? '#0067b8' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Product Keys Issued ({approvedOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'users' ? '2.5px solid #0067b8' : '2.5px solid transparent',
              color: activeTab === 'users' ? '#0067b8' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            User Management ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            style={{
              padding: '10px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'schema' ? '2.5px solid #0067b8' : '2.5px solid transparent',
              color: activeTab === 'schema' ? '#0067b8' : '#64748b',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Supabase Cloud Setup &amp; SQL Query
          </button>
        </div>

        {/* TAB 1: ORDERS & APPROVALS */}
        {activeTab === 'orders' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Pending UPI Payment Verifications</h3>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Verify the UPI Transaction Reference / UTR against your banking portal. Approving an order generates an official perpetual key instantly.
                </p>
              </div>
              <button
                type="button"
                onClick={fetchAdminData}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}
              >
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            {pendingOrders.length === 0 ? (
              <div style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                No pending orders awaiting verification.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Plan &amp; Amount</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>UPI UTR / Reference</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingOrders.map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.id}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{o.userName}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>{o.userEmail} • {o.userPhone}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ color: '#0f172a' }}>{o.plan}</div>
                          <div style={{ fontWeight: 700, color: '#0067b8' }}>₹{o.amount}</div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <code style={{ background: '#fef3c7', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, color: '#92400e', fontSize: '13px' }}>
                            {o.utrNumber}
                          </code>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              type="button"
                              onClick={() => handleVerifyOrder(o.id, 'approve')}
                              style={{ background: '#16a34a', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                            >
                              ✓ Approve &amp; Issue Key
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVerifyOrder(o.id, 'reject')}
                              style={{ background: '#ffffff', color: '#dc2626', border: '1px solid #fecaca', padding: '6px 12px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 500, cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCT KEYS */}
        {activeTab === 'keys' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Active Issued Product Keys ({approvedOrders.length})
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
              All perpetual keys generated and bound to customer accounts across ADIOS Management Suites.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Plan</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>License Key</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedOrders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{o.id}</td>
                    <td style={{ padding: '12px 16px' }}>{o.userEmail}</td>
                    <td style={{ padding: '12px 16px' }}>{o.plan}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <code style={{ background: '#eff6ff', color: '#0067b8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                          {o.issuedKey}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(o.issuedKey || '')}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: copiedKey === o.issuedKey ? '#16a34a' : '#64748b' }}
                        >
                          {copiedKey === o.issuedKey ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        LIFETIME ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
              Customer &amp; User Accounts ({users.length})
            </h3>
            <p style={{ fontSize: '13.5px', color: '#64748b', marginBottom: '20px' }}>
              Directly manage user roles and permissions across your ecosystem.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>User ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Full Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Phone</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Current Role</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>#{u.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                    <td style={{ padding: '12px 16px' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        background: u.role === 'admin' ? '#fef2f2' : u.role === 'tester' ? '#f5f3ff' : '#eff6ff',
                        color: u.role === 'admin' ? '#b91c1c' : u.role === 'tester' ? '#6d28d9' : '#0067b8',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase'
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleUserRoleChange(u.id, e.target.value)}
                        style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                      >
                        <option value="user">User</option>
                        <option value="customer">Customer</option>
                        <option value="tester">Alpha Tester</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SUPABASE CLOUD SETUP & SQL QUERY */}
        {activeTab === 'schema' && (
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 16px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Supabase SQL Schema &amp; Database Query</h3>
                <p style={{ fontSize: '13.5px', color: '#64748b' }}>
                  Execute this SQL script directly in your Supabase SQL Editor (or check file: <code>supabase_schema.sql</code>) to initialize the cloud tables and RLS security policies.
                </p>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(`-- Run in Supabase SQL Editor\nCREATE TABLE public.profiles (id UUID PRIMARY KEY REFERENCES auth.users(id), email TEXT UNIQUE NOT NULL, full_name TEXT, phone TEXT, role TEXT DEFAULT 'user');\nCREATE TABLE public.product_licenses (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_email TEXT NOT NULL, license_key TEXT UNIQUE NOT NULL, plan_tier TEXT, status TEXT DEFAULT 'active');\nCREATE TABLE public.orders (id TEXT PRIMARY KEY, user_name TEXT, user_email TEXT, amount NUMERIC, utr_number TEXT UNIQUE, plan TEXT, status TEXT);`)}
                className="ms-hero-btn"
                style={{ padding: '6px 14px', fontSize: '13px', borderRadius: '6px' }}
              >
                {copiedKey ? '✓ Copied SQL' : 'Copy Basic SQL'}
              </button>
            </div>

            <div style={{ background: '#0f172a', color: '#f8fafc', padding: '20px', borderRadius: '10px', overflowX: 'auto', fontSize: '13px', lineHeight: 1.6, fontFamily: 'monospace' }}>
              <pre style={{ margin: 0 }}>
{`-- 1. PROFILES TABLE (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PRODUCT LICENSES & PERPETUAL KEYS
CREATE TABLE IF NOT EXISTS public.product_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL,
    license_key TEXT UNIQUE NOT NULL,
    plan_tier TEXT NOT NULL,
    product_suite TEXT NOT NULL DEFAULT 'ALL',
    status TEXT NOT NULL DEFAULT 'active',
    issued_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ORDERS & UPI PAYMENTS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_email TEXT NOT NULL,
    user_phone TEXT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
    utr_number TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Verification',
    issued_license_key TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);`}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
