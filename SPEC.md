# Reddit Marketing Tool - Project Specification

## 1. Project Overview

**Name:** RedditAutoMarket
**Type:** Web Application (SaaS)
**Core Functionality:** AI-powered tool that automatically finds relevant Reddit posts/comments and generates/post marketing comments to promote users' apps/products.
**Target Users:** Indie hackers, SaaS founders, app developers

---

## 2. Tech Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL
- **Auth:** NextAuth.js
- **AI:** OpenAI API for comment generation
- **Reddit API:** praw (Python Reddit API Wrapper) or snoowrap
- **Deployment:** Docker, EC2

---

## 3. Core Features

### 3.1 Account Management
- Connect multiple Reddit accounts
- OAuth authentication with Reddit
- Account health monitoring

### 3.2 Campaign Management
- Create marketing campaigns
- Target by keywords, subreddits, post types
- Set daily comment limits
- Clone campaigns

### 3.3 AI Comment Generation
- Context-aware comment generation
- Custom templates
- Multiple tone settings (helpful, casual, professional)

### 3.4 Automation
- Search relevant posts automatically
- Filter by: karma, age, subreddit rules
- Schedule comments
- Rate limiting protection

### 3.5 Analytics
- Comments posted count
- Engagement received
- Top performing posts
- Campaign ROI tracking

### 3.6 Dashboard
- Overview with key metrics
- Campaign management
- Account status
- Settings

---

## 4. Database Schema (Draft)

### Users
- id, email, password, createdAt

### RedditAccounts
- id, userId, redditUsername, accessToken, refreshToken, isActive

### Campaigns
- id, userId, name, keywords, subreddits, dailyLimit, status

### Comments
- id, campaignId, redditPostId, content, postedAt, engagement

### Templates
- id, userId, name, content, tone

---

## 5. Acceptance Criteria

- [ ] User can sign up/login
- [ ] User can connect Reddit account via OAuth
- [ ] User can create campaign with keywords/subreddits
- [ ] System finds relevant posts automatically
- [ ] AI generates contextual comments
- [ ] Comments post automatically (respecting rate limits)
- [ ] Dashboard shows analytics
- [ ] App deployed on EC2
- [ ] All features tested by QA

---

*Last Updated: 2026-02-13*
