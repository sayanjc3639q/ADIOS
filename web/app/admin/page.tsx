'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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
  id: number;
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

  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (e: any) {
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
        setOrders(orders.map(o => o.id === orderId ? data.order : o));
      }
    } catch (e) {
      alert('Error updating order');
    }
  };

  if (!authorized) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: '18px', marginBottom: '10px' }}>
              A
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)' }}>ADIOS Control Plane</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Administrative Verification Portal</p>
          </div>

          {errorMsg && (
            <div style={{ 
              background: isLocked ? '#fef2f2' : '#fee2e2', 
              color: '#b91c1c', 
              border: '1px solid #fca5a5',
              padding: '10px 14px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              marginBottom: '18px',
              lineHeight: 1.4
            }}>
              <div style={{ fontWeight: 600, marginBottom: '2px' }}>
                {isLocked ? 'Access Temporarily Locked' : 'Authentication Notice'}
              </div>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Admin Email</label>
              <input
                type="email"
                placeholder="name@company.com"
                value={emailInput}
                disabled={isLocked || authLoading}
                onChange={(e) => setEmailInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none' }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={passwordInput}
                disabled={isLocked || authLoading}
                onChange={(e) => setPasswordInput(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none' }}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLocked || authLoading}
              style={{ width: '100%', opacity: (isLocked || authLoading) ? 0.6 : 1, cursor: (isLocked || authLoading) ? 'not-allowed' : 'pointer' }}
            >
              {authLoading ? 'Verifying Credentials...' : isLocked ? 'Locked (1 Hour)' : 'Sign In to Admin Console'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Link href="/">← Return to Public Website</Link>
          </div>
        </div>
      </div>
    );
  }

  const pendingOrders = orders.filter(o => o.status === 'Pending Verification');
  const approvedOrders = orders.filter(o => o.status === 'Approved & Key Issued');

  return (
    <div>
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: 700 }}>
          ADIOS
          <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '4px' }}>Admin Verification Control</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px' }}>
          <span>Logged in as <b>jcsayan7@gmail.com</b></span>
          <button onClick={() => setAuthorized(false)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }}>Sign Out</button>
        </div>
      </header>

      <main style={{ maxWidth: '1180px', margin: '32px auto', padding: '0 24px' }}>
        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          <div className="card">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Pending UPI Verifications</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: pendingOrders.length > 0 ? '#d97706' : 'var(--text)' }}>
              {pendingOrders.length}
            </div>
          </div>
          <div className="card">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Keys Issued & Verified</div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: 'var(--success)' }}>{approvedOrders.length}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Registered Customers</div>
            <div style={{ fontSize: '26px', fontWeight: 700 }}>{users.length}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Verified Revenue</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7' }}>₹{approvedOrders.reduce((sum, o) => sum + o.amount, 0)}</div>
          </div>
        </div>

        {/* Pending UPI Payment Verification Table */}
        <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid #d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)' }}>Pending Payment Verifications ({pendingOrders.length})</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Verify the UPI Transaction Reference / UTR in your bank app. Clicking <b>Approve & Issue Key</b> mints an official license key immediately.
              </p>
            </div>
            <button onClick={fetchAdminData} className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>Refresh</button>
          </div>

          {pendingOrders.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
              No pending orders. All customer UPI payments are verified!
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name & Contact</th>
                  <th>Plan & Amount</th>
                  <th>UPI Ref / UTR Number</th>
                  <th>Submitted At</th>
                  <th>Verification Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.map(o => (
                  <tr key={o.id}>
                    <td><b>{o.id}</b></td>
                    <td>
                      <div><b>{o.userName}</b></div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{o.userEmail} • {o.userPhone}</div>
                    </td>
                    <td>
                      <div>{o.plan}</div>
                      <div style={{ fontWeight: 700, color: '#0284c7' }}>₹{o.amount}</div>
                    </td>
                    <td>
                      <code style={{ background: '#fef3c7', padding: '3px 8px', borderRadius: '4px', fontWeight: 700, color: '#92400e', fontSize: '13px' }}>
                        {o.utrNumber}
                      </code>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{o.createdAt}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleVerifyOrder(o.id, 'approve')}
                          className="btn btn-primary"
                          style={{ padding: '4px 10px', fontSize: '12px', background: '#16a34a' }}
                        >
                          ✓ Approve & Issue Key
                        </button>
                        <button
                          onClick={() => handleVerifyOrder(o.id, 'reject')}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '12px', color: '#dc2626' }}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Issued Keys & Verified Orders History */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Approved Orders & Issued Product Keys</h3>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Issued License Key</th>
                <th>Payment UTR</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {approvedOrders.map(o => (
                <tr key={o.id}>
                  <td><b>{o.id}</b></td>
                  <td>{o.userEmail}</td>
                  <td>
                    <code style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                      {o.issuedKey}
                    </code>
                  </td>
                  <td><code>{o.utrNumber}</code></td>
                  <td>
                    <span style={{ background: 'var(--success-light)', color: 'var(--success)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Customer Accounts (Name, Email, Contact No) */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Customer Contact Registry (Support & Notifications Only)</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Per our privacy guarantee, only Name, Email, and Phone are retained for update notifications and license recovery.
          </p>
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Contact Number</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>#{u.id}</td>
                  <td><b>{u.name}</b></td>
                  <td>{u.email}</td>
                  <td>{u.phone || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
