import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  const startTime = Date.now();

  try {
    // Check PostgreSQL database connectivity
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - startTime;

    // Node process stats
    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());

    return NextResponse.json({
      status: 'HEALTHY',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      database: {
        status: 'CONNECTED',
        latencyMs: `${dbLatencyMs}ms`,
      },
      system: {
        uptimeSeconds: `${uptimeSeconds}s`,
        memoryRssMb: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapUsedMb: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'UNHEALTHY',
        timestamp: new Date().toISOString(),
        database: {
          status: 'DISCONNECTED',
          error: error.message,
        },
      },
      { status: 500 }
    );
  }
}
