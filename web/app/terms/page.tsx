import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 24px', lineHeight: 1.7, color: 'var(--text)' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }}>← Back to ADIOS Home</Link>
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>Terms & Conditions</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' }}>Effective Date: November 2026</p>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>1. Community Offline License</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          ADIOS is free software for personal offline use. You may use all local capabilities without licensing restrictions, subscription fees, or mandatory account creation.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>2. Product Key Issuance & Payment</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Pro edition lifetime licenses are purchased through UPI transfer or QR Code. License keys are manually verified and issued by our administration team upon verification of the Transaction Reference / UTR Number.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>3. Cloud Continuity & Fair Use</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Cloud sync is intended for personal desktop synchronization across your personal devices. Automated scraping or abusive bandwidth utilization may result in temporary synchronization suspension.
        </p>
      </section>

      <section style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>4. Data Responsibility</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Because ADIOS is an offline-first tool that stores data in local SQLite on your own hardware, users are encouraged to maintain periodic backups using the integrated Backup snapshot feature.
        </p>
      </section>
    </div>
  );
}
