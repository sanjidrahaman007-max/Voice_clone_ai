'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import {
  CreditCard,
  Zap,
  History,
  Check,
  Loader2,
  Sparkles,
  Crown,
  Building2,
  ArrowRight,
} from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  credits: number;
  subscription_tier: string;
  stripe_customer_id: string | null;
}

interface Transaction {
  id: string;
  amount: number;
  transaction_type: string;
  description: string;
  created_at: string;
}

const creditPackages = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 500,
    price: 9,
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro Pack',
    credits: 1500,
    price: 19,
    popular: true,
    bonus: '20% bonus',
  },
  {
    id: 'business',
    name: 'Business Pack',
    credits: 5000,
    price: 49,
    popular: false,
    bonus: '30% bonus',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 15000,
    price: 129,
    popular: false,
    bonus: '40% bonus',
  },
];

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 100,
    features: ['100 credits/month', 'Basic TTS', '2 voice clones', 'Community support'],
    icon: Zap,
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 19,
    credits: 1000,
    features: [
      '1,000 credits/month',
      'All TTS features',
      '10 voice clones',
      'Priority processing',
      'Email support',
    ],
    icon: Sparkles,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 49,
    credits: 5000,
    features: [
      '5,000 credits/month',
      'Unlimited clones',
      'API access',
      'Custom models',
      'Priority support',
    ],
    icon: Crown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    credits: 'Unlimited',
    features: [
      'Unlimited credits',
      'Dedicated GPU',
      'Custom training',
      'SLA guarantee',
      '24/7 support',
    ],
    icon: Building2,
  },
];

export default function BillingPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profileData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const { data: transData } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (profileData) setProfile(profileData as unknown as Profile);
    if (transData) setTransactions(transData as unknown as Transaction[]);
    setLoading(false);
  };

  const handlePurchaseCredits = async (packageId: string) => {
    setProcessing(packageId);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setProcessing(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    setProcessing(planId);
    try {
      const response = await fetch('/api/stripe/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Subscribe error:', error);
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Credit Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-gradient-to-br from-cyan-500/10 via-teal-500/10 to-emerald-500/10 border border-cyan-500/20 p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold gradient-text">
                {profile?.credits ?? 0}
              </span>
              <span className="text-xl text-muted-foreground">credits</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Subscription:{' '}
              <Badge variant="outline" className="ml-1">
                {profile?.subscription_tier || 'Free'}
              </Badge>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => handleSubscribe('starter')}
              disabled={processing !== null}
              className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
            <Button variant="outline">Manage Subscription</Button>
          </div>
        </div>
      </motion.div>

      {/* Credit Packages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-2xl font-bold mb-6">Buy Credits</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`rounded-xl border ${
                pkg.popular
                  ? 'border-cyan-500 bg-card glow'
                  : 'border-border/50 bg-card/50'
              } p-6 relative`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-teal-500">
                  Best Value
                </Badge>
              )}
              <h3 className="font-semibold mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold">${pkg.price}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {pkg.credits.toLocaleString()} credits
              </p>
              {pkg.bonus && (
                <p className="text-xs text-emerald-400 mb-4">{pkg.bonus}</p>
              )}
              <Button
                onClick={() => handlePurchaseCredits(pkg.id)}
                disabled={processing !== null}
                className={`w-full ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                    : ''
                }`}
                variant={pkg.popular ? 'default' : 'outline'}
              >
                {processing === pkg.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Purchase
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Subscription Plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold mb-6">Subscription Plans</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subscriptionPlans.map((plan) => {
            const isCurrentPlan = profile?.subscription_tier === plan.id;
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`rounded-xl border ${
                  isCurrentPlan
                    ? 'border-emerald-500 bg-card'
                    : 'border-border/50 bg-card/50'
                } p-6 relative`}
              >
                {isCurrentPlan && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500">
                    Current Plan
                  </Badge>
                )}
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="font-semibold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  {plan.price !== null ? (
                    <>
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">Custom</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {typeof plan.credits === 'number'
                    ? `${plan.credits.toLocaleString()} credits/month`
                    : plan.credits}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={processing !== null || isCurrentPlan}
                  className="w-full"
                  variant={isCurrentPlan ? 'outline' : 'default'}
                >
                  {processing === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrentPlan ? (
                    'Current'
                  ) : plan.price === null ? (
                    'Contact Sales'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-card/50 border border-border/50 p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <History className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Transaction History</h2>
        </div>

        {transactions.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Credits
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id} className="border-b border-border/50">
                    <td className="py-3 px-4 text-sm">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-sm">{tx.description}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{tx.transaction_type}</Badge>
                    </td>
                    <td
                      className={`py-3 px-4 text-sm text-right font-medium ${
                        tx.amount > 0 ? 'text-emerald-400' : 'text-destructive'
                      }`}
                    >
                      {tx.amount > 0 ? '+' : ''}
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
