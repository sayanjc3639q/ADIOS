import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/store';

// GET all orders & users (for admin panel)
export async function GET() {
  const data = readData();
  return NextResponse.json({ orders: data.orders, users: data.users });
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

    // Register user if not exists
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

    return NextResponse.json({ success: true, order: newOrder });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// PATCH to approve payment and issue key (Admin Action)
export async function PATCH(req: NextRequest) {
  try {
    const { orderId, action, customKey } = await req.json();
    const data = readData();
    const order = data.orders.find(o => o.id === orderId);

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'approve') {
      let prefix = 'ADIOS-PRO';
      const planLower = (order.plan || '').toLowerCase();
      if (planLower.includes('hospital')) prefix = 'ADIOS-HOSP';
      else if (planLower.includes('hotel')) prefix = 'ADIOS-HOTL';
      else if (planLower.includes('billing') || planLower.includes('pos')) prefix = 'ADIOS-BILL';
      else if (planLower.includes('academic') || planLower.includes('school')) prefix = 'ADIOS-ACAD';
      else if (planLower.includes('personal')) prefix = 'ADIOS-PERS';

      const generatedKey = customKey || `${prefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      order.status = 'Approved & Key Issued';
      order.issuedKey = generatedKey;
    } else if (action === 'reject') {
      order.status = 'Rejected';
    }

    writeData(data);
    return NextResponse.json({ success: true, order });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
