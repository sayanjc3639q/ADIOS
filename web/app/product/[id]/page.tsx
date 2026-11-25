import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { SUITE_APPS } from '../../lib/suites';
import { ChevronRight, ArrowLeft, Check, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return SUITE_APPS.map(app => ({
    id: app.id,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = SUITE_APPS.find(app => app.id === id);

  if (!product) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Mini Breadcrumb Header */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0067b8', fontSize: '13px', fontWeight: 500 }}>
              <ArrowLeft size={14} />
              <span>All Products</span>
            </Link>
            <span style={{ color: '#c7c7c7' }}>/</span>
            <span style={{ color: '#737373', fontSize: '13px' }}>{product.category}</span>
            <span style={{ color: '#c7c7c7' }}>/</span>
            <span style={{ color: '#262626', fontSize: '13px', fontWeight: 500 }}>{product.name}</span>
          </div>

          <Link href="/cart" className="ms-hero-btn" style={{ padding: '6px 16px', fontSize: '13px', height: '32px' }}>
            Go to Cart
          </Link>
        </div>
      </header>

      {/* Main Product Showcase Hero */}
      <main style={{ flex: 1, padding: '48px 6% 80px 6%', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(300px, 1fr)',
            gap: '56px',
            alignItems: 'start',
            marginBottom: '64px'
          }}
        >
          {/* Left: Product Visual Presentation */}
          <div>
            <div
              style={{
                background: '#f7f7f7',
                border: '1px solid #e6e6e6',
                borderRadius: '8px',
                padding: '24px',
                marginBottom: '24px',
                position: 'relative'
              }}
            >
              <Image
                src={product.image}
                alt={product.name}
                width={1280}
                height={720}
                priority
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.1)'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: product.status === 'available' ? '#107c10' : '#78248c',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: '2px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {product.statusLabel}
              </div>
            </div>

            {/* Quick Architecture Callouts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              <div style={{ border: '1px solid #e6e6e6', padding: '16px', borderRadius: '4px' }}>
                <Cpu size={18} style={{ color: '#0067b8', marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}>Qt 6 Native</div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>Zero-latency local runtime</div>
              </div>
              <div style={{ border: '1px solid #e6e6e6', padding: '16px', borderRadius: '4px' }}>
                <HardDrive size={18} style={{ color: '#0067b8', marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}>Local SQLite</div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>Full data sovereignty</div>
              </div>
              <div style={{ border: '1px solid #e6e6e6', padding: '16px', borderRadius: '4px' }}>
                <ShieldCheck size={18} style={{ color: '#0067b8', marginBottom: '6px' }} />
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#262626' }}>Perpetual License</div>
                <div style={{ fontSize: '12px', color: '#737373', marginTop: '2px' }}>No recurring fees</div>
              </div>
            </div>
          </div>

          {/* Right: Product Buying Box & Specs */}
          <div>
            <div style={{ fontSize: '12.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#737373', fontWeight: 600, marginBottom: '8px' }}>
              {product.category}
            </div>

            <h1 style={{ fontSize: '32px', fontWeight: 400, color: '#262626', marginBottom: '12px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <p style={{ fontSize: '16px', color: '#505050', lineHeight: 1.6, marginBottom: '24px', fontWeight: 350 }}>
              {product.description}
            </p>

            <div style={{ background: '#f9f9f9', border: '1px solid #e6e6e6', padding: '24px', borderRadius: '6px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#737373', display: 'block' }}>Perpetual Ownership</span>
                  <span className="font-mono" style={{ fontSize: '28px', fontWeight: 600, color: '#262626' }}>
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: '#107c10', fontWeight: 500 }}>
                  Includes free minor updates
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                <Link
                  href={`/cart?add=${product.id}`}
                  className="ms-hero-btn"
                  style={{ width: '100%', height: '42px', fontSize: '14.5px' }}
                >
                  Buy Perpetual License &amp; Checkout
                </Link>

                <a
                  href="/api/download"
                  download
                  className="ms-secondary-btn"
                  style={{ width: '100%', height: '38px', fontSize: '13.5px', border: '1px solid #e6e6e6' }}
                >
                  Download Free Community .exe
                </a>
              </div>
            </div>

            {/* Core Features Checklist */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 450, color: '#262626', marginBottom: '12px' }}>
                Included Capabilities
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {product.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#262626' }}>
                    <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#dff6dd', color: '#107c10', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', flexShrink: 0, marginTop: '2px' }}>
                      <Check size={12} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications Table */}
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 450, color: '#262626', marginBottom: '12px' }}>
                Technical Specifications
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #e6e6e6', fontSize: '13px' }}>
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f2f2f2', background: i % 2 === 0 ? '#fafafa' : '#ffffff' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 500, color: '#262626', width: '38%' }}>{spec.label}</td>
                      <td style={{ padding: '10px 14px', color: '#505050' }}>{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Official Microsoft-Style Footer */}
      <footer style={{ background: '#f2f2f2', borderTop: '1px solid #e6e6e6', padding: '36px 6%', fontSize: '12.5px', color: '#616161' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <div style={{ fontWeight: 500, color: '#262626', marginBottom: '2px' }}>ADIOS Management Ecosystem</div>
            <div>Compiled native desktop applications with 100% offline persistence.</div>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" className="ms-footer-link">Home</Link>
            <Link href="/cart" className="ms-footer-link">Cart</Link>
            <Link href="/community" className="ms-footer-link">Community</Link>
            <Link href="/privacy" className="ms-footer-link">Privacy</Link>
            <Link href="/terms" className="ms-footer-link">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
