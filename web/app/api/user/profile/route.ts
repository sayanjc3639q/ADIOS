import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/store';

// GET user profile and any verified product keys associated with user email
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email query parameter is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const data = readData();

    const user = data.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Find all orders associated with this email
    const userOrders = data.orders.filter(o => o.userEmail.toLowerCase() === cleanEmail);

    // Collect approved product keys
    const productKeys = userOrders
      .filter(o => o.status === 'Approved & Key Issued' && o.issuedKey)
      .map(o => ({
        key: o.issuedKey!,
        plan: o.plan,
        orderId: o.id,
        issuedAt: o.createdAt
      }));

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        createdAt: user.createdAt
      },
      orders: userOrders,
      productKeys
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
