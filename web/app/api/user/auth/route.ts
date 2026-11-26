import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';
import { supabase } from '@/lib/supabase';

// User Authentication & Profile Management:
// Handles Sign In, Sign Up, Profile Updates, and Password Changes
// Integrates Supabase Auth with robust local persistence fallback
export async function POST(req: NextRequest) {
  try {
    const { action, name, email, phone, password, currentPassword, newPassword } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password || '';
    const data = readData();

    // 1. CHANGE PASSWORD ACTION
    if (action === 'change_password') {
      const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
      }

      if (user.password) {
        if (!currentPassword) {
          return NextResponse.json({ success: false, message: 'Current password is required to change password.' }, { status: 400 });
        }
        if (user.password !== currentPassword) {
          return NextResponse.json({ success: false, message: 'Current password does not match.' }, { status: 401 });
        }
      }

      if (!newPassword || newPassword.length < 6) {
        return NextResponse.json({ success: false, message: 'New password must be at least 6 characters.' }, { status: 400 });
      }

      // Update password
      user.password = newPassword;
      writeData(data);

      // Attempt Supabase password update if reachable
      try {
        await supabase.auth.updateUser({ password: newPassword });
      } catch {
        // Fallback cleanly
      }

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully.'
      });
    }

    // 2. UPDATE PROFILE DETAILS ACTION
    if (action === 'update_profile') {
      const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
      }

      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();

      writeData(data);

      return NextResponse.json({
        success: true,
        message: 'Profile information updated successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      });
    }

    // 3. REGISTRATION / SIGN UP ACTION
    if (action === 'signup' || action === 'tester_signup') {
      let user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (user) {
        return NextResponse.json({ success: false, message: 'An account with this email already exists. Please sign in.' }, { status: 400 });
      }

      if (!name) {
        return NextResponse.json({ success: false, message: 'Name is required for registration.' }, { status: 400 });
      }

      if (!cleanPass || cleanPass.length < 6) {
        return NextResponse.json({ success: false, message: 'Password must be at least 6 characters long.' }, { status: 400 });
      }

      // Attempt Supabase sign up first
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPass,
          options: {
            data: { full_name: name.trim(), phone: (phone || '').trim() }
          }
        });
      } catch {
        // Continues with local persistence if Supabase network is unavailable
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

    // 4. SIGN IN ACTION
    // Attempt Supabase auth first
    try {
      const { data: supaData, error: supaErr } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPass
      });

      if (!supaErr && supaData?.user) {
        // Find or sync to local store
        let user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
        if (!user) {
          user = {
            id: data.users.length + 1,
            name: supaData.user.user_metadata?.full_name || cleanEmail.split('@')[0],
            email: cleanEmail,
            phone: supaData.user.user_metadata?.phone || '',
            password: cleanPass,
            role: 'user',
            createdAt: new Date().toISOString().split('T')[0]
          };
          data.users.push(user);
          writeData(data);
        }

        return NextResponse.json({
          success: true,
          message: 'Signed in successfully via Supabase!',
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        });
      }
    } catch {
      // Supabase server connection error, smoothly fall back to local authentication
    }

    // Local authentication fallback
    let user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Account not found. Please sign up to create your ADIOS account.' }, { status: 404 });
    }

    if (!cleanPass) {
      return NextResponse.json({ success: false, message: 'Password is required to sign in.' }, { status: 400 });
    }

    if (user.password && user.password !== cleanPass) {
      return NextResponse.json({ success: false, message: 'Incorrect password. Please try again.' }, { status: 401 });
    }

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
