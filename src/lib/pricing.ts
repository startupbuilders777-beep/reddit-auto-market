import { prisma } from '@/lib/prisma';

export const PRICING_TIERS = {
  FREE: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxCampaigns: 1,
    maxRedditAccounts: 1,
    dailyPostLimit: 5,
    features: [
      '1 campaign',
      '1 Reddit account',
      '5 posts per day',
      'Basic templates',
      'Community support',
    ],
  },
  STARTER: {
    name: 'Starter',
    monthlyPrice: 1900, // $19.00
    yearlyPrice: 19000, // $190.00 (save ~17%)
    maxCampaigns: 3,
    maxRedditAccounts: 3,
    dailyPostLimit: 25,
    features: [
      '3 campaigns',
      '3 Reddit accounts',
      '25 posts per day',
      'Custom templates',
      'AI-powered responses',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    monthlyPrice: 4900, // $49.00
    yearlyPrice: 49000, // $490.00 (save ~17%)
    maxCampaigns: 10,
    maxRedditAccounts: 10,
    dailyPostLimit: 100,
    features: [
      '10 campaigns',
      '10 Reddit accounts',
      '100 posts per day',
      'Advanced templates',
      'AI-powered responses',
      'Analytics dashboard',
      'Priority support',
      'Custom keyword targeting',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    monthlyPrice: 9900, // $99.00
    yearlyPrice: 99000, // $990.00 (save ~17%)
    maxCampaigns: -1, // unlimited
    maxRedditAccounts: -1, // unlimited
    dailyPostLimit: -1, // unlimited
    features: [
      'Unlimited campaigns',
      'Unlimited Reddit accounts',
      'Unlimited posts',
      'Advanced templates',
      'AI-powered responses',
      'Advanced analytics',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'Team collaboration',
    ],
  },
} as const;

export type PricingTierName = keyof typeof PRICING_TIERS;

export interface PricingTierData {
  id: string;
  name: string;
  description: string | null;
  monthlyPrice: number;
  yearlyPrice: number;
  maxCampaigns: number;
  maxRedditAccounts: number;
  dailyPostLimit: number;
  features: string[];
  stripePriceIdMonthly: string | null;
  stripePriceIdYearly: string | null;
}

/**
 * Convert readonly array to mutable array
 */
function toMutableArray<T>(arr: readonly T[]): T[] {
  return [...arr];
}

/**
 * Get all active pricing tiers from database, or fall back to hardcoded values
 */
export async function getPricingTiers(): Promise<PricingTierData[]> {
  try {
    const tiers = await prisma.pricingTier.findMany({
      where: { isActive: true },
      orderBy: { monthlyPrice: 'asc' },
    });

    if (tiers.length === 0) {
      // Return hardcoded tiers if database is empty
      return Object.entries(PRICING_TIERS).map(([key, tier]) => ({
        id: key.toLowerCase(),
        name: tier.name,
        description: null,
        monthlyPrice: tier.monthlyPrice,
        yearlyPrice: tier.yearlyPrice,
        maxCampaigns: tier.maxCampaigns,
        maxRedditAccounts: tier.maxRedditAccounts,
        dailyPostLimit: tier.dailyPostLimit,
        features: toMutableArray(tier.features),
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      }));
    }

    return tiers;
  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    // Return hardcoded tiers on error
    return Object.entries(PRICING_TIERS).map(([key, tier]) => ({
      id: key.toLowerCase(),
      name: tier.name,
      description: null,
      monthlyPrice: tier.monthlyPrice,
      yearlyPrice: tier.yearlyPrice,
      maxCampaigns: tier.maxCampaigns,
      maxRedditAccounts: tier.maxRedditAccounts,
      dailyPostLimit: tier.dailyPostLimit,
      features: toMutableArray(tier.features),
      stripePriceIdMonthly: null,
      stripePriceIdYearly: null,
    }));
  }
}

/**
 * Get pricing tier by name
 */
export async function getPricingTierByName(name: string): Promise<PricingTierData | null> {
  const tiers = await getPricingTiers();
  return tiers.find(t => t.name.toLowerCase() === name.toLowerCase()) || null;
}

/**
 * Get environment variables for Stripe checkout
 */
export function getStripeEnv() {
  return {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_STARTER_MONTHLY: process.env.STRIPE_STARTER_MONTHLY,
    STRIPE_STARTER_YEARLY: process.env.STRIPE_STARTER_YEARLY,
    STRIPE_PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY,
    STRIPE_PRO_YEARLY: process.env.STRIPE_PRO_YEARLY,
    STRIPE_ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY,
    STRIPE_ENTERPRISE_YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY,
    NEXT_PUBLIC_STRIPE_SUCCESS_URL: process.env.NEXT_PUBLIC_STRIPE_SUCCESS_URL,
    NEXT_PUBLIC_STRIPE_CANCEL_URL: process.env.NEXT_PUBLIC_STRIPE_CANCEL_URL,
  };
}

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured() {
  return !!(
    process.env.STRIPE_SECRET_KEY &&
    process.env.STRIPE_WEBHOOK_SECRET
  );
}
