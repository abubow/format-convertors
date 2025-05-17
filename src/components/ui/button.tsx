import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isActive = false, children, ...props }, ref) => {
    const baseStyles = "font-medium rounded-xl transition-all duration-200 focus:outline-none inline-flex items-center justify-center";
    
    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
      secondary: isActive 
        ? "bg-gradient-to-br from-card/80 to-card/50 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] text-foreground" 
        : "bg-gradient-to-br from-card to-card/70 shadow-[4px_4px_10px_rgba(0,0,0,0.05),-4px_-4px_10px_rgba(255,255,255,0.8)] hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.03),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] text-foreground",
      outline: "bg-transparent border border-border hover:bg-card/50 text-foreground",
      ghost: "bg-transparent hover:bg-card/50 text-foreground/80 hover:text-foreground"
    };
    
    const sizeStyles = {
      sm: "text-xs h-8 px-3",
      md: "text-sm h-10 px-4",
      lg: "text-base h-12 px-6"
    };
    
    return (
      <button
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
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button }; 