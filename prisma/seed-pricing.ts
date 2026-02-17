import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding pricing tiers...');

  const tiers = [
    {
      name: 'Free',
      description: 'Perfect for getting started',
      monthlyPrice: 0,
      yearlyPrice: 0,
      stripePriceIdMonthly: null,
      stripePriceIdYearly: null,
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
      isActive: true,
    },
    {
      name: 'Starter',
      description: 'For small businesses',
      monthlyPrice: 1900, // $19.00
      yearlyPrice: 19000, // $190.00 (save ~17%)
      stripePriceIdMonthly: process.env.STRIPE_STARTER_MONTHLY || 'price_starter_monthly',
      stripePriceIdYearly: process.env.STRIPE_STARTER_YEARLY || 'price_starter_yearly',
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
      isActive: true,
    },
    {
      name: 'Pro',
      description: 'For growing teams',
      monthlyPrice: 4900, // $49.00
      yearlyPrice: 49000, // $490.00 (save ~17%)
      stripePriceIdMonthly: process.env.STRIPE_PRO_MONTHLY || 'price_pro_monthly',
      stripePriceIdYearly: process.env.STRIPE_PRO_YEARLY || 'price_pro_yearly',
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
      isActive: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      monthlyPrice: 9900, // $99.00
      yearlyPrice: 99000, // $990.00 (save ~17%)
      stripePriceIdMonthly: process.env.STRIPE_ENTERPRISE_MONTHLY || 'price_enterprise_monthly',
      stripePriceIdYearly: process.env.STRIPE_ENTERPRISE_YEARLY || 'price_enterprise_yearly',
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
      isActive: true,
    },
  ];

  for (const tier of tiers) {
    await prisma.pricingTier.upsert({
      where: { name: tier.name },
      create: tier,
      update: tier,
    });
    console.log(`Created/updated tier: ${tier.name}`);
  }

  console.log('Pricing tiers seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
