// src/components/ui/Textarea.tsx
import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-card border border-border bg-white px-3 py-2 text-sm text-capaciti-navy placeholder:text-capaciti-grey focus:outline-none focus:ring-2 focus:ring-capaciti-blue',
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = 'Textarea';
