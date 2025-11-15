import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './ui/Card';
import Button from './ui/Button';
import Icon from './AppIcon';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';

const TrendingSection = () => {
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('day');

  useEffect(() => {
    fetchTrending();
  }, [period]);

  const fetchTrending = async () => {
    setLoading(true);
    try {
      const response = await api.analytics.getTrending({ period, limit: 6 });
      if (response?.success) {
        setTrending(response.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching trending campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysLeft = (deadline) => {
    const days = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (trending.length === 0) {
    return null;
  }

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={28} className="text-orange-500" />
            <h2 className="text-3xl font-heading font-bold text-gray-900">
              Trending Now
            </h2>
          </div>
          <p className="text-gray-600">
            Hot campaigns gaining momentum right now
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {[
            { value: 'hour', label: 'Hour' },
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'Week' },
            { value: 'month', label: 'Month' }
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                period === p.value
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trending.map((campaign, index) => {
          const progress = calculateProgress(campaign.current_amount, campaign.target_amount);
          const daysLeft = getDaysLeft(campaign.deadline);

          return (
            <Card
              key={campaign.id}
              variant="elevated"
              className="group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              onClick={() => navigate(`/campaign/${campaign.id}`)}
            >
              {/* Trending Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 shadow-lg">
                  <Icon name="Flame" size={14} />
                  <span>#{index + 1} Trending</span>
                </div>
                {campaign.recent_views > 50 && (
                  <div className="bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                    <Icon name="Eye" size={12} />
                    <span>{campaign.recent_views}</span>
                  </div>
                )}
              </div>

              {/* Campaign Image */}
              <div className="relative h-48 overflow-hidden rounded-t-xl">
                <img
                  src={campaign.image_url || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'}
                  alt={campaign.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>

              <div className="p-6">
                {/* Category & Location */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {campaign.category || 'Education'}
                  </span>
                  {campaign.location && (
                    <span className="text-xs text-gray-500 flex items-center">
                      <Icon name="MapPin" size={12} className="mr-1" />
                      {campaign.location}
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {campaign.title}
                </h3>

                {/* Organizer */}
                <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                  <Icon name="User" size={14} />
                  <span>{campaign.organizer_name || campaign.organizer_email}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(campaign.current_amount)}
                    </span>
                    <span className="text-gray-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-emerald-600 transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Goal: {formatCurrency(campaign.target_amount)}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} />
                      <span>{campaign.total_donors || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{daysLeft}d left</span>
                    </div>
                  </div>
                  <Icon
                    name="ArrowRight"
                    size={20}
                    className="text-primary group-hover:translate-x-1 transition-transform"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={() => navigate('/discover')}
          iconName="TrendingUp"
        >
          View All Trending Campaigns
        </Button>
      </div>
    </section>
  );
};

export default TrendingSection;
