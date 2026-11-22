import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 24px', lineHeight: 1.7, color: 'var(--text)' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Back to ADIOS Home</Link>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Privacy Policy</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Last Updated: November 2026</p>

      <div className="card" style={{ marginBottom: '28px', borderLeft: '4px solid var(--primary)', background: '#f0f9ff' }}>
        <h3 style={{ color: '#0369a1', fontSize: '17px', marginBottom: '8px' }}>Our Privacy Guarantee in Plain English</h3>
        <p style={{ fontSize: '14px', color: '#0f172a' }}>
          We only store your <b>Name</b>, <b>Email Address</b>, and <b>Contact Number</b> for customer support, payment verification, and future product update notifications. No other personal data is ever collected or sold.
        </p>
      </div>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>1. Local SQLite Storage First</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          By default, all your data — financial records in ₹ Rupees, transaction notes, examination dates, subscription details, habits, and tasks — reside solely in your computer&apos;s local SQLite database (<code>adios_data.db</code>).
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>2. Optional Cloud Synchronization</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          If you activate a Product Key or start a 3-Day Trial, your encrypted synchronization payload is hosted on secure cloud infrastructure.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>3. Complete Right to Delete Cloud Data</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          <b>You are always in control.</b> Synced data stored in the cloud can be permanently purged at any time directly from the desktop application under <code>Settings → Account & Cloud Sync → Purge Cloud Data</code>. Once deleted, your data stays strictly on your local device.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>4. Payment & Contact Details</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          When submitting a UPI or QR payment reference for license key issuance, we store your name, email, phone number, and UPI transaction UTR purely to verify your order and deliver your product key. We never request or store debit/credit card numbers or UPI PINs.
        </p>
      </section>
    </div>
  );
}
