// src/components/ui/Select.tsx
import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        'w-full rounded-card border border-border bg-white px-3 py-2 text-sm text-capaciti-navy focus:outline-none focus:ring-2 focus:ring-capaciti-blue',
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = 'Select';
