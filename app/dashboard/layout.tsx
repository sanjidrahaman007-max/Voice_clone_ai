'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AudioWaveform,
  Mic2,
  Sparkles,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const sidebarItems = [
  {
    icon: AudioWaveform,
    label: 'TTS Studio',
    href: '/dashboard/tts',
    gradient: 'from-cyan-500 to-teal-500',
  },
  {
    icon: Mic2,
    label: 'Voice Cloning',
    href: '/dashboard/clone',
    gradient: 'from-teal-500 to-emerald-500',
  },
  {
    icon: Sparkles,
    label: 'RVC Converter',
    href: '/dashboard/rvc',
    gradient: 'from-emerald-500 to-green-500',
  },
  {
    icon: CreditCard,
    label: 'Billing & Credits',
    href: '/dashboard/billing',
    gradient: 'from-yellow-500 to-orange-500',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{
    full_name: string;
    credits: number;
    subscription_tier: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from('users')
        .select('full_name, credits, subscription_tier')
        .eq('id', user.id)
        .maybeSingle();

      setProfile(profile);
      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>

        {/* Sidebar */}
        <motion.aside
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : typeof window !== 'undefined' && window.innerWidth < 1024 ? -280 : 0,
          }}
          className="fixed left-0 top-0 bottom-0 w-[280px] bg-card/50 border-r border-border/50 z-50 lg:relative lg:translate-x-0"
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-border/50">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center">
                  <AudioWaveform className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">VoiceForge AI</span>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}
                    >
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/50">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-teal-500 text-white">
                    {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-sm text-cyan-400">
                    {profile?.credits ?? 0} credits
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Top Header */}
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border/50">
            <div className="flex items-center justify-between h-16 px-4 lg:px-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden"
                >
                  {sidebarOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </Button>
                <h1 className="text-lg font-semibold hidden sm:block">
                  {sidebarItems.find((item) => item.href === pathname)?.label || 'Dashboard'}
                </h1>
              </div>

              <div className="flex items-center gap-4">
                {/* Credits Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-medium text-cyan-400">
                    {profile?.credits ?? 0} credits
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-cyan-400 to-teal-500 text-white">
                        {profile?.full_name?.[0]?.toUpperCase() ||
                          user?.email?.[0]?.toUpperCase() ||
                          'U'}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-full mt-2 w-48 bg-card rounded-xl border border-border/50 shadow-lg overflow-hidden"
                      >
                        <div className="p-3 border-b border-border/50">
                          <p className="font-medium truncate">
                            {profile?.full_name || 'User'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link
                            href="/dashboard/settings"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            Settings
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors w-full text-left text-destructive"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
