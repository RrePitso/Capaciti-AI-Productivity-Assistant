// src/components/dashboard/KpiCard.tsx
import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendTone?: 'positive' | 'negative' | 'neutral';
}

export function KpiCard({ label, value, icon: Icon, trend, trendTone = 'neutral' }: KpiCardProps) {
  return (
    <Card className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-capaciti-grey">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-capaciti-navy">{value}</p>
        {trend && (
          <p
            className={cn(
              'mt-1 text-xs font-medium',
              trendTone === 'positive' && 'text-green-600',
              trendTone === 'negative' && 'text-red-600',
              trendTone === 'neutral' && 'text-capaciti-grey'
            )}
          >
            {trend}
          </p>
        )}
      </div>
      <div className="rounded-card bg-blue-50 p-2 text-capaciti-blue">
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}
