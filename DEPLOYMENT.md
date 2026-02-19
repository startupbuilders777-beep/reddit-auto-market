# RedditAutoMarket Deployment Guide

## Current Status
- Build: ✅ Passing
- Tests: ✅ 21/21 passing
- Landing Page: ✅ Working at /

## What's Ready
- Full marketing landing page with pricing
- Authentication flow (/login)
- Dashboard (/dashboard)
- All API endpoints

## Deployment Options

### Option 1: Vercel (Recommended)
1. Link project: `vercel link`
2. Configure env vars in Vercel dashboard:
   - DATABASE_URL
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (production URL)
   - REDDIT_CLIENT_ID
   - REDDIT_CLIENT_SECRET
   - OPENAI_API_KEY
3. Deploy: `vercel --prod`

### Option 2: EC2
1. Ensure security group allows inbound on port 3000/3001
2. Set environment variables:
   - DATABASE_URL (PostgreSQL connection string)
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL (public URL)
   - REDDIT_CLIENT_ID
   - REDDIT_CLIENT_SECRET
   - OPENAI_API_KEY
3. Run: `docker-compose up -d`

### GitHub Actions (EC2 Deploy)
Configure these secrets in GitHub:
- EC2_HOST
- EC2_USER  
- EC2_SSH_KEY
- APP_URL

Then trigger the `deploy.yml` workflow.

## Required Environment Variables
See `.env.example` for all required variables.
