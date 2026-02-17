# Reddit Marketing Tool

AI-powered Reddit marketing automation platform that finds relevant posts and generates contextual comments to promote your app/product.

## Features

- **Multi-Account Management** - Connect and manage multiple Reddit accounts via OAuth
- **Campaign Management** - Create campaigns with keywords, target subreddits, and daily limits
- **AI Comment Generation** - Context-aware comments using OpenAI GPT-3.5
- **Automated Posting** - Automatically find and comment on relevant posts
- **Rate Limiting** - Built-in protection against Reddit rate limits
- **Analytics Dashboard** - Track comments, engagement, and campaign performance
- **Custom Templates** - Create reusable comment templates with variables

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React, TypeScript |
| Styling | Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL with Prisma ORM |
| Auth | NextAuth.js |
| AI | OpenAI API (GPT-3.5 Turbo) |
| Reddit API | snoowrap |
| Deployment | Docker, EC2 |

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Reddit Developer App (OAuth credentials)
- OpenAI API Key

## Quick Start

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Push database schema
npm run db:push

# Run development server
npm run dev
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reddit_marketing"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Reddit OAuth
REDDIT_CLIENT_ID="your-client-id"
REDDIT_CLIENT_SECRET="your-client-secret"

# OpenAI
OPENAI_API_KEY="sk-..."
```

## Project Structure

```
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Protected dashboard pages
│   │   ├── actions/      # Server actions
│   │   └── login/        # Authentication pages
│   ├── components/       # React components
│   └── lib/
│       ├── reddit.ts     # Reddit API client
│       ├── ai-comment.ts # AI comment generation
│       ├── automation-worker.ts # Campaign automation
│       └── prisma.ts     # Database client
└── public/               # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run test` | Run tests |

## Automation

The automation worker runs as a cron job to:
1. Find active campaigns
2. Search for relevant posts in target subreddits
3. Generate AI comments
4. Post comments (respecting rate limits)

Set up a cron job to call `/api/cron/automation` every 5-15 minutes.

## License

MIT
