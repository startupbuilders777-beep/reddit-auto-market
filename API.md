# API Documentation

## Authentication

All endpoints (except `/api/auth/*`) require a valid NextAuth session. Include session cookies in requests.

## API Endpoints

### Authentication

#### `POST /api/auth/[...nextauth]`

NextAuth.js handlers for:
- `POST` - Sign in, sign out, callback
- `GET` - Session retrieval

---

### Cron Jobs

#### `GET /api/cron/automation`

Triggers the campaign automation worker. Should be called via cron job (every 5-15 minutes).

**Authentication:** Requires `CRON_SECRET` header matching `env.CRON_SECRET`

```bash
curl -H "CRON_SECRET: your-secret" https://your-domain.com/api/cron/automation
```

**Response:**
```json
{ "success": true, "message": "Automation completed" }
```

---

## Server Actions

Client-side actions for data mutations. These are called from React components.

### Campaigns

#### `createCampaign(data)`

Create a new marketing campaign.

```typescript
await createCampaign({
  name: string,
  keywords: string[],
  subreddits: string[],
  dailyLimit: number,
  tone: 'helpful' | 'casual' | 'professional'
})
```

#### `updateCampaign(id, data)`

Update an existing campaign.

```typescript
await updateCampaign(id, {
  name?: string,
  keywords?: string[],
  subreddits?: string[],
  dailyLimit?: number,
  tone?: string,
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
})
```

#### `deleteCampaign(id)`

Delete a campaign and all its comments.

#### `pauseCampaign(id)`

Pause an active campaign.

#### `resumeCampaign(id)`

Resume a paused campaign.

---

### Settings

#### `updateSettings(data)`

Update user preferences.

```typescript
await updateSettings({
  dailyCommentLimit: number,
  notificationEmail: boolean,
  notifyOnFailures: boolean,
  defaultTone: 'helpful' | 'casual' | 'professional'
})
```

---

## Data Models

### User
```typescript
{
  id: string
  email: string
  name: string?
  image: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

### RedditAccount
```typescript
{
  id: string
  userId: string
  redditId: string
  username: string
  accessToken: string
  refreshToken: string
  isActive: boolean
  karma: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Campaign
```typescript
{
  id: string
  userId: string
  name: string
  keywords: string[]
  subreddits: string[]
  dailyLimit: number
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  tone: 'helpful' | 'casual' | 'professional'
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Comment
```typescript
{
  id: string
  campaignId: string
  redditAccountId: string
  redditPostId: string
  content: string
  redditCommentId: string?
  postedAt: DateTime?
  upvotes: number
  replies: number
  engagement: number
  status: 'PENDING' | 'POSTED' | 'FAILED' | 'FLAGGED'
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Template
```typescript
{
  id: string
  userId: string
  name: string
  content: string
  tone: 'helpful' | 'casual' | 'professional'
  variables: string[]
  createdAt: DateTime
  updatedAt: DateTime
}
```

---

## Rate Limits

The Reddit API client implements rate limiting:
- Max 10 comments per minute per account
- Automatic token refresh on expiration

---

## Error Handling

All actions return errors that can be caught:

```typescript
try {
  await createCampaign(data)
} catch (error) {
  console.error(error.message) // "Unauthorized", etc.
}
```
