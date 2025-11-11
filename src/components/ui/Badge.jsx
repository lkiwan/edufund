import React from 'react';
import { cva } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center font-medium rounded-full transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success/10 text-success border border-success/20",
        warning: "bg-warning/10 text-warning border border-warning/20",
        error: "bg-destructive/10 text-destructive border border-destructive/20",
        outline: "border-2 border-border bg-transparent text-foreground",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-3 py-1 text-sm",
        lg: "px-4 py-1.5 text-base",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

const Badge = ({
  children,
  variant,
  size,
  className = "",
  icon,
  ...props
}) => {
  return (
    <span
      className={`${badgeVariants({ variant, size })} ${className}`}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
