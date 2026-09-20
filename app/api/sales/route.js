import { NextResponse } from 'next/server';
import { createSale, getSales } from '@/server/services/saleService';
import { requireApiAuth } from '@/lib/auth/apiAuth';

export async function GET(request) {
  try {
    const { errorResponse } = await requireApiAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId') || '';
    const godownId = searchParams.get('godownId') || '';
    const paymentStatus = searchParams.get('paymentStatus') || '';

    const sales = await getSales({ partyId, godownId, paymentStatus });

    return NextResponse.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { errorResponse } = await requireApiAuth(request);
    if (errorResponse) return errorResponse;

    const body = await request.json();

    if (!body.partyId) {
      return NextResponse.json(
        { success: false, error: 'Customer / Rice Mill selection is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || parseFloat(body.quantity) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid grain quantity is required' },
        { status: 400 }
      );
    }

    if (!body.rate || parseFloat(body.rate) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid rate is required' },
        { status: 400 }
      );
    }

    const sale = await createSale(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Grain Sale Invoice recorded successfully!',
        data: sale,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording grain sale:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record sale' },
      { status: 500 }
    );
  }
}
