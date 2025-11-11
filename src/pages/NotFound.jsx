import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Icon from '../components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="text-center">
        <div className="mb-8">
          <Icon name="AlertCircle" size={80} className="text-primary mx-auto mb-4" />
          <h1 className="text-6xl font-heading font-bold text-foreground mb-2">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Page Not Found
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Go Back
          </Button>
          <Button
            variant="default"
            onClick={() => navigate('/')}
            iconName="Home"
            iconPosition="left"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
