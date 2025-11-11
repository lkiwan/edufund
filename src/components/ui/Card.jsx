import React from 'react';
import { cva } from 'class-variance-authority';

const cardVariants = cva(
  "rounded-lg transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-card border border-border shadow-sm",
        elevated: "bg-card shadow-md hover:shadow-lg",
        outline: "bg-transparent border-2 border-border",
        ghost: "bg-transparent",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

const Card = ({
  children,
  variant,
  padding,
  className = "",
  hover = false,
  onClick,
  ...props
}) => {
  return (
    <div
      className={`${cardVariants({ variant, padding })} ${hover ? 'cursor-pointer hover:shadow-lg' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-xl font-heading font-bold text-foreground ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-muted-foreground mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "" }) => (
  <div className={`mt-4 flex items-center gap-4 ${className}`}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
