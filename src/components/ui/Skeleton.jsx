import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular', width, height, count = 1 }) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
  };

  const skeletonStyle = {
    width: width || '100%',
    height: height || (variant === 'text' ? '1rem' : '100%'),
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={skeletonStyle}
    />
  ));

  return count === 1 ? skeletons[0] : <div className="space-y-2">{skeletons}</div>;
};

// Campaign Card Skeleton
export const CampaignCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Skeleton variant="rectangular" height="200px" />
    <div className="p-4 space-y-3">
      <Skeleton variant="text" />
      <Skeleton variant="text" width="60%" />
      <div className="flex gap-2">
        <Skeleton variant="circular" width="32px" height="32px" />
        <Skeleton variant="text" width="120px" />
      </div>
    </div>
  </div>
);

export default Skeleton;
