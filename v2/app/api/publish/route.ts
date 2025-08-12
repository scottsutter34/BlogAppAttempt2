import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest){
  // Placeholder route for future Shopify/WordPress publish
  return NextResponse.json({ ok: true, message: 'Publish endpoint not yet implemented in web MVP.' });
}
