import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';
import { getAdminSupabase } from '@/lib/supabase';

// GET all orders & users (for admin panel)
// Synchronizes data from Supabase Cloud with local fallback store
export async function GET() {
  const localData = readData();

  try {
    const supaAdmin = getAdminSupabase();

    // Fetch from Supabase tables
    const [usersRes, ordersRes, licensesRes] = await Promise.all([
      supaAdmin.from('profiles').select('*'),
      supaAdmin.from('orders').select('*'),
      supaAdmin.from('product_licenses').select('*')
    ]);

    let combinedUsers = [...localData.users];
    let combinedOrders = [...localData.orders];

    if (!usersRes.error && usersRes.data) {
      // Merge Cloud Profiles
      for (const p of usersRes.data) {
        if (!combinedUsers.some(u => u.email.toLowerCase() === p.email.toLowerCase())) {
          combinedUsers.push({
            id: combinedUsers.length + 1,
            name: p.full_name || p.email.split('@')[0],
            email: p.email,
            phone: p.phone || '',
            role: p.role || 'user',
            createdAt: p.created_at ? p.created_at.split('T')[0] : '2026-11-26'
          });
        }
      }
    }

    if (!ordersRes.error && ordersRes.data) {
      for (const o of ordersRes.data) {
        if (!combinedOrders.some(co => co.id === o.id || co.utrNumber === o.utr_number)) {
          combinedOrders.unshift({
            id: o.id,
            userName: o.user_name,
            userEmail: o.user_email,
            userPhone: o.user_phone || '',
            amount: Number(o.amount),
            utrNumber: o.utr_number,
            plan: o.plan,
            status: o.status as any,
            issuedKey: o.issued_license_key,
            createdAt: o.created_at
          });
        }
      }
    }

    return NextResponse.json({
      orders: combinedOrders,
      users: combinedUsers,
      source: 'synchronized'
    });
  } catch {
    // Return local store seamlessly if network/cloud is offline
    return NextResponse.json({
      orders: localData.orders,
      users: localData.users,
      source: 'local'
    });
  }
}

// POST new purchase order with UPI UTR / Transaction Ref
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, utrNumber, amount, plan } = body;

    if (!name || !email || !utrNumber) {
      return NextResponse.json({ error: 'Name, email and UPI Ref / UTR number are required.' }, { status: 400 });
    }

    const data = readData();

    // Register user if not exists locally
    let existingUser = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!existingUser) {
      existingUser = {
        id: data.users.length + 1,
        name,
        email,
        phone: phone || '',
        role: 'customer',
        createdAt: new Date().toISOString().split('T')[0]
      };
      data.users.push(existingUser);
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      userName: name,
      userEmail: email,
      userPhone: phone || '',
      amount: amount || 999,
      utrNumber: utrNumber.trim(),
      plan: plan || 'Pro Lifetime',
      status: 'Pending Verification' as const,
      createdAt: new Date().toLocaleString()
    };

    data.orders.unshift(newOrder);
    writeData(data);

    // Try inserting into Supabase orders
    try {
      const supaAdmin = getAdminSupabase();
      await supaAdmin.from('orders').insert({
        id: orderId,
        user_name: name,
        user_email: email,
        user_phone: phone || '',
        amount: amount || 999,
        utr_number: utrNumber.trim(),
        plan: plan || 'Pro Lifetime',
        status: 'Pending Verification'
      });
    } catch {
      // Offline-safe fallback
    }

    return NextResponse.json({ success: true, order: newOrder });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH to approve payment, issue key, or manage users (Admin Action)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, action, customKey, userId, newRole, deleteUser } = await req.json();
    const data = readData();

    // 1. ADMIN USER MANAGEMENT ACTION
    if (userId && (newRole || deleteUser)) {
      const userIdx = data.users.findIndex(u => u.id === userId || (u as any).email === userId);
      if (userIdx >= 0) {
        if (deleteUser) {
          data.users.splice(userIdx, 1);
        } else if (newRole) {
          data.users[userIdx].role = newRole;
        }
        writeData(data);

        // Try updating Supabase
        try {
          const supaAdmin = getAdminSupabase();
          if (newRole) {
            await supaAdmin.from('profiles').update({ role: newRole }).eq('id', userId);
          }
        } catch {
          // Fallback cleanly
        }

        return NextResponse.json({ success: true, message: 'User updated successfully.' });
      }
    }

    // 2. ORDER APPROVAL / REJECTION & PRODUCT KEY ISSUANCE
    const order = data.orders.find(o => o.id === orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'approve') {
      let prefix = 'ADIOS-PRO';
      let suite = 'ALL';
      let planTier = 'personal_pro';
      const planLower = (order.plan || '').toLowerCase();

      if (planLower.includes('hospital')) {
        prefix = 'ADIOS-HOSP';
        suite = 'HOSPITAL';
        planTier = 'hospital_enterprise';
      } else if (planLower.includes('hotel')) {
        prefix = 'ADIOS-HOTL';
        suite = 'HOTEL';
        planTier = 'hotel_enterprise';
      } else if (planLower.includes('billing') || planLower.includes('pos')) {
        prefix = 'ADIOS-BILL';
        suite = 'BILLING';
        planTier = 'billing_pos';
      } else if (planLower.includes('academic') || planLower.includes('school')) {
        prefix = 'ADIOS-ACAD';
        suite = 'ACADEMICS';
        planTier = 'academics_enterprise';
      } else if (planLower.includes('personal')) {
        prefix = 'ADIOS-PERS';
        suite = 'PERSONAL';
        planTier = 'personal_pro';
      } else if (planLower.includes('enterprise') || planLower.includes('pack')) {
        prefix = 'ADIOS-ENT';
        suite = 'ALL';
        planTier = 'enterprise_pack';
      }

      const generatedKey = customKey || `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      order.status = 'Approved & Key Issued';
      order.issuedKey = generatedKey;

      // Sync approved license to Supabase Cloud product_licenses
      try {
        const supaAdmin = getAdminSupabase();
        await supaAdmin.from('product_licenses').insert({
          user_email: order.userEmail,
          license_key: generatedKey,
          plan_tier: planTier,
          product_suite: suite,
          status: 'active'
        });

        await supaAdmin.from('orders').update({
          status: 'Approved & Key Issued',
          issued_license_key: generatedKey
        }).eq('id', order.id);
      } catch {
        // Fallback locally
      }
    } else if (action === 'reject') {
      order.status = 'Rejected';
      try {
        const supaAdmin = getAdminSupabase();
        await supaAdmin.from('orders').update({ status: 'Rejected' }).eq('id', order.id);
      } catch {
        // Fallback locally
      }
    }

    writeData(data);
    return NextResponse.json({ success: true, order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
