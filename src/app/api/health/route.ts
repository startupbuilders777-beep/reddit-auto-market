import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'reddit-auto-market',
    version: process.env.npm_package_version || '1.0.0'
  });
}
