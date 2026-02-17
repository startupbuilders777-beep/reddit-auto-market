# Pricing Strategy - RedditAutoMarket

## Overview
Strategic pricing document for RedditAutoMarket SaaS product.

---

## Current Pricing Tiers (From Landing Page)

| Tier | Price | Features |
|------|-------|----------|
| Starter | $29/mo | 1 account, 3 campaigns, 100 comments/mo |
| Pro | $79/mo | 5 accounts, unlimited campaigns, 1,000 comments/mo |
| Agency | $199/mo | Unlimited accounts, unlimited comments, white-label |

---

## Pricing Psychology

### Anchor Pricing
- Show Agency at $199 to anchor the value
- Pro appears as "best value" at $79 (4x Starter, half of Agency)

### Freemium Consideration
**Recommendation:** Start WITHOUT free tier initially
- Higher perceived value
- Avoids spam/abuse
- Focus on serious customers first

**Future Option:**
- Free tier: 1 campaign, 50 comments/month
- Requires email verification

---

## Cost Structure Analysis

###Margins at Scale

| Comments/Mo | Cost to Serve | At $29 | At $79 | At $199 |
|-------------|----------------|---------|---------|---------|
| 100 | ~$0.10 | $28.90 | - | - |
| 1,000 | ~$1.00 | - | $78.00 | - |
| 10,000 | ~$10.00 | - | - | $189.00 |

### Margins: 97%+ at scale - excellent SaaS economics

---

## Competitor Pricing

| Competitor | Starting Price | Key Differentiator |
|------------|----------------|-------------------|
| Brame | ~$49/mo | Community tools |
| Buffer | $15/mo | All social, not Reddit-specific |
| Hootsuite | $49/mo | Enterprise focus |
| Manual | $0 | Time cost only |

**Positioning:** RedditAutoMarket is purpose-built for Reddit, not a generalist tool. Our AI features justify premium pricing over generic schedulers.

---

## Discount Strategies

### Annual Discount
- **20% off** for annual billing
- $29×12 = $348 → $278 (save $70)
- $79×12 = $948 → $758 (save $190)
- $199×12 = $2,388 → $1,910 (save $478)

### Startup Program
- 50% off for first 6 months
- Requires startup verification
- Helps get early traction with founders

### Referral Program
- Give 1 month free for each referral
- Customer gets 1 month free
- Viral loop for growth

---

## Revenue Projections (Year 1)

### Conservative Scenario
| Month | Customers | MRR |
|-------|-----------|-----|
| 1 | 10 | $790 |
| 3 | 50 | $3,950 |
| 6 | 150 | $11,850 |
| 12 | 500 | $39,500 |

### Growth Drivers
- Product hunt launch
- Reddit organic (ironic)
- LinkedIn outreach
- Affiliate partners

---

## Pricing Page UX Recommendations

### Must-Haves on Pricing Page
1. Clear feature comparison table
2. "Most Popular" badge on Pro
3. Money-back guarantee (30 days)
4. FAQ section addressing objections
5. Toggle for monthly/annual (show savings)

### Feature Differentiation

| Feature | Starter | Pro | Agency |
|---------|---------|-----|--------|
| Reddit Accounts | 1 | 5 | Unlimited |
| Campaigns | 3 | Unlimited | Unlimited |
| Comments/mo | 100 | 1,000 | Unlimited |
| Subreddits/campaign | 5 | 25 | Unlimited |
| AI templates | - | ✓ | ✓ |
| White-label | - | - | ✓ |
| Priority support | - | - | ✓ |
| API access | - | - | ✓ |

---

## Next Steps

1. **Set up Stripe products** with these 3 tiers
2. **Configure webhooks** for subscription lifecycle
3. **Add usage metering** (comment count tracking)
4. **Implement upgrade/downgrade** flows
5. **Test checkout flow** before launch

---

*Strategy completed: 2026-02-16*
