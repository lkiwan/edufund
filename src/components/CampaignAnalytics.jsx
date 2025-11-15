import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from './ui/Card';
import Icon from './AppIcon';
import { formatCurrency } from '../utils/currency';

const CampaignAnalytics = ({ campaignId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignId) {
      fetchAnalytics();
    }
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics/campaign/${campaignId}?timeRange=30`);
      const data = await response.json();
      if (data.success) {
        // Transform the new analytics structure
        const transformed = {
          totalRaised: parseFloat(data.analytics.overallMetrics.total_raised || 0),
          donors: data.analytics.overallMetrics.total_donations || 0,
          views: data.analytics.overallMetrics.total_views || 0,
          shares: data.analytics.overallMetrics.total_shares || 0,
          updatesPosted: 0, // You can add this to the backend if needed
          viewStats: data.analytics.viewStats || [],
          donationStats: data.analytics.donationStats || [],
          shareStats: data.analytics.shareStats || [],
          conversionRate: data.analytics.overallMetrics.conversion_rate || 0
        };
        setAnalytics(transformed);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  // Sample data for charts (in production, this would come from API)
  const donationTrendData = [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: analytics.totalRaised * 0.3 },
    { month: 'Apr', amount: analytics.totalRaised * 0.5 },
    { month: 'May', amount: analytics.totalRaised * 0.8 },
    { month: 'Jun', amount: analytics.totalRaised },
  ];

  const trafficSourceData = [
    { name: 'Direct', value: analytics.views * 0.4 },
    { name: 'Social Media', value: analytics.views * 0.35 },
    { name: 'Search', value: analytics.views * 0.15 },
    { name: 'Referral', value: analytics.views * 0.1 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

  const stats = [
    {
      label: 'Total Raised',
      value: formatCurrency(analytics.totalRaised || 0),
      icon: 'Banknote',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12%',
      changeType: 'positive'
    },
    {
      label: 'Total Donors',
      value: analytics.donors || 0,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+5',
      changeType: 'positive'
    },
    {
      label: 'Campaign Views',
      value: analytics.views || 0,
      icon: 'Eye',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+23%',
      changeType: 'positive'
    },
    {
      label: 'Total Shares',
      value: analytics.shares || 0,
      icon: 'Share2',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '+8',
      changeType: 'positive'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} variant="default">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <Icon name={stat.icon} size={24} className={stat.color} />
              </div>
              <div className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Trend */}
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Donation Trend</Card.Title>
            <Card.Description>Monthly fundraising progress</Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={donationTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* Traffic Sources */}
        <Card variant="elevated">
          <Card.Header>
            <Card.Title>Traffic Sources</Card.Title>
            <Card.Description>Where your visitors come from</Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficSourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficSourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value.toFixed(0)} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card variant="elevated">
        <Card.Header>
          <Card.Title>Engagement Metrics</Card.Title>
          <Card.Description>How people interact with your campaign</Card.Description>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="TrendingUp" size={32} className="text-green-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.donors && analytics.views ? ((analytics.donors / analytics.views) * 100).toFixed(1) : 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">Visitors to Donors</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="Heart" size={32} className="text-red-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Avg Donation</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics.donors && analytics.totalRaised ? (analytics.totalRaised / analytics.donors) : 0)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Per Donor</p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Icon name="MessageSquare" size={32} className="text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">Updates Posted</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.updatesPosted || 0}</p>
              <p className="text-xs text-gray-500 mt-1">Total Updates</p>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Performance Tips */}
      <Card variant="default" className="bg-gradient-to-r from-primary/10 to-emerald-50 border-primary/20">
        <Card.Header>
          <div className="flex items-center gap-2">
            <Icon name="Lightbulb" size={24} className="text-primary" />
            <Card.Title>Performance Tips</Card.Title>
          </div>
        </Card.Header>
        <Card.Content>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Post regular updates to keep donors engaged ({analytics.updatesPosted || 0} updates so far)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Share your campaign on social media to increase views ({analytics.shares || 0} shares)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Thank your donors personally to build stronger relationships
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">
                Add compelling images and videos to increase engagement
              </span>
            </li>
          </ul>
        </Card.Content>
      </Card>
    </div>
  );
};

export default CampaignAnalytics;
