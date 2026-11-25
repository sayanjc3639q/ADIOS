import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

// User Authentication (Sign In & Sign Up / Password verification)
export async function POST(req: NextRequest) {
  try {
    const { action, name, email, phone, password } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || '';
    const data = readData();

    let user = data.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (action === 'signup' || action === 'tester_signup') {
      if (user) {
        return NextResponse.json({ success: false, message: 'An account with this email already exists. Please sign in.' }, { status: 400 });
      }

      if (!name) {
        return NextResponse.json({ success: false, message: 'Name is required for registration.' }, { status: 400 });
      }

      if (!cleanPass || cleanPass.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long.' }, { status: 400 });
      }

      const isTester = action === 'tester_signup';
      const userRole = isTester ? 'tester' : 'user';

      const newUser = {
        id: data.users.length + 1,
        name: name.trim(),
        email: cleanEmail,
        phone: (phone || '').trim(),
        password: cleanPass,
        role: userRole,
        createdAt: new Date().toISOString().split('T')[0]
      };

      data.users.push(newUser);

      // If registered as tester, automatically provision a complimentary Alpha Testing Key
      if (isTester) {
        const testKey = `ADIOS-PERS-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const testerOrder = {
          id: `ORD-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
          userName: name.trim(),
          userEmail: cleanEmail,
          userPhone: (phone || '').trim(),
          amount: 0,
          utrNumber: 'ALPHA_TESTER_PROGRAM',
          plan: 'Personal Alpha Tester Key',
          status: 'Approved & Key Issued' as const,
          issuedKey: testKey,
          createdAt: new Date().toLocaleString()
        };
        data.orders.unshift(testerOrder);
      }

      writeData(data);

      return NextResponse.json({
        success: true,
        message: isTester 
          ? 'Tester account created! Your Alpha Testing Key has been activated.' 
          : 'Account created successfully!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role
        }
      });
    }

    // Default action: 'signin'
    if (!user) {
      // If user doesn't exist yet, we can gracefully prompt them to create an account or sign up
      return NextResponse.json({ success: false, message: 'Account not found. Please sign up to create your ADIOS account.' }, { status: 404 });
    }

    // If account has a password set, verify it
    if (user.password && user.password !== cleanPass) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Please try again.' }, { status: 401 });
    }

    // If account was created before password field existed, allow setting it on first sign-in
    if (!user.password && cleanPass) {
      user.password = cleanPass;
      writeData(data);
    }

    return NextResponse.json({
      success: true,
      message: 'Signed in successfully!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
