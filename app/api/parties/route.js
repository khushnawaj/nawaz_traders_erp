import { NextResponse } from 'next/server';
import { getAllParties, createParty, getPartySummaryStats } from '@/server/services/partyService';
import { partySchema } from '@/validations/partySchema';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const statsOnly = searchParams.get('statsOnly') === 'true';

    if (statsOnly) {
      const stats = await getPartySummaryStats();
      return NextResponse.json({ success: true, data: stats });
    }

    const [parties, stats] = await Promise.all([
      getAllParties({ search, role }),
      getPartySummaryStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: parties,
      stats,
    });
  } catch (error) {
    console.error('FULL API ERROR TRACE:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch parties' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = partySchema.parse(body);

    const party = await createParty(validatedData);

    return NextResponse.json({
      success: true,
      message: 'Party created successfully',
      data: party,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating party:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Validation Error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create party' },
      { status: 500 }
    );
  }
}
