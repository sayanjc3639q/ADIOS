'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto', padding: '0 24px', color: 'var(--text)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <Link href="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>← Back to ADIOS Home</Link>
          <h1 style={{ fontSize: '30px', fontWeight: 800, marginTop: '8px' }}>ADIOS Community & Discussion</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ask questions, share desktop workflows, and talk with other ADIOS users.</p>
        </div>
      </div>

      {/* New Topic Card */}
      <div className="card" style={{ marginBottom: '36px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '14px' }}>Start a Discussion</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Your Name / Handle"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              required
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontSize: '14px' }}
            />
            <input
              type="text"
              placeholder="Discussion Topic / Title"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
              style={{ padding: '9px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontSize: '14px' }}
            />
          </div>
          <textarea
            placeholder="Share your thoughts, feature suggestions, or questions..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={3}
            required
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)', outline: 'none', fontSize: '14px', marginBottom: '12px', resize: 'vertical' }}
          />
          <button type="submit" disabled={submitting} className="btn btn-primary">
            {submitting ? 'Posting...' : 'Post to Community'}
          </button>
        </form>
      </div>

      {/* Discussions Feed */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>Recent Community Threads ({discussions.length})</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {discussions.map(d => (
            <div key={d.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#0369a1' }}>{d.topic}</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.createdAt}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.5, marginBottom: '12px' }}>{d.message}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                <span>Posted by <b>{d.author}</b></span>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{d.likes} reactions</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
