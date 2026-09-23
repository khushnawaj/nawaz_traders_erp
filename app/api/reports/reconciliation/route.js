import { NextResponse } from 'next/server';
import { runLedgerReconciliation } from '@/server/services/reconciliationService';

export async function GET() {
  try {
    const report = await runLedgerReconciliation();
    return NextResponse.json({ success: true, report });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
