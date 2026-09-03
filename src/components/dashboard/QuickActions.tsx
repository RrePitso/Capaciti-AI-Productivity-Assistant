// src/components/dashboard/QuickActions.tsx
import Link from 'next/link';
import { Mail, Users2, FileBarChart, GraduationCap, ListChecks } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';

const ACTIONS = [
  { href: '/communications', label: 'Generate Email', icon: Mail },
  { href: '/meetings', label: 'Summarize Meeting', icon: Users2 },
  { href: '/reports', label: 'Create Report', icon: FileBarChart },
  { href: '/learners', label: 'Ask Learner Assistant', icon: GraduationCap },
  { href: '/tasks', label: 'Add Task', icon: ListChecks },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {ACTIONS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2 rounded-card border border-border px-3 py-2 text-sm font-medium text-capaciti-navy hover:bg-capaciti-grey-light"
          >
            <Icon className="h-4 w-4 text-capaciti-blue" />
            {label}
          </Link>
        ))}
      </div>
    </Card>
  );
}
