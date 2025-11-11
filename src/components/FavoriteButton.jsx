import React, { useState, useEffect } from 'react';
import Icon from './AppIcon';
import api from '../services/api';
import toast from '../utils/toast';

/**
 * FavoriteButton Component
 * Allows users to bookmark/follow campaigns
 * Shows filled heart when favorited, outline when not
 */
const FavoriteButton = ({ campaignId, userId, variant = 'default', showText = false, size = 'md', fullWidth = false }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Icon sizes based on variant
  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  useEffect(() => {
    checkFavoriteStatus();
  }, [campaignId, userId]);

  // Check if campaign is already favorited
  const checkFavoriteStatus = async () => {
    if (!userId || !campaignId) {
      setChecking(false);
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/campaigns/${campaignId}/favorite/check?userId=${userId}`
      );
      const data = await response.json();
      if (data.success) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    } finally {
      setChecking(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (e) => {
    e.stopPropagation(); // Prevent triggering parent click handlers (like card clicks)

    if (!userId) {
      toast.info('Please login to save campaigns');
      return;
    }

    if (loading) return;

    setLoading(true);
    const newFavoritedState = !isFavorited;

    try {
      const response = await api.post(`/campaigns/${campaignId}/favorite`, {
        userId: userId,
        action: isFavorited ? 'remove' : 'add'
      });

      if (response.success) {
        setIsFavorited(newFavoritedState);
        toast.success(
          newFavoritedState
            ? 'Campaign saved to favorites!'
            : 'Campaign removed from favorites'
        );
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if checking
  if (checking) {
    return null;
  }

  // Default variant - Icon button with optional text
  if (variant === 'default' || variant === 'icon') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={!userId || loading}
        className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${!userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isFavorited
            ? 'text-red-600 bg-red-50 hover:bg-red-100'
            : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
          }
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
        title={!userId ? 'Login to save' : isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Icon
          name={isFavorited ? 'Heart' : 'Heart'}
          size={iconSizes[size]}
          className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
        />
        {showText && (
          <span className="text-sm font-medium">
            {isFavorited ? 'Saved' : 'Save'}
          </span>
        )}
      </button>
    );
  }

  // Minimal variant - Just icon, no background
  if (variant === 'minimal') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={!userId || loading}
        className={`
          p-2 rounded-full transition-all
          ${!userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${isFavorited ? 'text-red-600' : 'text-gray-400 hover:text-red-600'}
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
        title={!userId ? 'Login to save' : isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Icon
          name="Heart"
          size={iconSizes[size]}
          className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
        />
      </button>
    );
  }

  // Badge variant - Shows on top of campaign cards
  if (variant === 'badge') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={!userId || loading}
        className={`
          absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all shadow-lg z-10
          ${!userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-110'}
          ${isFavorited
            ? 'bg-white text-red-600'
            : 'bg-white/80 text-gray-600 hover:text-red-600'
          }
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
        title={!userId ? 'Login to save' : isFavorited ? 'Remove from favorites' : 'Save to favorites'}
      >
        <Icon
          name="Heart"
          size={iconSizes[size]}
          className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
        />
      </button>
    );
  }

  // Full button variant with text
  if (variant === 'button') {
    return (
      <button
        onClick={toggleFavorite}
        disabled={!userId || loading}
        className={`
          inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-medium transition-all
          ${fullWidth ? 'w-full' : ''}
          ${!userId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isFavorited
            ? 'bg-red-600 text-white hover:bg-red-700'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }
          ${loading ? 'opacity-50 cursor-wait' : ''}
        `}
        title={!userId ? 'Login to save' : ''}
      >
        <Icon
          name="Heart"
          size={iconSizes[size]}
          className={`transition-all ${isFavorited ? 'fill-current' : ''}`}
        />
        <span>{isFavorited ? 'Saved' : 'Save Campaign'}</span>
      </button>
    );
  }

  return null;
};

export default FavoriteButton;
