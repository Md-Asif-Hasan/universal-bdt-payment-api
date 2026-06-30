/**
 * In-memory test store for end-to-end testing without Firestore.
 * Used when Authorization header contains a "Bearer test-token-*" value.
 * Data resets on each server restart (fine for testing).
 */

export interface TestPaymentRequest {
  id: string;
  userId: string;
  plan: string;
  amount: number;
  status: 'pending' | 'awaiting_verification' | 'verified';
  createdAt: string;
  expiresAt: string;
  trxId?: string;
  submittedAt?: string;
  verifiedAt?: string;
  provider?: string;
  sender?: string;
  rawMessage?: string;
}

export interface TestSubscription {
  userId: string;
  plan: string;
  status: 'active' | 'expired';
  startDate: string;
  endDate: string;
  amount: number;
  paymentRequestId: string;
  expiredAt?: string;
}

// Global in-memory maps (persist within server process lifetime)
const paymentRequests = new Map<string, TestPaymentRequest>();
const subscriptions = new Map<string, TestSubscription>();

// Simple ID generator
function genId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getPlanAmount(plan: string): number {
  const amounts: Record<string, number> = {
    monthly: 99,
    quarterly: 249,
    yearly: 899,
    lifetime: 2999,
  };
  return amounts[plan] ?? 99;
}

function calculateEndDate(plan: string): string {
  const now = new Date();
  switch (plan) {
    case 'monthly':   now.setMonth(now.getMonth() + 1); break;
    case 'quarterly': now.setMonth(now.getMonth() + 3); break;
    case 'yearly':    now.setFullYear(now.getFullYear() + 1); break;
    case 'lifetime':  now.setFullYear(now.getFullYear() + 100); break;
    default:          now.setMonth(now.getMonth() + 1);
  }
  return now.toISOString();
}

export const testStore = {
  // --- Payment Requests ---

  createPayment(plan: string, userId: string): TestPaymentRequest {
    const id = genId();
    const req: TestPaymentRequest = {
      id,
      userId,
      plan,
      amount: getPlanAmount(plan),
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };
    paymentRequests.set(id, req);
    return req;
  },

  getPayment(id: string): TestPaymentRequest | undefined {
    return paymentRequests.get(id);
  },

  submitTrxId(id: string, trxId: string): { ok: boolean; error?: string } {
    const req = paymentRequests.get(id);
    if (!req) return { ok: false, error: 'Payment request not found' };
    if (req.status !== 'pending') return { ok: false, error: `Payment is already ${req.status}` };
    req.status = 'awaiting_verification';
    req.trxId = trxId;
    req.submittedAt = new Date().toISOString();
    paymentRequests.set(id, req);
    return { ok: true };
  },

  verifyBySms(trxId: string, amount: number, provider: string, sender: string, rawMessage: string): {
    ok: boolean; error?: string; duplicate?: boolean; requestId?: string; userId?: string; plan?: string;
  } {
    // Find awaiting_verification request matching the amount
    for (const [id, req] of paymentRequests.entries()) {
      if (req.status === 'awaiting_verification' && req.amount === amount) {
        // If a trxId was submitted, verify it matches
        if (req.trxId && req.trxId !== trxId) continue;

        req.status = 'verified';
        req.verifiedAt = new Date().toISOString();
        req.provider = provider;
        req.sender = sender;
        req.rawMessage = rawMessage;
        req.trxId = trxId;
        paymentRequests.set(id, req);

        // Create/update subscription
        const sub: TestSubscription = {
          userId: req.userId,
          plan: req.plan,
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: calculateEndDate(req.plan),
          amount: req.amount,
          paymentRequestId: id,
        };
        subscriptions.set(req.userId, sub);

        return { ok: true, requestId: id, userId: req.userId, plan: req.plan };
      }
      // Already verified — duplicate
      if (req.status === 'verified' && req.trxId === trxId) {
        return { ok: false, duplicate: true, error: 'Payment already verified' };
      }
    }
    return { ok: false, error: 'No matching awaiting_verification request found for this amount' };
  },

  expireSubscription(userId: string): { ok: boolean; error?: string; expiredAt?: string } {
    const sub = subscriptions.get(userId);
    if (!sub) {
      // Also check by userId in map values
      for (const [key, s] of subscriptions.entries()) {
        if (s.userId === userId) {
          s.status = 'expired';
          s.expiredAt = new Date().toISOString();
          subscriptions.set(key, s);
          return { ok: true, expiredAt: s.expiredAt };
        }
      }
      return { ok: false, error: 'No subscription found for this user' };
    }
    sub.status = 'expired';
    sub.expiredAt = new Date().toISOString();
    subscriptions.set(userId, sub);
    return { ok: true, expiredAt: sub.expiredAt };
  },
};

/** Returns true if the Authorization header is a valid test token */
export function isTestToken(authHeader: string | null): boolean {
  return !!authHeader && authHeader.startsWith('Bearer test-token-');
}

/** Extracts the userId/phone from a test token header */
export function getTestUserId(authHeader: string | null): string {
  if (!authHeader) return 'test_user';
  const token = authHeader.replace('Bearer test-token-', '');
  return token || 'test_user';
}
