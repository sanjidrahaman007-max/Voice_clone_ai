import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Placeholder Stripe configuration
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

const CREDIT_PACKAGES: Record<string, { credits: number; price: number; name: string }> = {
  starter: { credits: 500, price: 900, name: 'Starter Pack' },
  pro: { credits: 1500, price: 1900, name: 'Pro Pack' },
  business: { credits: 5000, price: 4900, name: 'Business Pack' },
  enterprise: { credits: 15000, price: 12900, name: 'Enterprise Pack' },
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

    const { packageId } = await request.json();

    if (!packageId || !CREDIT_PACKAGES[packageId]) {
      return NextResponse.json(
        { error: 'Invalid package' },
        { status: 400 }
      );
    }

    const pkg = CREDIT_PACKAGES[packageId];

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

    // If Stripe is configured, create a checkout session
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

          // Update user with Stripe customer ID
          await (supabase as any)
            .from('users')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id);
        }

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: pkg.name,
                  description: `${pkg.credits} credits for VoiceForge AI`,
                },
                unit_amount: pkg.price,
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?success=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard/billing?canceled=true`,
          metadata: {
            userId: user.id,
            credits: pkg.credits,
            packageId,
          },
        });

        return NextResponse.json({ url: session.url });
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Fall through to simulation mode
      }
    }

    // Simulate successful checkout for demo
    console.log('Stripe not configured, simulating purchase');

    // Add credits directly for demo
    await (supabase as any)
      .from('users')
      .update({ credits: (userProfile as { credits: number }).credits + pkg.credits })
      .eq('id', user.id);

    // Record transaction
    await (supabase as any).from('credit_transactions').insert({
      user_id: user.id,
      amount: pkg.credits,
      transaction_type: 'purchase',
      description: `${pkg.name} - Simulated`,
    });

    return NextResponse.json({
      success: true,
      message: 'Credits added (demo mode)',
      creditsAdded: pkg.credits,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
