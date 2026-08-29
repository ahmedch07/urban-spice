import { NextResponse } from 'next/server';
import { getPublicMenu } from '@/lib/public-menu';

// Deliberately limited public projection; management data stays behind staff APIs.
export async function GET() {
  try {
    return NextResponse.json(await getPublicMenu());
  } catch (error) {
    console.error('Public menu error:', error);
    return NextResponse.json({ error: 'Unable to load menu' }, { status: 500 });
  }
}
