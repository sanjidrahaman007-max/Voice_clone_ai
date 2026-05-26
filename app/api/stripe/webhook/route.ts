import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !signature) {
      console.log('Stripe webhook not configured, skipping');
      return NextResponse.json({ received: true });
    }

    const stripe = require('stripe')(STRIPE_SECRET_KEY);

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = await createClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const credits = parseInt(session.metadata?.credits || '0');
        const packageId = session.metadata?.packageId;

        if (userId && credits > 0) {
          const { data: user } = await (supabase as any)
            .from('users')
            .select('credits')
            .eq('id', userId)
            .maybeSingle();

          if (user) {
            await (supabase as any)
              .from('users')
              .update({ credits: (user as { credits: number }).credits + credits })
              .eq('id', userId);

            await (supabase as any).from('credit_transactions').insert({
              user_id: userId,
              amount: credits,
              transaction_type: 'purchase',
              description: `Credit purchase: ${packageId}`,
              stripe_payment_id: session.payment_intent as string,
            });
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const planId = subscription.metadata?.planId;

        const { data: user } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (user && planId) {
          await (supabase as any)
            .from('users')
            .update({
              subscription_tier: planId,
              stripe_subscription_id: subscription.id,
            })
            .eq('id', (user as { id: string }).id);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const { data: user } = await (supabase as any)
          .from('users')
          .select('*')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (user) {
          await (supabase as any)
            .from('users')
            .update({
              subscription_tier: 'free',
              stripe_subscription_id: null,
            })
            .eq('id', (user as { id: string }).id);
        }
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
