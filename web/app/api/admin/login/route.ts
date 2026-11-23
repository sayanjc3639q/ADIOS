import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'jcsayan7@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'adios@Admin2026!';
const LOCKOUT_DURATION_MS = 60 * 60 * 1000; // 1 hour lockout

export async function GET() {
  const data = readData();
  const lockout = data.adminLockout || { failedAttempts: 0, lockedUntil: null };
  const now = Date.now();

  const isLocked = lockout.lockedUntil !== null && lockout.lockedUntil > now;
  const remainingSeconds = isLocked ? Math.ceil((lockout.lockedUntil! - now) / 1000) : 0;

  return NextResponse.json({
    isLocked,
    remainingSeconds,
    failedAttempts: lockout.failedAttempts
  });
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const data = readData();
    const lockout = data.adminLockout || { failedAttempts: 0, lockedUntil: null };
    const now = Date.now();

    // Check if account is currently locked out
    if (lockout.lockedUntil && lockout.lockedUntil > now) {
      const remainingMinutes = Math.ceil((lockout.lockedUntil - now) / (60 * 1000));
      return NextResponse.json({
        success: false,
        locked: true,
        remainingMinutes,
        message: `Account is locked due to multiple incorrect password attempts. Please try again in ${remainingMinutes} minute(s).`
      }, { status: 423 });
    }

    // Reset lock if expired
    if (lockout.lockedUntil && lockout.lockedUntil <= now) {
      lockout.failedAttempts = 0;
      lockout.lockedUntil = null;
    }

    const trimmedEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '');

    if (trimmedEmail === ADMIN_EMAIL.toLowerCase() && cleanPassword === ADMIN_PASSWORD) {
      // Successful login -> reset failed attempts
      lockout.failedAttempts = 0;
      lockout.lockedUntil = null;
      data.adminLockout = lockout;
      writeData(data);

      return NextResponse.json({
        success: true,
        message: 'Admin authenticated successfully',
        admin: {
          email: ADMIN_EMAIL,
          role: 'super_admin'
        }
      });
    }

    // Wrong password / credentials
    lockout.failedAttempts = (lockout.failedAttempts || 0) + 1;

    // Check for 2 failed attempts -> lock for 1 hour
    if (lockout.failedAttempts >= 2) {
      lockout.lockedUntil = now + LOCKOUT_DURATION_MS;
      data.adminLockout = lockout;
      writeData(data);

      return NextResponse.json({
        success: false,
        locked: true,
        remainingMinutes: 60,
        message: 'Security Alert: Account locked for 1 hour due to 2 consecutive incorrect password attempts.'
      }, { status: 423 });
    } else {
      data.adminLockout = lockout;
      writeData(data);

      return NextResponse.json({
        success: false,
        locked: false,
        remainingAttempts: 2 - lockout.failedAttempts,
        message: `Incorrect credentials. Warning: 1 attempt remaining before 1-hour account lockout.`
      }, { status: 401 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
