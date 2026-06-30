import { NextRequest, NextResponse } from 'next/server';
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.BRIDGE_SECRET_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result: Record<string, any> = {
    env: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL ? '***SET***' : 'MISSING',
      privateKey: process.env.FIREBASE_PRIVATE_KEY ? `SET (${process.env.FIREBASE_PRIVATE_KEY.length} chars)` : 'MISSING',
    },
  };

  // Initialize Firebase Admin with the service account
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      return NextResponse.json({ error: 'Missing Firebase credentials' }, { status: 500 });
    }

    const formattedKey = privateKey.replace(/\\n/g, '\n');

    // Initialize app
    const app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey: formattedKey }),
      projectId: projectId,
    }, 'diagnostic');

    result.appInitialized = true;

    // Try different database IDs
    const databaseIdsToTry = ['(default)', 'default', '(firestore)'];
    const testResults: Record<string, any> = {};

    for (const dbId of databaseIdsToTry) {
      try {
        const db = getFirestore(app, dbId);
        const cols = await db.listCollections();
        testResults[dbId] = {
          success: true,
          collections: cols.map((c) => c.id),
        };
      } catch (e: any) {
        testResults[dbId] = {
          success: false,
          error: e.message,
          code: e.code,
        };
      }
    }

    result.databaseTests = testResults;

    // Try without database ID (auto-detect)
    try {
      const db = getFirestore(app);
      const cols = await db.listCollections();
      result.autoDetect = {
        success: true,
        collections: cols.map((c) => c.id),
      };
    } catch (e: any) {
      result.autoDetect = {
        success: false,
        error: e.message,
        code: e.code,
      };
    }

    await app.delete();
  } catch (e: any) {
    result.error = {
      message: e.message,
      code: e.code,
      stack: e.stack,
    };
  }

  return NextResponse.json(result);
}
