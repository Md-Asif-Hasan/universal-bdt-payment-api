import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, trxId } = body;

    if (!requestId || !trxId) {
      return NextResponse.json({ error: 'requestId and trxId are required' }, { status: 400 });
    }

    const db = getAdminDb();
    const paymentRef = db.collection('payment_requests').doc(requestId);
    const paymentDoc = await paymentRef.get();

    if (!paymentDoc.exists) {
      return NextResponse.json({ error: 'Payment request not found' }, { status: 404 });
    }

    const paymentData = paymentDoc.data();
    if (paymentData?.status !== 'pending') {
      return NextResponse.json({ error: 'Payment request is not in pending status' }, { status: 400 });
    }

    await paymentRef.update({
      status: 'awaiting_verification',
      trxId,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'TrxID submitted for verification',
    });
  } catch (error) {
    console.error('Submit payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit TrxID' },
      { status: 500 }
    );
  }
}
