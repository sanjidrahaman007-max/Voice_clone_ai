import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Placeholder Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

const SUBSCRIPTION_PLANS: Record<string, { price: number; name: string; credits: number; priceId?: string }> = {
  free: { price: 0, name: 'Free', credits: 100 },
  starter: { price: 1900, name: 'Starter', credits: 1000 },
  pro: { price: 4900, name: 'Pro', credits: 5000 },
  enterprise: { price: 0, name: 'Enterprise', credits: 0 },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      );
    }

    const plan = SUBSCRIPTION_PLANS[planId];

    // Get user profile
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Handle free plan
    if (planId === 'free') {
      await (supabase as any)
        .from('users')
        .update({ subscription_tier: 'free' })
        .eq('id', user.id);

      return NextResponse.json({
        success: true,
        message: 'Switched to free plan',
      });
    }

    // Handle enterprise plan
    if (planId === 'enterprise') {
      return NextResponse.json({
        message: 'Contact sales for enterprise plan',
        email: 'sales@voiceforge.ai',
      });
    }

    // If Stripe is configured, create a subscription checkout
    if (STRIPE_SECRET_KEY) {
      try {
        const stripe = require('stripe')(STRIPE_SECRET_KEY);

        // Create or get Stripe customer
        let customerId = (userProfile as { stripe_customer_id?: string }).stripe_customer_id;

        if (!customerId) {
          const customer = await stripe.customers.create({
            email: user.email,
            metadata: {
              supabaseUserId: user.id,
            },
          });
          customerId = customer.id;

          await (supabase as any)
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);
        }

        // Create checkout session for subscription
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: `${plan.name} Subscription`,
                  description: `${plan.credits} credits/month`,
                },
                unit_amount: plan.price,
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
          metadata: {
            userId: user.id,
            planId,
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Fall through to simulation mode
      }
    }

    // Simulate subscription for demo
    console.log('Stripe not configured, simulating subscription');

    await (supabase as any)
      .from('users')
      .update({
        subscription_tier: planId,
        credits: (userProfile as { credits: number }).credits + plan.credits,
      })
      .eq('id', user.id);

    await (supabase as any).from('credit_transactions').insert({
      user_id: user.id,
      amount: plan.credits,
      transaction_type: 'purchase',
      description: `${plan.name} subscription - Simulated`,
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription activated (demo mode)',
      planId,
      creditsAdded: plan.credits,
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
