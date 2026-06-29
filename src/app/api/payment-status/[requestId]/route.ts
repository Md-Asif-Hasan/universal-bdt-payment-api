import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;

    const db = getAdminDb();
    const paymentRef = db.collection('payment_requests').doc(requestId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    const paymentData = paymentDoc.data();

    return NextResponse.json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    console.error('Payment status error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get payment status' },
      { status: 500 }
    );
  }
}
