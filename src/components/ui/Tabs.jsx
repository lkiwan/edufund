import React, { useState } from 'react';

const Tabs = ({ children, defaultValue, className = "", onChange }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value) => {
    setActiveTab(value);
    if (onChange) onChange(value);
  };

  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange, className = "", variant = "default" }) => {
  const variantClasses = {
    default: "border-b border-border",
    pills: "bg-muted p-1 rounded-lg inline-flex",
    underline: "space-x-8"
  };

  return (
    <div className={`flex ${variantClasses[variant]} ${className}`}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onTabChange, variant })
      )}
    </div>
  );
};

const TabsTrigger = ({ value, children, activeTab, onTabChange, variant = "default", className = "" }) => {
  const isActive = activeTab === value;

  const variantClasses = {
    default: isActive
      ? "border-b-2 border-primary text-primary"
      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent",
    pills: isActive
      ? "bg-background text-foreground shadow-sm"
      : "text-muted-foreground hover:text-foreground",
    underline: isActive
      ? "border-b-2 border-primary text-primary"
      : "text-muted-foreground hover:text-foreground"
  };

  const baseClasses = variant === "pills"
    ? "px-4 py-2 rounded-md font-medium text-sm transition-all"
    : "px-4 py-3 font-semibold text-sm transition-colors";

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, activeTab, className = "" }) => {
  if (activeTab !== value) return null;

  return (
    <div className={`py-4 animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
