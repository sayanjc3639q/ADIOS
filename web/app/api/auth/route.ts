import { NextRequest, NextResponse } from 'next/server';
import { getAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email, product_key } = await req.json();

    if (!email) {
      return NextResponse.json({ valid: false, message: 'Email required' }, { status: 400 });
    }

    // Product Key check across ADIOS software suite
    if (product_key) {
      const trimmedKey = product_key.trim().toUpperCase();
      
      const productPrefixes: { [prefix: string]: string } = {
        'ADIOS-PRO': 'pro_lifetime',
        'ADIOS-LIFETIME': 'pro_lifetime',
        'ADIOS-PERS': 'personal_pro',
        'ADIOS-HOSP': 'hospital_enterprise',
        'ADIOS-HOTL': 'hotel_enterprise',
        'ADIOS-BILL': 'billing_pos',
        'ADIOS-ACAD': 'academics_enterprise'
      };

      const matchedPrefix = Object.keys(productPrefixes).find(prefix => trimmedKey.startsWith(prefix));

      if (matchedPrefix) {
        return NextResponse.json({
          valid: true,
          plan: productPrefixes[matchedPrefix],
          product: matchedPrefix.replace('ADIOS-', ''),
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
