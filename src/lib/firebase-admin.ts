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

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
          'Missing Firebase credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables.'
        );
      }

      // Replace escaped newlines with actual newlines for Vercel
      const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');

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
    initializeFirebaseAdmin();
    adminDb = admin.firestore();
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
