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
      {
        id: 1,
        name: 'Sayan Maity',
        email: 'jcsayan7@gmail.com',
        phone: '+91 9876543210',
        role: 'admin',
        createdAt: '2026-11-21',
        password: process.env.ADMIN_PASSWORD || 'adios@Admin2026!'
      }
    ],
    orders: [],
    discussions: []
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
