// src/components/ui/Input.tsx
import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-card border border-border bg-white px-3 py-2 text-sm text-capaciti-navy placeholder:text-capaciti-grey focus:outline-none focus:ring-2 focus:ring-capaciti-blue',
        className
      )}
      {...props}
    />
  )
);
Input.displayName = 'Input';

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1 block text-xs font-medium text-capaciti-navy', className)} {...props} />
);
