import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// JSON database file for web platform state (orders, community, etc.)
const DB_FILE = path.join(process.cwd(), 'web_data.json');

interface AdminLockout {
  failedAttempts: number;
  lockedUntil: number | null; // timestamp in ms
}

interface WebData {
  adminLockout?: AdminLockout;
  users: Array<{ id: number; name: string; email: string; phone: string; password?: string; role: string; createdAt: string }>;
  orders: Array<{
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
  }>;
  discussions: Array<{
    id: number;
    author: string;
    authorEmail: string;
    topic: string;
    message: string;
    likes: number;
    createdAt: string;
  }>;
}

function getInitialData(): WebData {
  return {
    adminLockout: {
      failedAttempts: 0,
      lockedUntil: null
    },
    users: [
      { id: 1, name: 'Sayan Maity', email: 'jcsayan7@gmail.com', phone: '+91 9876543210', role: 'admin', createdAt: '2026-11-20' },
      { id: 2, name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '+91 9811122233', role: 'user', createdAt: '2026-11-21' }
    ],
    orders: [
      {
        id: 'ORD-9021',
        userName: 'Rahul Sharma',
        userEmail: 'rahul.s@example.com',
        userPhone: '+91 9811122233',
        amount: 999,
        utrNumber: 'UPI442981029481',
        plan: 'Pro Lifetime',
        status: 'Pending Verification',
        createdAt: '2026-11-22 09:30'
      }
    ],
    discussions: [
      {
        id: 1,
        author: 'Rahul Sharma',
        authorEmail: 'rahul.s@example.com',
        topic: 'How does rolling local backup work?',
        message: 'Loving the speed of ADIOS! Does the backup snapshot retain SQLite attachments as well?',
        likes: 4,
        createdAt: '2026-11-22 10:15'
      },
      {
        id: 2,
        author: 'Sayan Maity',
        authorEmail: 'jcsayan7@gmail.com',
        topic: 'Linux & Windows Cross Compatibility',
        message: 'Both Windows setup and Linux packages use the identical SQLite schema so you can copy your db across machines effortlessly.',
        likes: 9,
        createdAt: '2026-11-22 11:00'
      }
    ]
  };
}

export function readData(): WebData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return getInitialData();
  }
}

export function writeData(data: WebData) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
