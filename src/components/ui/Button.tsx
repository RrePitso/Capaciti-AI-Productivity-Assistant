// src/components/ui/Button.tsx
'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-card text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none min-h-[44px] px-4',
  {
    variants: {
      variant: {
        primary: 'bg-capaciti-blue text-white hover:bg-capaciti-blue-dark',
        secondary: 'bg-capaciti-grey-light text-capaciti-navy hover:bg-gray-200',
        outline: 'border border-border bg-transparent hover:bg-capaciti-grey-light',
        ghost: 'hover:bg-capaciti-grey-light',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        default: '',
        sm: 'min-h-[36px] px-3 text-xs',
        icon: 'min-h-[44px] w-11 px-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
