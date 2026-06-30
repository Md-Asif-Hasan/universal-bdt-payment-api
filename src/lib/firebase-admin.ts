import * as admin from 'firebase-admin';

// ── Singleton initialisation ──────────────────────────────────────────────────
// On Vercel serverless, each invocation may be a cold start.
// We use the module-level variable as the singleton guard.

let _db:    admin.firestore.Firestore | null = null;
let _auth:  admin.auth.Auth           | null = null;
let initError: Error                  | null = null;

function getOrInitApp(): admin.app.App {
  // admin.apps is the global registry; use it as the guard
  if (admin.apps.length > 0 && admin.apps[0]) {
    return admin.apps[0];
  }

  const projectId   = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey  = process.env.FIREBASE_PRIVATE_KEY;

  console.log('[Firebase] Cold start — initialising...');
  console.log(`  PROJECT_ID:   ${projectId   ? projectId   : 'MISSING'}`);
  console.log(`  CLIENT_EMAIL: ${clientEmail ? '***SET***'  : 'MISSING'}`);
  console.log(`  PRIVATE_KEY:  ${privateKey  ? `${privateKey.length} chars` : 'MISSING'}`);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      `Missing Firebase credentials — PROJECT_ID:${!!projectId} CLIENT_EMAIL:${!!clientEmail} PRIVATE_KEY:${!!privateKey}`,
    );
  }

  // Vercel stores private key with literal \n — convert to real newlines
  const formattedKey = privateKey.replace(/\\n/g, '\n');

  const app = admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey: formattedKey }),
    // Note: do NOT set databaseURL here — it's for Realtime Database, not Firestore.
    // Firestore uses the project ID to derive its endpoint automatically.
  });

  console.log(`[Firebase] Initialised — project: ${projectId}`);
  return app;
}

export function getAdminDb(): admin.firestore.Firestore {
  if (_db) return _db;

  try {
    const app = getOrInitApp();
    _db = admin.firestore(app);
    // ignoreUndefinedProperties prevents errors when saving objects with undefined fields
    _db.settings({ ignoreUndefinedProperties: true });
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
    initialized:      admin.apps.length > 0,
    error:            initError?.message ?? null,
    hasServiceAccount: !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
    projectId: process.env.FIREBASE_PROJECT_ID ?? null,
  };
}
