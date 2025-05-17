import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'inset' | 'flat';
  size?: 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'raised', size = 'md', children, ...props }, ref) => {
    const baseStyles = "rounded-2xl overflow-hidden transition-all duration-300";
    
    const variantStyles = {
      raised: "bg-gradient-to-br from-amber-50 to-amber-100 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[10px_10px_20px_rgba(0,0,0,0.1),-10px_-10px_20px_rgba(255,255,255,0.8)]",
      inset: "bg-gradient-to-tr from-amber-100 to-amber-50 shadow-[inset_8px_8px_16px_rgba(0,0,0,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]",
      flat: "bg-amber-50 border border-amber-200"
    };
    
    const sizeStyles = {
      sm: "p-3",
      md: "p-5",
      lg: "p-7"
    };
    
    return (
      <div
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export { Card }; 