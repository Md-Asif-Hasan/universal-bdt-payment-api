import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let adminDb: admin.firestore.Firestore | null = null;
let adminAuth: admin.auth.Auth | null = null;
let initializationError: Error | null = null;

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      console.log('[Firebase] Checking env vars...');
      console.log(`  FIREBASE_PROJECT_ID: ${projectId ? 'SET' : 'MISSING'}`);
      console.log(`  FIREBASE_CLIENT_EMAIL: ${clientEmail ? 'SET' : 'MISSING'}`);
      console.log(`  FIREBASE_PRIVATE_KEY: ${privateKey ? 'SET (length: ' + privateKey.length + ')' : 'MISSING'}`);

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          `Missing Firebase credentials. FIREBASE_PROJECT_ID=${!!projectId}, FIREBASE_CLIENT_EMAIL=${!!clientEmail}, FIREBASE_PRIVATE_KEY=${!!privateKey}`
        );
      }

      // Replace escaped newlines with actual newlines for Vercel
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

      console.log('[Firebase] Initializing with cert...');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
      });
      console.log(`[Firebase] Initialized successfully with project: ${projectId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Firebase] Initialization error:', message);
      initializationError = error instanceof Error ? error : new Error(message);
      throw initializationError;
    }
  }
}

export function getAdminDb(): admin.firestore.Firestore {
  if (!adminDb) {
    try {
      initializeFirebaseAdmin();
      adminDb = admin.firestore();
    } catch (error) {
      // Re-throw to let caller handle the error
      throw error;
    }
  }
  return adminDb;
}

export function getAdminAuth(): admin.auth.Auth {
  if (!adminAuth) {
    initializeFirebaseAdmin();
    adminAuth = admin.auth();
  }
  return adminAuth;
}

export function getFirebaseStatus(): {
  initialized: boolean;
  error: string | null;
  hasServiceAccount: boolean;
  projectId: string | null;
} {
  return {
    initialized: getApps().length > 0,
    error: initializationError?.message || null,
    hasServiceAccount: !!(
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
    ),
    projectId: process.env.FIREBASE_PROJECT_ID || null,
  };
}
