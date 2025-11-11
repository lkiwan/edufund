import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/AppIcon';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const PersonalAnalytics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d, all

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');
    const userId = localStorage.getItem('user-id');

    if (!authToken || userRole !== 'student') {
      navigate('/login');
      return;
    }

    fetchMyCampaigns(userId);
  }, [navigate]);

  const fetchMyCampaigns = async (userId) => {
    try {
      setLoading(true);
      const response = await api.campaigns.list({ userId });
      if (response.success) {
        const fetchedCampaigns = response.campaigns || [];
        setCampaigns(fetchedCampaigns);
        if (fetchedCampaigns.length > 0) {
          setSelectedCampaign(fetchedCampaigns[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate stats
  const totalRaised = campaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + (parseFloat(c.goalAmount) || 0), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + (parseInt(c.donors) || 0), 0);
  const totalViews = campaigns.reduce((sum, c) => sum + (parseInt(c.views) || 0), 0);
  const totalShares = campaigns.reduce((sum, c) => sum + (parseInt(c.shares) || 0), 0);
  const averageDonation = totalDonors > 0 ? totalRaised / totalDonors : 0;
  const overallProgress = totalGoal > 0 ? (totalRaised / totalGoal) * 100 : 0;

  // Mock donation timeline data (in real app, fetch from API)
  const donationTimeline = [
    { date: 'Week 1', amount: 5000 },
    { date: 'Week 2', amount: 8500 },
    { date: 'Week 3', amount: 12000 },
    { date: 'Week 4', amount: 15500 },
  ];

  // Campaign performance comparison
  const campaignComparison = campaigns.map(c => ({
    name: c.title.substring(0, 20) + '...',
    raised: parseFloat(c.currentAmount) || 0,
    goal: parseFloat(c.goalAmount) || 0,
    progress: c.goalAmount > 0 ? ((c.currentAmount / c.goalAmount) * 100) : 0
  }));

  // Category breakdown (mock data)
  const categoryData = [
    { name: 'Views', value: totalViews, color: '#8b5cf6' },
    { name: 'Shares', value: totalShares, color: '#3b82f6' },
    { name: 'Donors', value: totalDonors, color: '#10b981' },
  ];

  const stats = [
    {
      label: 'Total Raised',
      value: formatCurrency(totalRaised),
      icon: 'TrendingUp',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12.5%',
      changeType: 'positive'
    },
    {
      label: 'Total Donors',
      value: totalDonors,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8 this week',
      changeType: 'positive'
    },
    {
      label: 'Average Donation',
      value: formatCurrency(averageDonation),
      icon: 'Banknote',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: formatCurrency(averageDonation),
      changeType: 'neutral'
    },
    {
      label: 'Overall Progress',
      value: `${Math.round(overallProgress)}%`,
      icon: 'Target',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: `${formatCurrency(totalGoal - totalRaised)} to go`,
      changeType: 'neutral'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading your analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card variant="elevated" className="text-center py-12">
            <Icon name="BarChart3" size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Analytics Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first campaign to start tracking analytics
            </p>
            <Button onClick={() => navigate('/create-campaign')} iconName="Plus" iconPosition="left">
              Create Campaign
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-heading font-bold text-gray-900">My Campaign Analytics</h1>
              <p className="text-gray-600 mt-1">Track your campaign performance and insights</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/student-dashboard')}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <p className={`text-xs ${
                      stat.changeType === 'positive' ? 'text-green-600' :
                      stat.changeType === 'negative' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon name={stat.icon} size={24} className={stat.color} />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Time Range Selector */}
          <Card variant="elevated">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Performance Over Time</h3>
              <div className="flex items-center gap-2">
                {['7d', '30d', '90d', 'all'].map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range === '7d' ? '7 Days' :
                     range === '30d' ? '30 Days' :
                     range === '90d' ? '90 Days' :
                     'All Time'}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Donation Timeline */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Donation Timeline</Card.Title>
                <Card.Description>Track donations over time</Card.Description>
              </Card.Header>
              <Card.Content>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={donationTimeline}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} name="Donations" />
                  </LineChart>
                </ResponsiveContainer>
              </Card.Content>
            </Card>

            {/* Engagement Breakdown */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Engagement Metrics</Card.Title>
                <Card.Description>Views, shares, and donors</Card.Description>
              </Card.Header>
              <Card.Content>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card.Content>
            </Card>
          </div>

          {/* Campaign Comparison */}
          {campaigns.length > 1 && (
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Campaign Comparison</Card.Title>
                <Card.Description>Compare performance across all campaigns</Card.Description>
              </Card.Header>
              <Card.Content>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campaignComparison}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="raised" fill="#10b981" name="Amount Raised" />
                    <Bar dataKey="goal" fill="#e5e7eb" name="Goal" />
                  </BarChart>
                </ResponsiveContainer>
              </Card.Content>
            </Card>
          )}

          {/* Campaign List with Metrics */}
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Campaign Performance Details</Card.Title>
              <Card.Description>Detailed metrics for each campaign</Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {campaigns.map((campaign) => {
                  const progress = campaign.goalAmount > 0 ? ((campaign.currentAmount / campaign.goalAmount) * 100) : 0;
                  const conversionRate = campaign.views > 0 ? ((campaign.donors / campaign.views) * 100) : 0;

                  return (
                    <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Icon name="Eye" size={14} />
                              {campaign.views} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Share2" size={14} />
                              {campaign.shares} shares
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Users" size={14} />
                              {campaign.donors} donors
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="TrendingUp" size={14} />
                              {conversionRate.toFixed(2)}% conversion
                            </span>
                          </div>
                        </div>
                        <Badge variant={progress >= 100 ? 'success' : progress >= 50 ? 'default' : 'secondary'}>
                          {Math.round(progress)}% Funded
                        </Badge>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Raised</p>
                          <p className="font-bold text-gray-900">{formatCurrency(campaign.currentAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Goal</p>
                          <p className="font-bold text-gray-900">{formatCurrency(campaign.goalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Remaining</p>
                          <p className="font-bold text-gray-900">
                            {formatCurrency(Math.max(0, campaign.goalAmount - campaign.currentAmount))}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                          iconName="Eye"
                          iconPosition="left"
                        >
                          View Campaign
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                          iconName="Edit"
                          iconPosition="left"
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PersonalAnalytics;
