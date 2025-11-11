import React, { useState } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import api from '../services/api';

/**
 * ShareButtons Component
 * Provides social sharing functionality with database tracking
 * Supports: Copy Link, Facebook, Twitter, WhatsApp, LinkedIn, Email
 */
const ShareButtons = ({ campaignId, campaignTitle, campaignUrl }) => {
  const [showCopied, setShowCopied] = useState(false);
  const [shareCount, setShareCount] = useState(0);

  // Get full campaign URL
  const fullUrl = campaignUrl || `${window.location.origin}/campaigns/${campaignId}`;

  // Encode for URLs
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedTitle = encodeURIComponent(campaignTitle);

  // Track share in database
  const trackShare = async (platform) => {
    try {
      await api.post(`/campaigns/${campaignId}/share`, { platform });
      console.log(`Share tracked: ${platform}`);
    } catch (error) {
      console.error('Error tracking share:', error);
    }
  };

  // Copy link to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setShowCopied(true);
      trackShare('clipboard');

      // Hide message after 2 seconds
      setTimeout(() => setShowCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = fullUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopied(true);
      trackShare('clipboard');
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  // Share to Facebook
  const shareToFacebook = () => {
    trackShare('facebook');
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // Share to Twitter
  const shareToTwitter = () => {
    trackShare('twitter');
    const text = `Check out this campaign: ${campaignTitle}`;
    window.open(
      `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(text)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    trackShare('whatsapp');
    const text = `Check out this campaign: ${campaignTitle} - ${fullUrl}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      '_blank'
    );
  };

  // Share to LinkedIn
  const shareToLinkedIn = () => {
    trackShare('linkedin');
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      '_blank',
      'width=600,height=400'
    );
  };

  // Share via Email
  const shareViaEmail = () => {
    trackShare('email');
    const subject = `Campaign: ${campaignTitle}`;
    const body = `I wanted to share this campaign with you:\n\n${campaignTitle}\n\n${fullUrl}\n\nEvery contribution helps make a difference!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div className="relative">
      {/* Share Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Icon name="Share2" size={16} />
          Share Campaign
        </h3>
      </div>

      {/* Share Buttons Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* Copy Link Button */}
        <button
          onClick={copyToClipboard}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-all group relative"
          title="Copy Link"
        >
          <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
            <Icon name="Link" size={20} className="text-gray-600 group-hover:text-primary" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-primary">
            Copy Link
          </span>
        </button>

        {/* Facebook Button */}
        <button
          onClick={shareToFacebook}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
          title="Share on Facebook"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-500 flex items-center justify-center transition-colors">
            <Icon name="Facebook" size={20} className="text-blue-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
            Facebook
          </span>
        </button>

        {/* Twitter Button */}
        <button
          onClick={shareToTwitter}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-sky-500 hover:bg-sky-50 transition-all group"
          title="Share on Twitter"
        >
          <div className="w-10 h-10 rounded-full bg-sky-100 group-hover:bg-sky-500 flex items-center justify-center transition-colors">
            <Icon name="Twitter" size={20} className="text-sky-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-sky-600">
            Twitter
          </span>
        </button>

        {/* WhatsApp Button */}
        <button
          onClick={shareToWhatsApp}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all group"
          title="Share on WhatsApp"
        >
          <div className="w-10 h-10 rounded-full bg-green-100 group-hover:bg-green-500 flex items-center justify-center transition-colors">
            <Icon name="MessageCircle" size={20} className="text-green-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-green-600">
            WhatsApp
          </span>
        </button>

        {/* LinkedIn Button */}
        <button
          onClick={shareToLinkedIn}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-blue-700 hover:bg-blue-50 transition-all group"
          title="Share on LinkedIn"
        >
          <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-700 flex items-center justify-center transition-colors">
            <Icon name="Linkedin" size={20} className="text-blue-700 group-hover:text-white" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-blue-700">
            LinkedIn
          </span>
        </button>

        {/* Email Button */}
        <button
          onClick={shareViaEmail}
          className="flex flex-col items-center gap-2 p-3 rounded-lg border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all group"
          title="Share via Email"
        >
          <div className="w-10 h-10 rounded-full bg-purple-100 group-hover:bg-purple-500 flex items-center justify-center transition-colors">
            <Icon name="Mail" size={20} className="text-purple-600 group-hover:text-white" />
          </div>
          <span className="text-xs font-medium text-gray-600 group-hover:text-purple-600">
            Email
          </span>
        </button>
      </div>

      {/* Copied Message */}
      {showCopied && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-12 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-bounce">
          <Icon name="Check" size={16} />
          <span className="text-sm font-medium">Link copied!</span>
        </div>
      )}

      {/* Share Tips */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <Icon name="Info" size={14} className="inline mr-1" />
          <strong>Tip:</strong> Share on multiple platforms to reach more potential donors!
        </p>
      </div>
    </div>
  );
};

export default ShareButtons;
