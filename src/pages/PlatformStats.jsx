import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Card from '../components/ui/Card';
import Icon from '../components/AppIcon';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';
import ActivityFeed from '../components/ActivityFeed';
import TrendingSection from '../components/TrendingSection';

const PlatformStats = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.analytics.getPlatform({ timeRange });
      if (response?.success) {
        setStats(response.statistics);
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="BarChart3" size={32} className="text-primary" />
                <h1 className="text-4xl font-heading font-bold text-gray-900">
                  Platform Statistics
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Real-time analytics and platform-wide metrics
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center space-x-2 bg-white rounded-lg p-1 shadow-sm">
              {[
                { value: '7', label: '7 Days' },
                { value: '30', label: '30 Days' },
                { value: '90', label: '90 Days' },
                { value: '365', label: 'All Time' }
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setTimeRange(range.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {stats && (
          <>
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Campaigns */}
              <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-blue-50 to-white border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.platformMetrics.total_campaigns?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.platformMetrics.active_campaigns || 0} active
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Icon name="Megaphone" size={32} className="text-blue-600" />
                  </div>
                </div>
              </Card>

              {/* Total Raised */}
              <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-green-50 to-white border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Raised</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {formatCurrency(stats.platformMetrics.total_raised || 0)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      From {stats.platformMetrics.total_donations?.toLocaleString() || 0} donations
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Icon name="DollarSign" size={32} className="text-green-600" />
                  </div>
                </div>
              </Card>

              {/* Total Users */}
              <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Users</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.platformMetrics.total_users?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.platformMetrics.total_students || 0} students
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Icon name="Users" size={32} className="text-purple-600" />
                  </div>
                </div>
              </Card>

              {/* Success Rate */}
              <Card variant="elevated" padding="lg" className="bg-gradient-to-br from-orange-50 to-white border-orange-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-4xl font-bold text-gray-900">
                      {stats.platformMetrics.success_rate?.toFixed(1) || 0}%
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {stats.platformMetrics.completed_campaigns || 0} completed
                    </p>
                  </div>
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <Icon name="Trophy" size={32} className="text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Top Campaigns */}
            {stats.topCampaigns && stats.topCampaigns.length > 0 && (
              <Card variant="default" padding="lg" className="mb-8">
                <div className="flex items-center space-x-2 mb-6">
                  <Icon name="Star" size={24} className="text-yellow-500" />
                  <h2 className="text-2xl font-heading font-bold text-gray-900">
                    Top Performing Campaigns
                  </h2>
                </div>

                <div className="space-y-4">
                  {stats.topCampaigns.slice(0, 5).map((campaign, index) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/campaign/${campaign.id}`)}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-600' :
                          index === 1 ? 'bg-gray-200 text-gray-600' :
                          index === 2 ? 'bg-orange-100 text-orange-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 hover:text-primary">
                            {campaign.title}
                          </h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600">
                              <Icon name="Heart" size={14} className="inline mr-1" />
                              {campaign.donors_count} donors
                            </span>
                            <span className="text-sm text-gray-600">
                              {campaign.funding_percentage?.toFixed(0)}% funded
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatCurrency(campaign.current_amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          of {formatCurrency(campaign.target_amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Trending Campaigns Section */}
            <div className="mb-8">
              <TrendingSection />
            </div>

            {/* Activity Feed */}
            <div className="mb-8">
              <ActivityFeed limit={30} />
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PlatformStats;
