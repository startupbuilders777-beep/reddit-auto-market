# Vercel Deployment Setup

This guide covers how to configure environment variables in Vercel for RedditAutoMarket.

## Prerequisites

1. Vercel account connected to your GitHub repository
2. PostgreSQL database (Vercel Postgres recommended)
3. Reddit API credentials
4. OpenAI API key (for AI features)
5. Stripe account (for payments)

---

## Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)

1. Go to [Vercel Storage](https://vercel.com/dashboard/stores)
2. Click "Create Database" → "Postgres"
3. Select region closest to your users
4. Once created, click ".env" to copy the connection string
5. Add to Vercel environment variables as `DATABASE_URL`

### Option B: External PostgreSQL

If using Neon, Supabase, Railway, or another provider:

1. Create a database in your provider's dashboard
2. Get the connection string (format: `postgresql://user:pass@host:port/db`)
3. Add `DATABASE_URL` to Vercel environment variables

### Database Schema

After setting `DATABASE_URL`, run the Prisma migration:

```bash
# In Vercel, this runs automatically via postinstall hook
# Or manually via Vercel CLI:
vercel env pull .env.production
npx prisma migrate deploy
```

---

## Step 2: Configure NextAuth

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

### Set Variables in Vercel

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXTAUTH_SECRET` | Generated secret | JWT encryption key |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Production URL |

---

## Step 3: Reddit API Setup

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "create another app..." at the bottom
3. Fill in the form:
   - **name**: RedditAutoMarket
   - **type**: script
   - **description**: Automation tool for Reddit marketing campaigns
   - **about url**: `https://your-domain.com`
   - **redirect uri**: `https://your-domain.com/api/auth/callback/reddit`
4. Click "create app"
5. Copy the credentials:
   - **CLIENT_ID**: The 12-character string under the app name
   - **CLIENT_SECRET**: The secret key (14 characters)

### Set Variables in Vercel

| Variable | Value |
|----------|-------|
| `REDDIT_CLIENT_ID` | Your client ID |
| `REDDIT_CLIENT_SECRET` | Your client secret |

---

## Step 4: OpenAI API Setup

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "RedditAutoMarket" and copy the key
4. Optionally set up billing: https://platform.openai.com/account/billing

### Set Variables in Vercel

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |

---

## Step 5: Stripe Setup (For Payments)

### Create Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account setup (email, business info)

### Get API Keys

1. Go to [API Keys](https://dashboard.stripe.com/test/apikeys)
2. Copy the "Secret key" (starts with `sk_test_`)
3. Add as `STRIPE_SECRET_KEY` in Vercel

### Configure Webhooks

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click "Add endpoint"
3. Enter: `https://your-domain.com/api/webhooks/stripe`
4. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Click "Add events"
6. Copy the "Signing secret" (starts with `whsec_`)
7. Add as `STRIPE_WEBHOOK_SECRET` in Vercel

### Create Products & Prices

1. Go to [Products](https://dashboard.stripe.com/test/products)
2. Create a product for each tier:
   - **Starter** - $19/month or $190/year
   - **Pro** - $49/month or $490/year
   - **Enterprise** - $99/month or $990/year
3. For each product, add pricing (monthly and yearly)
4. Copy the Price ID for each (starts with `price_`)

### Set Price Variables in Vercel

| Variable | Example Value |
|----------|---------------|
| `STRIPE_STARTER_MONTHLY` | `price_1234567890` |
| `STRIPE_STARTER_YEARLY` | `price_0987654321` |
| `STRIPE_PRO_MONTHLY` | `price_abcdefghi` |
| `STRIPE_PRO_YEARLY` | `price_jklmnopqr` |
| `STRIPE_ENTERPRISE_MONTHLY` | `price_stuvwxyz1` |
| `STRIPE_ENTERPRISE_YEARLY` | `price_2345678901` |

### Set Redirect URLs

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_STRIPE_SUCCESS_URL` | `/dashboard?success=true` |
| `NEXT_PUBLIC_STRIPE_CANCEL_URL` | `/dashboard?canceled=true` |

---

## Step 6: Add All Variables to Vercel

### Using Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project → Settings → Environment Variables
2. Add each variable:

   ```
   DATABASE_URL        = postgresql://...
   NEXTAUTH_SECRET     = (generated)
   NEXTAUTH_URL        = https://your-project.vercel.app
   REDDIT_CLIENT_ID    = (from Reddit)
   REDDIT_CLIENT_SECRET = (from Reddit)
   OPENAI_API_KEY      = sk-...
   STRIPE_SECRET_KEY   = sk_test_...
   STRIPE_WEBHOOK_SECRET = whsec_...
   CRON_SECRET         = (generated)
   ```

3. Select appropriate scope:
   - **Production**: `NEXTAUTH_SECRET`, `DATABASE_URL`, API keys
   - **Preview**: Same as production (uses same DB)
   - **Development**: Optional, for local testing

### Using Vercel CLI

```bash
# Add environment variables
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
# ... etc

# Pull existing variables to local .env
vercel env pull .env.local
```

---

## Step 7: Verify Deployment

1. Trigger a new deployment (push a commit or click "Deploy")
2. Check the deployment logs for errors
3. Visit the production URL
4. Test:
   - [ ] User registration/login
   - [ ] Reddit OAuth connection
   - [ ] Dashboard loads correctly
   - [ ] Stripe checkout (test mode)

---

## Environment Variable Summary

### Required for Basic Deployment

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | ✅ | JWT encryption key |
| `NEXTAUTH_URL` | ✅ | Production URL |
| `REDDIT_CLIENT_ID` | ✅ | Reddit app client ID |
| `REDDIT_CLIENT_SECRET` | ✅ | Reddit app client secret |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |

### Required for Payments

| Variable | Required | Description |
|----------|----------|-------------|
| `STRIPE_SECRET_KEY` | If selling plans | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | If selling plans | Stripe webhook signing secret |
| `STRIPE_STARTER_MONTHLY` | If selling plans | Starter monthly price ID |
| `STRIPE_STARTER_YEARLY` | If selling plans | Starter yearly price ID |
| `STRIPE_PRO_MONTHLY` | If selling plans | Pro monthly price ID |
| `STRIPE_PRO_YEARLY` | If selling plans | Pro yearly price ID |
| `STRIPE_ENTERPRISE_MONTHLY` | If selling plans | Enterprise monthly price ID |
| `STRIPE_ENTERPRISE_YEARLY` | If selling plans | Enterprise yearly price ID |
| `NEXT_PUBLIC_STRIPE_SUCCESS_URL` | If selling plans | Success redirect URL |
| `NEXT_PUBLIC_STRIPE_CANCEL_URL` | If selling plans | Cancel redirect URL |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `CRON_SECRET` | - | Secret for cron job endpoint |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate limit window (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | 10 | Max requests per window |
| `RATE_LIMIT_FREE_MAX` | 10 | Free tier requests/min |
| `RATE_LIMIT_STARTER_MAX` | 60 | Starter tier requests/min |
| `RATE_LIMIT_PRO_MAX` | 300 | Pro tier requests/min |
| `RATE_LIMIT_ENTERPRISE_MAX` | 1000 | Enterprise tier requests/min |
| `NEXT_PUBLIC_APP_URL` | http://localhost:3000 | Public app URL |
| `GOOGLE_CLIENT_ID` | - | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | - | Google OAuth client secret |

---

## Troubleshooting

### "Database connection failed"

- Verify `DATABASE_URL` is set correctly in Vercel
- Ensure database is in the same region as your deployment
- Check that your database allows connections from Vercel's IP range

### "NextAuth: JWT stringify error"

- Ensure `NEXTAUTH_SECRET` is set and is at least 32 characters
- Generate a new secret: `openssl rand -base64 32`

### "Reddit OAuth failed"

- Verify `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are correct
- Check that redirect URI in Reddit app matches `NEXTAUTH_URL`

### "OpenAI API error"

- Verify `OPENAI_API_KEY` is valid and not expired
- Check your OpenAI account has billing set up

### "Stripe webhook delivery failed"

- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check the webhook endpoint exists at `/api/webhooks/stripe`
- Review Stripe webhook logs in dashboard
