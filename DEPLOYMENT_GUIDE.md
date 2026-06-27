# Taka Jachai API - Deployment Guide

## Quick Deployment to Vercel

### Step 1: Install Dependencies

```bash
cd "E:\Special Project\TAKA JACHAI\taka-jachai-api"
npm install
```

### Step 2: Set Environment Variables

Create `.env.local` file:

```bash
BRIDGE_SECRET_KEY=bridge-secret-2026-taka-jachai
NEXT_PUBLIC_FIREBASE_PROJECT_ID=taka-jachai-app
```

**Optional:** Add Firebase service account key for production:
```bash
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
```

### Step 3: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts:
- Set project name: `taka-jachai-api`
- Link to existing project? No
- Override settings? No

#### Option B: Vercel Dashboard

1. Push to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "Add New Project"
4. Import your GitHub repository
5. Add environment variables:
   - `BRIDGE_SECRET_KEY` = `bridge-secret-2026-taka-jachai`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `taka-jachai-app`
   - `FIREBASE_SERVICE_ACCOUNT_KEY` = (your service account JSON, optional)
6. Click "Deploy"

### Step 4: Get Your Vercel URL

After deployment, Vercel will provide a URL like:
```
https://taka-jachai-api.vercel.app
```

**Copy this URL** - you'll need it for the next step.

### Step 5: Update Cloudflare Worker

Edit `E:\Special Project\TAKA JACHAI\taka-jachai-modern\cloudflare-worker\wrangler.toml`:

```toml
[vars]
FIREBASE_PROJECT_ID = "taka-jachai-app"
CRON_SECRET = "x8Fk29LmP4QvN7rZ2026"
BRIDGE_SECRET_KEY = "bridge-secret-2026-taka-jachai"
NEXTJS_API_URL = "https://your-vercel-url.vercel.app"  # REPLACE THIS
```

Replace `https://your-vercel-url.vercel.app` with your actual Vercel URL from Step 4.

### Step 6: Deploy Cloudflare Worker

```bash
cd "E:\Special Project\TAKA JACHAI\taka-jachai-modern\cloudflare-worker"
npm run deploy
```

## Testing the Deployment

### Test Next.js API

```bash
curl "https://your-vercel-url.vercel.app/api/firestore?path=users/test" \
  -H "Authorization: Bearer bridge-secret-2026-taka-jachai"
```

Should return: `{"error":"Document not found"}` (expected if document doesn't exist)

### Test Cloudflare Worker

```bash
curl -X POST https://taka-jachai-api.asifhasan10122000.workers.dev/api/payment-sms \
  -H "Content-Type: application/json" \
  -H "X-Bridge-Key: bridge-secret-2026-taka-jachai" \
  -d '{"provider":"bKash","amount":99,"trxId":"TEST123","sender":"01712345678"}'
```

## Troubleshooting

### Vercel Deployment Fails

- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check Vercel build logs for errors

### API Returns 401 Unauthorized

- Verify `BRIDGE_SECRET_KEY` matches between Worker and API
- Check Authorization header format: `Bearer <secret>`

### Firestore Connection Error

- Verify Firebase project ID is correct
- Check service account key is valid (if using)
- Ensure Firestore is enabled in Firebase Console

### Worker Can't Reach API

- Check `NEXTJS_API_URL` is correct in wrangler.toml
- Verify Worker is deployed with updated config
- Check Worker logs for connection errors

## Environment Variables Reference

| Variable | Purpose | Required |
|----------|---------|----------|
| `BRIDGE_SECRET_KEY` | Authentication secret | Yes |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Firebase admin credentials | No* |

*Optional - can use application default credentials for development

## Security Notes

- Never commit `.env.local` to version control
- Use different secrets in production
- Rotate secrets periodically
- Use Vercel environment variables for production secrets
