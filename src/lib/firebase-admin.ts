import * as admin from 'firebase-admin';
import { getFirestore, Settings } from 'firebase-admin/firestore';

// ─── Singleton ────────────────────────────────────────────────────────────────
// Vercel serverless: each cold-start re-runs module code, so we guard
// with admin.apps (the global Firebase app registry).

let _db:    admin.firestore.Firestore | null = null;
let _auth:  admin.auth.Auth           | null = null;
let initError: Error                  | null = null;

function getOrInitApp(): admin.app.App {
  if (admin.apps.length > 0 && admin.apps[0]) return admin.apps[0];

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  console.log('[Firebase] Cold start — initialising...');
  console.log(`  PROJECT_ID:   ${projectId   ?? 'MISSING'}`);
  console.log(`  CLIENT_EMAIL: ${clientEmail ? '***SET***' : 'MISSING'}`);
  console.log(`  PRIVATE_KEY:  ${privateKey  ? `${privateKey.length} chars` : 'MISSING'}`);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing Firebase env vars — PROJECT_ID:${!!projectId} CLIENT_EMAIL:${!!clientEmail} PRIVATE_KEY:${!!privateKey}`,
    );
  }

  // Vercel stores private key with literal \n — convert to actual newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey: formattedKey }),
  });

  console.log(`[Firebase] Initialised — project: ${projectId}`);
  return app;
}

export function getAdminDb(): admin.firestore.Firestore {
  if (_db) return _db;

  try {
    const app = getOrInitApp();

    // Use the modular getFirestore() API — it correctly resolves the database
    // location from the project metadata, avoiding the us-central1 default
    // that causes "5 NOT_FOUND" for databases in other regions (e.g. asia-southeast1).
    _db = getFirestore(app);

    const settings: Settings = {
      ignoreUndefinedProperties: true,
      // preferRest avoids gRPC channel issues in serverless environments
      preferRest: true,
    };
    _db.settings(settings);

    return _db;
  } catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
    console.error('[Firebase] getAdminDb error:', initError.message);
    throw initError;
  }
}

export function getAdminAuth(): admin.auth.Auth {
  if (_auth) return _auth;
  const app = getOrInitApp();
  _auth = admin.auth(app);
  return _auth;
}

export function getFirebaseStatus() {
  return {
    initialized:       admin.apps.length > 0,
    error:             initError?.message ?? null,
    hasServiceAccount: !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
    projectId: process.env.FIREBASE_PROJECT_ID ?? null,
  };
}
