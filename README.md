# Taka Jachai API

A minimal Next.js API for Firestore operations used by the Payment Bridge system.

## Purpose

This API provides authenticated Firestore operations for the Cloudflare Worker to interact with Firebase Firestore. It acts as a secure bridge between the Cloudflare Worker and Firebase.

## Architecture

```
Cloudflare Worker → Next.js API (Vercel) → Firestore
```

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
BRIDGE_SECRET_KEY=bridge-secret-2026-taka-jachai
NEXT_PUBLIC_FIREBASE_PROJECT_ID=taka-jachai-app
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'  # Optional
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

API will be available at `http://localhost:3000/api/firestore`

## Build

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option 2: Vercel Dashboard

1. Push this directory to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `BRIDGE_SECRET_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` (optional)
4. Deploy

### Option 3: Vercel via Git

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

Then import in Vercel.

## API Endpoints

### GET /api/firestore

Query or get a document.

**Query Parameters:**
- `path` - Document path (e.g., `users/abc123`)
- `collection` - Collection name (e.g., `users`)
- `filterField` - Field to filter by (optional)
- `filterValue` - Value to filter by (optional)

**Headers:**
- `Authorization: Bearer <BRIDGE_SECRET_KEY>`

**Example:**
```bash
curl "https://your-api.vercel.app/api/firestore?path=users/abc123" \
  -H "Authorization: Bearer bridge-secret-2026-taka-jachai"
```

### POST /api/firestore

Create a document.

**Body:**
```json
{
  "path": "users/abc123",
  "data": {
    "name": "John",
    "email": "john@example.com"
  }
}
```

**Headers:**
- `Authorization: Bearer <BRIDGE_SECRET_KEY>`

### PUT /api/firestore

Update a document.

**Body:**
```json
{
  "path": "users/abc123",
  "data": {
    "name": "John Updated"
  }
}
```

**Headers:**
- `Authorization: Bearer <BRIDGE_SECRET_KEY>`

### DELETE /api/firestore

Delete a document.

**Query Parameters:**
- `path` - Document path

**Headers:**
- `Authorization: Bearer <BRIDGE_SECRET_KEY>`

## Security

- All endpoints require `BRIDGE_SECRET_KEY` authentication
- Only Cloudflare Worker with the secret can access
- Firebase Admin SDK uses service account for Firestore access

## Firebase Setup

### Option 1: Service Account Key (Recommended)

1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate a new private key
3. Add to Vercel environment variables as `FIREBASE_SERVICE_ACCOUNT_KEY`

### Option 2: Application Default Credentials

For local development, set:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
```

## After Deployment

1. Copy the Vercel URL (e.g., `https://taka-jachai-api.vercel.app`)
2. Update `NEXTJS_API_URL` in Cloudflare Worker's `wrangler.toml`
3. Deploy Cloudflare Worker

## Troubleshooting

### 401 Unauthorized

- Check `BRIDGE_SECRET_KEY` matches between Worker and API
- Verify Authorization header format: `Bearer <secret>`

### Firestore Connection Error

- Verify Firebase project ID is correct
- Check service account key is valid
- Ensure Firestore is enabled in Firebase Console

### Build Errors

- Run `npm install` to install dependencies
- Check Node.js version (18+ required)
