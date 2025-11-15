import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Icon from './AppIcon';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';

const ActivityFeed = ({ limit = 20, showHeader = true }) => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Refresh every 30 seconds for live updates
    const interval = setInterval(fetchActivities, 30000);
    return () => clearInterval(interval);
  }, [limit]);

  const fetchActivities = async () => {
    try {
      const response = await api.analytics.getActivityFeed({ limit });
      if (response?.success) {
        setActivities(response.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const renderActivity = (activity) => {
    switch (activity.type) {
      case 'donation':
        return (
          <div
            key={`donation-${activity.id}`}
            className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(`/campaign/${activity.campaign_id}`)}
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Heart" size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.donor_name}</span>
                {' donated '}
                <span className="font-bold text-green-600">{formatCurrency(activity.amount)}</span>
                {' to '}
                <span className="font-medium text-primary hover:underline">
                  {activity.campaign_title}
                </span>
              </p>
              {activity.message && (
                <p className="text-xs text-gray-600 mt-1 italic">"{activity.message}"</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
            </div>
          </div>
        );

      case 'campaign':
        return (
          <div
            key={`campaign-${activity.id}`}
            className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(`/campaign/${activity.id}`)}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Icon name="Megaphone" size={20} className="text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{activity.organizer_name}</span>
                {' launched a new campaign: '}
                <span className="font-medium text-primary hover:underline">
                  {activity.title}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
            </div>
          </div>
        );

      case 'milestone':
        const percentage = Math.floor(activity.percentage);
        let milestoneText = '';
        let milestoneIcon = '';
        let milestoneColor = '';

        if (percentage >= 100) {
          milestoneText = 'reached their goal';
          milestoneIcon = 'Trophy';
          milestoneColor = 'text-yellow-600 bg-yellow-100';
        } else if (percentage >= 75) {
          milestoneText = 'reached 75% of their goal';
          milestoneIcon = 'Star';
          milestoneColor = 'text-orange-600 bg-orange-100';
        } else if (percentage >= 50) {
          milestoneText = 'reached halfway to their goal';
          milestoneIcon = 'Target';
          milestoneColor = 'text-green-600 bg-green-100';
        } else {
          milestoneText = 'reached 25% of their goal';
          milestoneIcon = 'TrendingUp';
          milestoneColor = 'text-blue-600 bg-blue-100';
        }

        return (
          <div
            key={`milestone-${activity.campaign_id}-${percentage}`}
            className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            onClick={() => navigate(`/campaign/${activity.campaign_id}`)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${milestoneColor}`}>
              <Icon name={milestoneIcon} size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-medium text-primary hover:underline">
                  {activity.campaign_title}
                </span>
                {' '}
                <span className="font-semibold">{milestoneText}!</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(activity.current_amount)} of {formatCurrency(activity.target_amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.created_at)}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card variant="default" padding="md">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="none" className="overflow-hidden">
      {showHeader && (
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Icon name="Activity" size={24} className="text-primary" />
              <div>
                <h3 className="text-lg font-heading font-bold text-gray-900">
                  Live Activity Feed
                </h3>
                <p className="text-sm text-gray-600">
                  Real-time updates from across the platform
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-600">Live</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="Wind" size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No recent activity</p>
            <p className="text-sm text-gray-400 mt-1">
              Check back soon for updates!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => renderActivity(activity))}
          </div>
        )}
      </div>

      {activities.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 text-center">
          <button
            onClick={fetchActivities}
            className="text-sm text-primary hover:underline font-medium"
          >
            Refresh Activity
          </button>
        </div>
      )}
    </Card>
  );
};

export default ActivityFeed;
