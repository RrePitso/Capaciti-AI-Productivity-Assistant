// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  Users2,
  ListChecks,
  FileBarChart,
  GraduationCap,
  BarChart3,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/useUIStore';

// Order follows "Recommended Navigation Order" in the UX Design Specification.
const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/communications', label: 'Smart Email Generator', icon: Mail },
  { href: '/meetings', label: 'Meeting Summaries', icon: Users2 },
  { href: '/tasks', label: 'Task Planner', icon: ListChecks },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/learners', label: 'Learner Support', icon: GraduationCap },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/administration', label: 'Administration', icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);

  return (
    <aside
      className={cn(
        'hidden shrink-0 border-r border-border bg-white transition-all md:block',
        sidebarOpen ? 'w-[280px]' : 'w-[72px]'
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        <span className="text-sm font-bold text-capaciti-blue">
          {sidebarOpen ? 'CAPACITI AI' : 'CA'}
        </span>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-card px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-capaciti-blue'
                  : 'text-capaciti-grey hover:bg-capaciti-grey-light hover:text-capaciti-navy'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
