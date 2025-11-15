import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/AppIcon';
import { formatCurrency } from '../utils/currency';
import api from '../services/api';
import toast from '../utils/toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editedCampaign, setEditedCampaign] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');
    const email = localStorage.getItem('user-email');
    const id = localStorage.getItem('user-id');

    if (!authToken || userRole !== 'student') {
      navigate('/login');
      return;
    }

    setUserEmail(email || 'student@example.com');
    setUserId(id);
    fetchMyCampaigns(id);
  }, [navigate]);

  // Initialize editedCampaign when switching to campaign section
  useEffect(() => {
    if (activeSection === 'campaign' && campaigns.length > 0 && !editedCampaign) {
      setEditedCampaign({ ...campaigns[0] });
    }
  }, [activeSection, campaigns.length]);

  // Fetch user's campaigns from API
  const fetchMyCampaigns = async (userId) => {
    try {
      setLoading(true);
      const response = await api.campaigns.list({ userId });
      if (response.success) {
        setCampaigns(response.campaigns || []);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save campaign changes
  const handleSaveCampaign = async () => {
    if (!editedCampaign) return;

    try {
      setSaving(true);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_BASE_URL}/campaigns/${editedCampaign.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editedCampaign.title,
          description: editedCampaign.description,
          goalAmount: editedCampaign.goalAmount,
          category: editedCampaign.category,
          city: editedCampaign.city,
          university: editedCampaign.university,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Campaign updated successfully!');
        // Refresh campaigns
        fetchMyCampaigns(userId);
        setEditedCampaign(null);
      } else {
        toast.error(data.error || 'Failed to update campaign');
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      toast.error('Error updating campaign');
    } finally {
      setSaving(false);
    }
  };

  // Calculate aggregate stats from all campaigns
  const totalRaised = campaigns.reduce((sum, c) => sum + (parseFloat(c.currentAmount) || 0), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + (parseFloat(c.goalAmount) || 0), 0);
  const totalDonors = campaigns.reduce((sum, c) => sum + (parseInt(c.donors) || 0), 0);
  const totalViews = campaigns.reduce((sum, c) => sum + (parseInt(c.views) || 0), 0);

  // Get primary campaign (most recent or highest raised)
  const campaign = campaigns.length > 0 ? campaigns[0] : null;

  const stats = [
    {
      label: 'Total Raised',
      value: formatCurrency(totalRaised),
      icon: 'Banknote',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Donors',
      value: totalDonors,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Views',
      value: totalViews,
      icon: 'Eye',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'My Campaigns',
      value: campaigns.length,
      icon: 'Folder',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const percentage = campaign ? Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100) : 0;

  // Handle share campaign
  const handleShare = (campaignId) => {
    const url = `${window.location.origin}/campaign-details/${campaignId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Support My Campaign',
        text: 'Please help me reach my educational goals!',
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Campaign link copied to clipboard!');
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <Card variant="elevated" className="bg-gradient-to-r from-primary to-emerald-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-heading font-bold mb-2">
                    Welcome back! 👋
                  </h2>
                  <p className="text-white/90">
                    {campaigns.length === 0
                      ? 'Ready to create your first campaign?'
                      : campaigns.length === 1
                        ? 'Your campaign is active and doing great'
                        : `You have ${campaigns.length} active campaigns`}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/create-campaign')}
                    className="bg-white text-primary hover:bg-gray-100"
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Create New
                  </Button>
                  {campaign && (
                    <Button
                      variant="secondary"
                      onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      className="bg-white text-primary hover:bg-gray-100"
                      iconName="ExternalLink"
                      iconPosition="right"
                    >
                      View Campaign
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} variant="default" className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                      <Icon name={stat.icon} size={24} className={stat.color} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Campaign Progress */}
            {campaign && (
              <Card variant="elevated">
                <Card.Header>
                  <Card.Title>Latest Campaign Progress</Card.Title>
                  <Card.Description>{campaign.title}</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-semibold text-primary">{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={campaign.currentAmount} max={campaign.goalAmount} size="lg" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-gray-600">Raised: </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(campaign.currentAmount)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Goal: </span>
                      <span className="font-semibold text-gray-900">{formatCurrency(campaign.goalAmount)}</span>
                    </div>
                  </div>
                </Card.Content>
                <Card.Footer>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Share2"
                    iconPosition="left"
                    onClick={() => handleShare(campaign.id)}
                  >
                    Share Campaign
                  </Button>
                  <Button
                    variant="default"
                    fullWidth
                    iconName="Edit"
                    iconPosition="left"
                    onClick={() => navigate(`/edit-campaign/${campaign.id}`)}
                  >
                    Edit Campaign
                  </Button>
                </Card.Footer>
              </Card>
            )}

            {/* Quick Actions */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Quick Actions</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group">
                    <Icon name="MessageSquare" size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-primary" />
                    <p className="font-semibold text-gray-900">Post Update</p>
                    <p className="text-xs text-gray-600 mt-1">Share news with donors</p>
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group">
                    <Icon name="Mail" size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-primary" />
                    <p className="font-semibold text-gray-900">Thank Donors</p>
                    <p className="text-xs text-gray-600 mt-1">Send thank you messages</p>
                  </button>
                  <button
                    onClick={() => navigate('/personal-analytics')}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                  >
                    <Icon name="BarChart3" size={32} className="mx-auto mb-2 text-gray-400 group-hover:text-primary" />
                    <p className="font-semibold text-gray-900">View Analytics</p>
                    <p className="text-xs text-gray-600 mt-1">See detailed stats</p>
                  </button>
                </div>
              </Card.Content>
            </Card>

            {/* My Campaigns */}
            <Card variant="elevated">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title>My Campaigns</Card.Title>
                    <Card.Description>Manage all your active campaigns</Card.Description>
                  </div>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => navigate('/create-campaign')}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    New Campaign
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                {loading ? (
                  <div className="text-center py-8">
                    <Icon name="Loader2" size={48} className="text-gray-300 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading your campaigns...</p>
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Icon name="FolderOpen" size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No campaigns yet</p>
                    <p className="text-sm text-gray-500 mt-2 mb-4">
                      Create your first campaign to start raising funds
                    </p>
                    <Button onClick={() => navigate('/create-campaign')} iconName="Plus" iconPosition="left">
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((camp) => {
                      const campPercentage = Math.min((camp.currentAmount / camp.goalAmount) * 100, 100);
                      return (
                        <div key={camp.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-1">{camp.title}</h4>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Badge variant={camp.status === 'active' ? 'success' : 'default'}>
                                  {camp.status}
                                </Badge>
                                {camp.category && (
                                  <span className="flex items-center gap-1">
                                    <Icon name="Tag" size={12} />
                                    {camp.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <Progress value={camp.currentAmount} max={camp.goalAmount} size="sm" className="mb-1" />
                            <div className="flex items-center justify-between text-xs text-gray-600">
                              <span>{formatCurrency(camp.currentAmount)} raised</span>
                              <span>{Math.round(campPercentage)}% of {formatCurrency(camp.goalAmount)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/campaign-details/${camp.id}`)}
                              iconName="Eye"
                              iconPosition="left"
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/edit-campaign/${camp.id}`)}
                              iconName="Edit"
                              iconPosition="left"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(camp.id)}
                              iconName="Share2"
                              iconPosition="left"
                            >
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/personal-analytics')}
                              iconName="BarChart3"
                              iconPosition="left"
                            >
                              Analytics
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Recent Activity */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Recent Activity</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="text-center py-8">
                  <Icon name="Activity" size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Activity will appear here once donors start contributing
                  </p>
                </div>
              </Card.Content>
            </Card>
          </div>
        );

      case 'campaign':
        return (
          <div className="space-y-6">
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Campaign Management</Card.Title>
                <Card.Description>Edit and manage your campaign details</Card.Description>
              </Card.Header>
              <Card.Content>
                {editedCampaign ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Title</label>
                      <input
                        type="text"
                        value={editedCampaign.title || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter campaign title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={editedCampaign.description || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, description: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter campaign description"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goal Amount (MAD)</label>
                      <input
                        type="number"
                        value={editedCampaign.goalAmount || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, goalAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter goal amount"
                        min="0"
                        step="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editedCampaign.category || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, category: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="">Select category</option>
                        <option value="Medical">Medical</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Business">Business</option>
                        <option value="Arts">Arts</option>
                        <option value="Science">Science</option>
                        <option value="Technology">Technology</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={editedCampaign.city || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter city"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                      <input
                        type="text"
                        value={editedCampaign.university || ''}
                        onChange={(e) => setEditedCampaign({ ...editedCampaign, university: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter university"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-600">
                    No campaign selected
                  </div>
                )}
              </Card.Content>
              <Card.Footer>
                <div className="flex gap-3">
                  <Button
                    variant="default"
                    iconName="Save"
                    onClick={handleSaveCampaign}
                    disabled={!editedCampaign || saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {editedCampaign && campaign && (
                    <Button
                      variant="outline"
                      onClick={() => setEditedCampaign({ ...campaign })}
                      disabled={saving}
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </Card.Footer>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Profile Settings</Card.Title>
                <Card.Description>Manage your account information</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center gap-4 mb-6">
                  <Avatar size="2xl" fallback="ST" />
                  <div>
                    <Button variant="outline" size="sm">Change Photo</Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userEmail}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                    <Button variant="outline" size="sm">Change Password</Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation />

      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header - Modern Style */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              Student
              <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600">Manage your campaign and track your progress</p>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
              { id: 'campaign', label: 'Campaign', icon: 'Edit' },
              { id: 'profile', label: 'Profile', icon: 'User' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
