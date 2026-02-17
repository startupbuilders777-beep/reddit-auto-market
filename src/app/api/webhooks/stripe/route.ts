import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Lazy initialize Stripe to avoid build-time errors
function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set');
  }
  return new Stripe(key, {
    apiVersion: '2026-01-28.clover',
  });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    const stripe = getStripe();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any;
        await handlePaymentFailed(invoice);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as any;
        await handlePaymentSucceeded(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: any) {
  const stripe = getStripe();
  const customerId = session.customer;
  const subscriptionId = session.subscription;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error('No userId in session metadata');
    return;
  }

  // Retrieve the subscription to get pricing tier info
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
  const priceId = subscription.items?.data[0]?.price.id;

  // Find pricing tier by Stripe price ID
  const pricingTier = await prisma.pricingTier.findFirst({
    where: {
      OR: [
        { stripePriceIdMonthly: priceId },
        { stripePriceIdYearly: priceId },
      ],
    },
  });

  if (!pricingTier) {
    console.error('Pricing tier not found for price:', priceId);
    return;
  }

  // Create or update subscription in database
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      pricingTierId: pricingTier.id,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
    update: {
      pricingTierId: pricingTier.id,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}

async function handleSubscriptionUpdated(subscription: any) {
  const subscriptionId = subscription.id;

  const existingSub = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!existingSub) {
    console.log('Subscription not found in database:', subscriptionId);
    return;
  }

  // Map Stripe status to our enum
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' | 'INCOMPLETE';
  
  switch (subscription.status) {
    case 'active':
      status = 'ACTIVE';
      break;
    case 'canceled':
      status = 'CANCELED';
      break;
    case 'past_due':
      status = 'PAST_DUE';
      break;
    case 'trialing':
      status = 'TRIALING';
      break;
    case 'incomplete':
    case 'incomplete_expired':
      status = 'INCOMPLETE';
      break;
    default:
      status = 'ACTIVE';
  }

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeleted(subscription: any) {
  const subscriptionId = subscription.id;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: true,
    },
  });
}

async function handlePaymentFailed(invoice: any) {
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'PAST_DUE',
    },
  });
}

async function handlePaymentSucceeded(invoice: any) {
  const stripe = getStripe();
  const subscriptionId = invoice.subscription;

  if (!subscriptionId) return;

  // Extend the subscription period
  const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;

  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscriptionId },
    data: {
      status: 'ACTIVE',
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    },
  });
}
