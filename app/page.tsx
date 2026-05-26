'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AudioWaveform,
  Mic2,
  Sparkles,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Play,
} from 'lucide-react';

const features = [
  {
    icon: AudioWaveform,
    title: 'Advanced TTS Engine',
    description:
      'Powered by GPT-SoVITS for natural, expressive text-to-speech synthesis with emotional nuance.',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Mic2,
    title: 'Zero-Shot Cloning',
    description:
      'Clone any voice with just seconds of audio using OpenVoice technology. No training required.',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    title: 'RVC Conversion',
    description:
      'Transform your voice into any character with Retrieval-based Voice Conversion.',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'GPU-accelerated processing delivers results in seconds, not minutes.',
    gradient: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Your voice data is encrypted and protected. Full compliance with privacy standards.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: Globe,
    title: 'Multi-Language',
    description:
      'Support for multiple languages and accents. Create content for global audiences.',
    gradient: 'from-rose-500 to-pink-500',
  },
];

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    credits: '100 credits',
    features: [
      '100 generation credits/month',
      'Basic TTS synthesis',
      '2 voice clones',
      'Standard processing speed',
      'Community support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    credits: '1,000 credits',
    features: [
      '1,000 generation credits/month',
      'Advanced TTS with emotions',
      '10 voice clones',
      'Priority processing',
      'Email support',
      'Commercial usage rights',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    credits: '5,000 credits',
    features: [
      '5,000 generation credits/month',
      'All TTS features unlocked',
      'Unlimited voice clones',
      'Fastest processing queue',
      'Priority support',
      'API access',
      'Custom voice models',
    ],
    cta: 'Go Pro',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    credits: 'Unlimited',
    features: [
      'Unlimited credits',
      'Dedicated GPU resources',
      'Custom model training',
      'SLA guarantee',
      '24/7 premium support',
      'On-premise deployment option',
      'White-label solutions',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
];

const stats = [
  { label: 'Voices Generated', value: '10M+' },
  { label: 'Active Users', value: '50K+' },
  { label: 'Languages Supported', value: '25+' },
  { label: 'Avg. Processing Time', value: '<5s' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute noise inset-0" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                <AudioWaveform className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">VoiceForge AI</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Badge
              variant="outline"
              className="mb-6 px-4 py-2 border-cyan-500/30 text-cyan-400"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Powered by GPT-SoVITS, OpenVoice & RVC
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              Create Stunning
              <br />
              <span className="gradient-text">AI-Generated Voices</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Transform text into natural speech, clone any voice instantly, and
              convert voices with cutting-edge AI. The most advanced voice AI
              platform for creators and enterprises.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/signup">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 h-14 px-8"
                >
                  Start Creating Free
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-8">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero Image / Demo */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20"
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/50 p-8 glow">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-teal-500/5" />
              <div className="relative grid md:grid-cols-3 gap-6">
                {/* TTS Card */}
                <div className="rounded-xl bg-secondary/50 p-6 border border-border/50">
                  <AudioWaveform className="w-8 h-8 text-cyan-400 mb-4" />
                  <h3 className="font-semibold mb-2">Text to Speech</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enter text and select a voice
                  </p>
                  <div className="h-20 bg-background/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Audio waveform visualization
                  </div>
                </div>

                {/* Cloning Card */}
                <div className="rounded-xl bg-secondary/50 p-6 border border-border/50">
                  <Mic2 className="w-8 h-8 text-teal-400 mb-4" />
                  <h3 className="font-semibold mb-2">Voice Cloning</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload audio to clone
                  </p>
                  <div className="h-20 bg-background/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Upload interface
                  </div>
                </div>

                {/* RVC Card */}
                <div className="rounded-xl bg-secondary/50 p-6 border border-border/50">
                  <Sparkles className="w-8 h-8 text-emerald-400 mb-4" />
                  <h3 className="font-semibold mb-2">RVC Conversion</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Transform your voice
                  </p>
                  <div className="h-20 bg-background/50 rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    Model selection
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Features
            </Badge>
            <h2 className="text-4xl font-bold mb-4">
              Cutting-Edge Voice AI Technology
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on the most advanced open-source voice AI engines, optimized
              for production use.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div className="h-full rounded-xl bg-card/50 border border-border/50 p-6 hover:border-cyan-500/50 transition-colors">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-secondary/20">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">
              How It Works
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Three Simple Steps</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Go from text to natural-sounding audio in minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Your Mode</h3>
              <p className="text-muted-foreground">
                Select TTS, Voice Cloning, or RVC Conversion based on your
                needs.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Input Your Content</h3>
              <p className="text-muted-foreground">
                Type text, upload audio samples, or select a voice model.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
              <p className="text-muted-foreground">
                Our AI processes your request and delivers high-quality audio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Scale as you grow.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <div
                  className={`h-full rounded-xl border ${
                    plan.popular
                      ? 'border-cyan-500 bg-card glow'
                      : 'border-border/50 bg-card/50'
                  } p-6 relative`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-cyan-500 to-teal-500">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.credits}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-4 h-4 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/signup">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600'
                          : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl bg-gradient-to-br from-cyan-500/20 via-teal-500/20 to-emerald-500/20 border border-cyan-500/30 p-12 text-center glow"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Create?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of creators already using VoiceForge AI.
            </p>
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 h-14 px-8"
              >
                Start Free Trial
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <AudioWaveform className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">VoiceForge AI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The most advanced AI voice cloning platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#features" className="hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 VoiceForge AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
