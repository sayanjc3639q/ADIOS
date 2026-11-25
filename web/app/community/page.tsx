'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MessageSquare,
  ThumbsUp,
  Sparkles,
  Search,
  ShoppingCart,
  User,
  Send,
  HelpCircle,
  Code,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

interface Discussion {
  id: number;
  author: string;
  authorEmail: string;
  topic: string;
  message: string;
  likes: number;
  createdAt: string;
}

export default function CommunityPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [author, setAuthor] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'features' | 'alpha'>('all');
  const [likedPosts, setLikedPosts] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    fetch('/api/community')
      .then(r => r.json())
      .then(d => {
        if (d.discussions) setDiscussions(d.discussions);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !topic || !message) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, topic, message })
      });
      const data = await res.json();
      if (data.post) {
        setDiscussions([data.post, ...discussions]);
        setTopic('');
        setMessage('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const toggleLike = (id: number) => {
    setLikedPosts(prev => ({ ...prev, [id]: !prev[id] }));
    setDiscussions(prev =>
      prev.map(d => {
        if (d.id === id) {
          const isLiked = likedPosts[id];
          return { ...d, likes: isLiked ? d.likes - 1 : d.likes + 1 };
        }
        return d;
      })
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* 1. Header Bar matching Homepage */}
      <header
        style={{
          height: '66px',
          background: '#ffffff',
          borderBottom: '1px solid #e6e6e6',
          display: 'flex',
          alignItems: 'center',
          padding: '0 5%',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
              <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                <Image
                  src="/logo.png"
                  alt="ADIOS Logo"
                  width={32}
                  height={32}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 600, color: '#1a1429', letterSpacing: '-0.02em' }}>
                ADIOS
              </span>
            </Link>

            <nav style={{ display: 'flex', alignItems: 'center', gap: '26px' }} className="desktop-nav">
              <Link href="/product/personal" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Personal
              </Link>
              <Link href="/product/hospital" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Suites
              </Link>
              <Link href="/product/billing" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                POS
              </Link>
              <Link href="/#pricing" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Pricing
              </Link>
              <Link href="/#about" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                About ADIOS
              </Link>
              <Link href="/#downloads" style={{ color: '#262626', fontSize: '14px', fontWeight: 450 }}>
                Downloads
              </Link>
              <Link href="/community" style={{ color: '#0067b8', fontSize: '14px', fontWeight: 600 }}>
                Community
              </Link>
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
            <Link
              href="/cart"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '14px',
                color: '#262626',
                textDecoration: 'none'
              }}
            >
              <span>Cart</span>
              <ShoppingCart size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner in Surface / Blue Theme */}
      <section
        style={{
          background: 'linear-gradient(135deg, #d3c7e8 0%, #b8a8dc 50%, #a291cf 100%)',
          padding: '60px 6% 64px 6%',
          borderBottom: '1px solid rgba(0,0,0,0.06)'
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#78248c', color: '#ffffff', padding: '4px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
            <Sparkles size={14} />
            <span>Alpha Community &amp; Developer Hub</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(36px, 4.4vw, 52px)',
              fontWeight: 400,
              color: '#1a1429',
              lineHeight: 1.15,
              letterSpacing: '-0.025em',
              marginBottom: '16px'
            }}
          >
            ADIOS Community Forum
          </h1>
          <p
            style={{
              fontSize: '17px',
              color: '#342f49',
              maxWidth: '740px',
              lineHeight: 1.6,
              fontWeight: 350
            }}
          >
            Ask questions, share offline workflow setups, report bug discoveries from the open testing program, and collaborate directly with the creators of ADIOS.
          </p>
        </div>
      </section>

      {/* 3. Main Forum Content Area */}
      <main style={{ flex: 1, padding: '50px 6% 80px 6%', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        {/* Quick Filter / Tags */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: activeFilter === 'all' ? '1.5px solid #0067b8' : '1px solid #e5e7eb',
                background: activeFilter === 'all' ? '#0067b8' : '#ffffff',
                color: activeFilter === 'all' ? '#ffffff' : '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: activeFilter === 'all' ? '0 2px 8px rgba(0, 103, 184, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              All Threads ({discussions.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('features')}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: activeFilter === 'features' ? '1.5px solid #0067b8' : '1px solid #e5e7eb',
                background: activeFilter === 'features' ? '#0067b8' : '#ffffff',
                color: activeFilter === 'features' ? '#ffffff' : '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Feature Requests
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('alpha')}
              style={{
                padding: '8px 20px',
                borderRadius: '30px',
                border: activeFilter === 'alpha' ? '1.5px solid #0067b8' : '1px solid #e5e7eb',
                background: activeFilter === 'alpha' ? '#0067b8' : '#ffffff',
                color: activeFilter === 'alpha' ? '#ffffff' : '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Alpha Testing
            </button>
          </div>

          <div style={{ fontSize: '13.5px', color: '#737373' }}>
            Moderated by <b>Sayan Maity</b> · Zero-telemetry policy
          </div>
        </div>

        {/* Start a Discussion Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e6e6e6',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            marginBottom: '44px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 103, 184, 0.1)', color: '#0067b8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1a1429', margin: 0 }}>Start a Community Discussion</h2>
              <p style={{ fontSize: '13.5px', color: '#737373', margin: 0 }}>Share feedback, ask for troubleshooting tips, or request new desktop modules.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#262626', marginBottom: '6px' }}>Your Name / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. A. Sen or Apex Logistics"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14.5px',
                    color: '#1a1429',
                    outline: 'none'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0067b8')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#262626', marginBottom: '6px' }}>Discussion Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Running Hospital HMS on networked clinic tablets"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14.5px',
                    color: '#1a1429',
                    outline: 'none'
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = '#0067b8')}
                  onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
                />
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#262626', marginBottom: '6px' }}>Detailed Message</label>
              <textarea
                placeholder="Write your question, suggestion, or test result here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14.5px',
                  color: '#1a1429',
                  outline: 'none',
                  resize: 'vertical'
                }}
                onFocus={e => (e.currentTarget.style.borderColor = '#0067b8')}
                onBlur={e => (e.currentTarget.style.borderColor = '#d1d5db')}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#0067b8',
                  color: '#ffffff',
                  padding: '11px 26px',
                  borderRadius: '30px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0, 103, 184, 0.3)',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => !submitting && (e.currentTarget.style.background = '#005da6')}
                onMouseLeave={e => !submitting && (e.currentTarget.style.background = '#0067b8')}
              >
                <Send size={15} />
                <span>{submitting ? 'Publishing...' : 'Publish Thread'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Discussions Feed List */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 500, color: '#1a1429', marginBottom: '20px' }}>
            Recent Community Threads ({discussions.length})
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {discussions.map(d => {
              const isLiked = likedPosts[d.id];
              return (
                <div
                  key={d.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e6e6e6',
                    borderRadius: '10px',
                    padding: '24px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    transition: 'border-color 0.15s ease'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#c7d2fe')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#e6e6e6')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0067b8', margin: 0 }}>
                      {d.topic}
                    </h3>
                    <span style={{ fontSize: '12.5px', color: '#8a8886' }}>{d.createdAt}</span>
                  </div>

                  <p style={{ fontSize: '15px', color: '#374151', lineHeight: 1.6, marginBottom: '18px', fontWeight: 350 }}>
                    {d.message}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '14px', fontSize: '13px', color: '#6b7280' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600 }}>
                        {d.author.charAt(0).toUpperCase()}
                      </div>
                      <span>Posted by <b style={{ color: '#111827' }}>{d.author}</b></span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleLike(d.id)}
                      style={{
                        background: isLiked ? 'rgba(0, 103, 184, 0.1)' : '#f3f4f6',
                        color: isLiked ? '#0067b8' : '#4b5563',
                        border: isLiked ? '1px solid rgba(0, 103, 184, 0.3)' : '1px solid #e5e7eb',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <ThumbsUp size={13} />
                      <span>{d.likes} Helpful</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <footer style={{ background: '#f2f2f2', borderTop: '1px solid #e6e6e6', padding: '40px 6% 30px 6%', fontSize: '13px', color: '#616161' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          <div>
            <b>ADIOS Community Forum</b> · Engineered for high-speed offline operations by Sayan Maity.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link href="/" style={{ color: '#0067b8', textDecoration: 'none' }}>Home</Link>
            <Link href="/product/personal" style={{ color: '#0067b8', textDecoration: 'none' }}>Suites</Link>
            <Link href="/cart" style={{ color: '#0067b8', textDecoration: 'none' }}>Pricing &amp; Cart</Link>
            <a href="https://github.com/sayanjc3639q/ADIOS" target="_blank" rel="noopener noreferrer" style={{ color: '#0067b8', textDecoration: 'none' }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
