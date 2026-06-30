import { NextRequest, NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { testStore, isTestToken, getTestUserId } from '@/lib/test-store';

export const dynamic = 'force-dynamic';

function getPlanAmount(plan: string): number {
  const amounts: Record<string, number> = {
    monthly: 99,
    quarterly: 249,
    yearly: 899,
    lifetime: 2999,
  };
  return amounts[plan] ?? 99;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { plan, userId: bodyUserId } = body;

    if (!plan) {
      return NextResponse.json({ error: 'plan is required' }, { status: 400 });
    }

    // ── TEST MODE (no Firestore needed) ──────────────────────────────────────
    if (isTestToken(authHeader)) {
      const userId = getTestUserId(authHeader) || bodyUserId || 'test_user';
      const req = testStore.createPayment(plan, userId);
      return NextResponse.json({
        success: true,
        data: {
          requestId: req.id,
          ...req,
          expiry: req.expiresAt,
        },
      });
    }

    // ── PRODUCTION MODE ───────────────────────────────────────────────────────
    const db = getAdminDb();
    const paymentRef = db.collection('payment_requests').doc();
    const requestId = paymentRef.id;

    const paymentData = {
      id: requestId,
      userId: bodyUserId || 'anonymous',
      plan,
      amount: getPlanAmount(plan),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    await paymentRef.set(paymentData);

    return NextResponse.json({
      success: true,
      data: {
        requestId,
        ...paymentData,
        expiry: paymentData.expiresAt,
      },
    });
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create payment request' },
      { status: 500 }
    );
  }
}
