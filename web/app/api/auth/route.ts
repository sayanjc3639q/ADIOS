import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, product_key } = await req.json();

    if (!email) {
      return NextResponse.json({ valid: false, message: 'Email required' }, { status: 400 });
    }

    // Product Key check
    if (product_key) {
      const trimmedKey = product_key.trim().toUpperCase();
      if (trimmedKey.startsWith('ADIOS-PRO') || trimmedKey.startsWith('ADIOS-LIFETIME')) {
        return NextResponse.json({
          valid: true,
          plan: 'pro_lifetime',
          message: 'Product key verified successfully. Cloud sync enabled.'
        });
      }
      return NextResponse.json({ valid: false, message: 'Invalid product key code.' }, { status: 401 });
    }

    // Default 3-day trial response
    return NextResponse.json({
      valid: true,
      plan: 'trial',
      message: 'Active 3-day cloud trial enabled.'
    });
  } catch (error: any) {
    return NextResponse.json({ valid: false, message: error.message }, { status: 500 });
  }
}
