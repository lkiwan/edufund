import React from 'react';

const Progress = ({
  value = 0,
  max = 100,
  size = "md", // sm, md, lg
  variant = "default", // default, success, warning, error
  showLabel = false,
  showMilestones = false,
  className = ""
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-destructive"
  };

  const milestones = [25, 50, 75, 100];

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div className="relative">
        <div className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}>
          <div
            className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${variantClasses[variant]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Milestone Markers */}
        {showMilestones && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {milestones.map((milestone) => (
              <div
                key={milestone}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${milestone}%` }}
              >
                <div
                  className={`w-1 ${
                    size === 'lg' ? 'h-5' : size === 'md' ? 'h-4' : 'h-3'
                  } -translate-x-1/2 ${
                    percentage >= milestone
                      ? 'bg-yellow-400'
                      : 'bg-gray-300'
                  } rounded-full shadow-sm`}
                  title={`${milestone}% milestone`}
                />
                {size === 'lg' && (
                  <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-gray-500">
                      {milestone === 25 && '🎉'}
                      {milestone === 50 && '🚀'}
                      {milestone === 75 && '⭐'}
                      {milestone === 100 && '🏆'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;
