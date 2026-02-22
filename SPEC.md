# RedditAutoMarket — Product Specification

## 1. Vision
An AI-powered Reddit marketing automation platform that helps businesses find relevant Reddit posts and generate contextual, human-like comments automatically. Target users: digital marketing agencies, SaaS founders, and freelance social media managers.

## 2. Target Users
- **Primary**: Digital marketing agencies managing multiple client Reddit presences
- **Secondary**: Solopreneurs and SaaS founders doing their own community marketing
- **Tertiary**: Freelance social media managers handling Reddit for clients

## 3. Core Features
- [x] Reddit OAuth authentication
- [ ] Campaign creation with target keywords and subreddits
- [ ] AI-generated contextual comments
- [ ] Automated posting scheduler
- [ ] Analytics dashboard (engagement tracking)
- [ ] Multi-account management
- [ ] Rate limiting protection
- [ ] Custom comment templates
- [ ] Dark mode support
- [ ] Accessibility (WCAG 2.1 AA)

## 4. Design System

### 4.1 Design Inspiration
**Primary**: Buffer — social media queue view, clean scheduling interface
**Secondary**: HubSpot — campaign builder, lead scoring visualization
**Reference URLs**: 
- Buffer.com dashboard
- HubSpot marketing campaigns

### 4.2 Color Palette
| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| primary | #FF4500 | #FF6B35 | CTAs, Reddit brand orange |
| secondary | #0079D3 | #4DA6FF | Links, secondary actions |
| accent | #00D412 | #00FF4C | Success states, engagement |
| background | #FAFAFA | #1A1A1B | Page background |
| surface | #FFFFFF | #272729 | Card backgrounds |
| text-primary | #1A1A1B | #D7DADC | Headings, body |
| text-secondary | #6F7378 | #818384 | Labels, captions |
| border | #EDEFF1 | #343536 | Dividers |

### 4.3 Typography
- **Font**: Inter (headings) / Inter (body)
- **Scale**: 12/14/16/18/20/24/30/36px
- **Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### 4.4 Components
- **Buttons**: Primary (orange filled), Secondary (outline), Ghost
- **Cards**: rounded-lg, shadow-sm, border, p-4
- **Inputs**: h-10, rounded-md, border, focus:ring-2
- **Modals**: Centered, backdrop-blur, rounded-xl, max-w-lg
- **Toast**: Bottom-right, rounded-lg, auto-dismiss 5s

## 5. Page Map
- `/` — Landing page (hero, features, pricing, CTA)
- `/dashboard` — Main dashboard with campaign overview
- `/campaigns` — Campaign list and management
- `/campaigns/new` — Create new campaign
- `/analytics` — Engagement metrics and reporting
- `/settings` — Account and API settings

## 6. API Contracts
- `POST /api/auth/reddit` — Reddit OAuth flow
- `GET/POST /api/campaigns` — CRUD campaigns
- `GET /api/analytics` — Engagement data
- `POST /api/comments/generate` — AI comment generation

## 7. Deployment
- **Vercel**: reddit-auto-market.vercel.app
- **Database**: PostgreSQL (via Prisma)
- **Env Vars Needed**: DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, Reddit API credentials, OpenAI API key

## 8. Current Status
- **Production**: ❌ NOT DEPLOYED (404 error)
- **Blocking Issues**: Missing environment variables in Vercel
- **Next Steps**: Deploy with proper env vars, then execute marketing campaign
