import { NextResponse } from 'next/server';
import { createPurchase, getPurchases } from '@/server/services/purchaseService';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const partyId = searchParams.get('partyId') || '';

    const purchases = await getPurchases({ partyId });

    return NextResponse.json({
      success: true,
      data: purchases,
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.partyId) {
      return NextResponse.json(
        { success: false, error: 'Farmer (Party) selection is required' },
        { status: 400 }
      );
    }

    if (!body.quantity || parseFloat(body.quantity) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid quantity is required' },
        { status: 400 }
      );
    }

    if (!body.rate || parseFloat(body.rate) <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid rate is required' },
        { status: 400 }
      );
    }

    const purchase = await createPurchase(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Crop purchase recorded successfully!',
        data: purchase,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error recording crop purchase:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record purchase' },
      { status: 500 }
    );
  }
}
