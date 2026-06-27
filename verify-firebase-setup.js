#!/usr/bin/env node

/**
 * Verification script for Firebase setup
 * Checks if FIREBASE_SERVICE_ACCOUNT_KEY is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Setup Verification\n');

// Check environment variables
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, '.env.example');

console.log('1. Checking environment files:');
if (fs.existsSync(envPath)) {
  console.log('   ✅ .env.local exists');
  const content = fs.readFileSync(envPath, 'utf-8');
  if (content.includes('FIREBASE_SERVICE_ACCOUNT_KEY')) {
    console.log('   ✅ FIREBASE_SERVICE_ACCOUNT_KEY found');
  } else {
    console.log('   ⚠️  FIREBASE_SERVICE_ACCOUNT_KEY not in .env.local (OK for local if using defaults)');
  }
} else {
  console.log('   ⚠️  .env.local not found');
}

if (fs.existsSync(envExamplePath)) {
  console.log('   ✅ .env.example exists');
}

console.log('\n2. Checking Firebase admin library:');
try {
  require('firebase-admin');
  console.log('   ✅ firebase-admin installed');
} catch (e) {
  console.log('   ❌ firebase-admin not installed');
}

console.log('\n3. Firebase configuration summary:');
console.log('   Project ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'NOT SET');
console.log('   Service Account Key:', process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ SET' : '❌ NOT SET (required for Vercel)');

console.log('\n4. Environment check:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Node version:', process.version);

console.log('\n📋 Next Steps for Vercel Deployment:\n');
console.log('1. Get your service account key from Firebase Console:');
console.log('   - Go to: https://console.firebase.google.com/');
console.log('   - Select project: taka-jachai-16768');
console.log('   - Settings → Service Accounts → Generate New Private Key');
console.log('');
console.log('2. Add to Vercel environment variables:');
console.log('   - Go to: https://vercel.com/dashboard');
console.log('   - Select project: taka-jachai-api');
console.log('   - Settings → Environment Variables');
console.log('   - Add new variable:');
console.log('     Name: FIREBASE_SERVICE_ACCOUNT_KEY');
console.log('     Value: (paste entire JSON from service account key)');
console.log('');
console.log('3. Redeploy the project:');
console.log('   - Vercel will automatically redeploy when env vars change');
console.log('');
console.log('4. Test the deployment:');
console.log('   curl https://taka-jachai-api.vercel.app/api/health');
console.log('');
console.log('✨ Done!\n');
