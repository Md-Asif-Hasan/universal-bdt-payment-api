#!/usr/bin/env node

/**
 * Configuration verification script for Vercel Firebase deployment
 * Run this locally to check your setup before deploying
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Firebase Configuration Verification\n');
console.log('═'.repeat(60));

// Check environment files
const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env.local');
const examplePath = path.join(rootDir, '.env.example');

console.log('\n📁 Environment Files:\n');

if (fs.existsSync(envPath)) {
  console.log('✅ .env.local exists');
  const content = fs.readFileSync(envPath, 'utf-8');
  
  const hasProjectId = content.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  const hasServiceAccount = content.includes('FIREBASE_SERVICE_ACCOUNT_KEY');
  
  console.log(`   NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${hasProjectId ? '✅ SET' : '❌ MISSING'}`);
  console.log(`   FIREBASE_SERVICE_ACCOUNT_KEY: ${hasServiceAccount ? '✅ SET' : '❌ MISSING'}`);
  
  // Show partial project ID
  if (hasProjectId) {
    const projectIdLine = content.split('\n').find(line => line.includes('NEXT_PUBLIC_FIREBASE_PROJECT_ID'));
    console.log(`   Value: ${projectIdLine?.split('=')[1]?.trim()}`);
  }
} else {
  console.log('❌ .env.local NOT FOUND');
  console.log('   Create .env.local with your environment variables');
}

console.log('\n📊 Current Vercel Environment:\n');

console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '❌ NOT SET'}`);
console.log(`Service Account: ${process.env.FIREBASE_SERVICE_ACCOUNT_KEY ? '✅ SET (length: ' + process.env.FIREBASE_SERVICE_ACCOUNT_KEY.length + ' chars)' : '❌ NOT SET'}`);

// Check if service account key is parseable
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  try {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    console.log('Service Account JSON: ✅ Valid JSON');
    console.log('  project_id:', sa.project_id);
    console.log('  client_email:', sa.client_email);
  } catch (e) {
    console.log('Service Account JSON: ❌ Invalid JSON');
    console.log('  Error:', e.message);
  }
}

console.log('\n📋 Vercel Dashboard Checklist:\n');
console.log('Go to: https://vercel.com/dashboard');
console.log('Select your project → Settings → Environment Variables');
console.log('');
console.log('Verify these variables exist:');
console.log('  ✅ NEXT_PUBLIC_FIREBASE_PROJECT_ID = taka-jachai-16768');
console.log('  ✅ FIREBASE_SERVICE_ACCOUNT_KEY = (entire JSON file content)');
console.log('');
console.log('Important:');
console.log('  • FIREBASE_SERVICE_ACCOUNT_KEY must be a SINGLE string');
console.log('  • The JSON should include: type, project_id, private_key, client_email');
console.log('  • Do NOT escape quotes or newlines manually');
console.log('');

console.log('📝 Files in this project:\n');
console.log('  Service account key file:');
console.log('  ' + path.join(rootDir, 'taka-jachai-16768-firebase-adminsdk-fbsvc-70ab078ed4.json'));

if (fs.existsSync(path.join(rootDir, 'taka-jachai-16768-firebase-adminsdk-fbsvc-70ab078ed4.json'))) {
  console.log('  ✅ File exists - open and verify its contents');
}

console.log('\n🔧 Manual Verification:\n');
console.log('1. Open: taka-jachai-16768-firebase-adminsdk-fbsvc-70ab078ed4.json');
console.log('2. Verify these fields:');
console.log('   {');
console.log('     "type": "service_account",');
console.log('     "project_id": "taka-jachai-16768",');
console.log('     "client_email": "firebase-adminsdk-xxxxx@taka-jachai-16768.iam.gserviceaccount.com",');
console.log('     ...');
console.log('   }');
console.log('');
console.log('3. Copy the ENTIRE JSON (Ctrl+A, Ctrl+C)');
console.log('4. In Vercel, add as FIREBASE_SERVICE_ACCOUNT_KEY');
console.log('5. Select ALL environments (Production, Preview, Development)');
console.log('');

console.log('═'.repeat(60));
console.log('\n📝 Summary:\n');

const projectIdSet = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const serviceAccountSet = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (projectIdSet && serviceAccountSet) {
  console.log('✅ Local setup looks correct!');
  console.log('Now add FIREBASE_SERVICE_ACCOUNT_KEY to Vercel dashboard.');
} else if (!projectIdSet) {
  console.log('❌ Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID');
} else {
  console.log('❌ Missing FIREBASE_SERVICE_ACCOUNT_KEY');
  console.log('This is likely the root cause of your NOT_FOUND error.');
}
console.log('');
