import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Nawaz Traders ERP is online and operational',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
