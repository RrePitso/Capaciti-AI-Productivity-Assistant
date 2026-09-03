// src/components/ui/Badge.tsx
import { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', {
  variants: {
    tone: {
      neutral: 'bg-capaciti-grey-light text-capaciti-navy',
      blue: 'bg-blue-50 text-capaciti-blue',
      green: 'bg-green-50 text-green-700',
      amber: 'bg-amber-50 text-amber-700',
      red: 'bg-red-50 text-red-700',
    },
  },
  defaultVariants: { tone: 'neutral' },
});

interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
