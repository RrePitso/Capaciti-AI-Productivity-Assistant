// src/components/layout/Header.tsx
'use client';

import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useUIStore } from '@/store/useUIStore';
import { useUser } from '@/hooks/useUser';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function Header() {
  const router = useRouter();
  const supabase = createClient();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const { profile } = useUser();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Toggle sidebar">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative hidden w-64 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-capaciti-grey" />
          <Input placeholder="Search…" className="pl-9" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-capaciti-navy">{profile?.full_name ?? '…'}</p>
          <p className="text-xs capitalize text-capaciti-grey">{profile?.role ?? ''}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSignOut} aria-label="Sign out">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
