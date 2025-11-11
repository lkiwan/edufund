import React from 'react';
import Image from '../AppImage';

const Avatar = ({
  src,
  alt = "Avatar",
  size = "md", // sm, md, lg, xl
  fallback,
  className = ""
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-20 h-20 text-xl"
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden bg-muted flex items-center justify-center ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-muted-foreground">
          {fallback || getInitials(alt)}
        </span>
      )}
    </div>
  );
};

export default Avatar;
