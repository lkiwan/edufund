import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/AppIcon';
import Image from '../components/AppImage';
import Input from '../components/ui/Input';
import { formatCurrency } from '../utils/currency';
import toast from '../utils/toast';

const DonorDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [filteredDonations, setFilteredDonations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');
    const email = localStorage.getItem('user-email');

    if (!authToken || userRole !== 'donor') {
      navigate('/login');
      return;
    }

    setUserEmail(email || 'donor@example.com');

    // Fetch donations
    if (email) {
      fetchDonations(email);
    }
  }, [navigate]);

  // Fetch donations by email
  const fetchDonations = async (email) => {
    try {
      setLoading(true);
      console.log('🔍 Fetching donations for email:', email);
      const response = await fetch(`${API_BASE_URL}/donations/by-email/${encodeURIComponent(email)}`);
      const data = await response.json();
      console.log('📊 Donations response:', data);

      if (data.success) {
        console.log('✅ Found', data.donations?.length || 0, 'donations');
        setDonations(data.donations || []);
        setFilteredDonations(data.donations || []);
      } else {
        console.log('❌ Fetch failed:', data);
      }
    } catch (err) {
      console.error('❌ Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search donations
  useEffect(() => {
    if (searchTerm) {
      const filtered = donations.filter(d =>
        d.campaignTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.studentName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDonations(filtered);
    } else {
      setFilteredDonations(donations);
    }
  }, [searchTerm, donations]);

  // Calculate stats from real data
  const donorStats = {
    totalDonated: donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0),
    campaignsSupported: new Set(donations.map(d => d.campaignId)).size,
    studentsHelped: new Set(donations.map(d => d.campaignId)).size,
    impactScore: Math.min(95, Math.floor(donations.length * 10 + donations.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0) / 100))
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const favoriteCampaigns = [
    {
      id: 1,
      title: 'Engineering Studies at MIT',
      studentName: 'Michael Chen',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400',
      goalAmount: 25000,
      currentAmount: 18750,
      category: 'Engineering'
    }
  ];

  const stats = [
    {
      label: 'Total Donated',
      value: formatCurrency(donorStats.totalDonated),
      icon: 'Banknote',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Campaigns Supported',
      value: donorStats.campaignsSupported,
      icon: 'Heart',
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      label: 'Students Helped',
      value: donorStats.studentsHelped,
      icon: 'Users',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Impact Score',
      value: donorStats.impactScore,
      icon: 'Star',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ];

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
                    Thank you for your generosity! 💙
                  </h2>
                  <p className="text-white/90">
                    You've helped {donorStats.studentsHelped} students achieve their dreams
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/discover')}
                  className="bg-white text-primary hover:bg-gray-100"
                  iconName="Search"
                  iconPosition="right"
                >
                  Find More Campaigns
                </Button>
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

            {/* Impact Summary */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Your Impact</Card.Title>
                <Card.Description>See how your donations are making a difference</Card.Description>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div className="p-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="TrendingUp" size={32} className="text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(donorStats.totalDonated)}</p>
                    <p className="text-sm text-gray-600">Total Contributions</p>
                  </div>
                  <div className="p-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="GraduationCap" size={32} className="text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">5</p>
                    <p className="text-sm text-gray-600">Students Supported</p>
                  </div>
                  <div className="p-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon name="Award" size={32} className="text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">95%</p>
                    <p className="text-sm text-gray-600">Impact Score</p>
                  </div>
                </div>
              </Card.Content>
            </Card>

            {/* Recent Donations */}
            <Card variant="elevated">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title>Recent Donations</Card.Title>
                    <Card.Description>Your latest contributions</Card.Description>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveSection('history')}
                    iconName="ArrowRight"
                    iconPosition="right"
                  >
                    View All
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                {filteredDonations.slice(0, 3).length > 0 ? (
                  <div className="space-y-4">
                    {filteredDonations.slice(0, 3).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{donation.campaignTitle}</h4>
                          <p className="text-sm text-gray-600">by {donation.studentName}</p>
                          <p className="text-xs text-gray-500 mt-1">{donation.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">{formatCurrency(donation.amount)}</p>
                          <Badge variant="success" size="sm">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Heart" size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No donations yet</p>
                  </div>
                )}
              </Card.Content>
            </Card>

            {/* Favorite Campaigns */}
            <Card variant="elevated">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <div>
                    <Card.Title>Favorite Campaigns</Card.Title>
                    <Card.Description>Campaigns you're following</Card.Description>
                  </div>
                  <Button variant="ghost" size="sm" iconName="Plus" iconPosition="left">
                    Add Favorite
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                {favoriteCampaigns.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {favoriteCampaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      >
                        <div className="h-32 bg-gray-100">
                          <Image
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-1 line-clamp-1">{campaign.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">by {campaign.studentName}</p>
                          <Progress
                            value={campaign.currentAmount}
                            max={campaign.goalAmount}
                            size="sm"
                            className="mb-2"
                          />
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {formatCurrency(campaign.currentAmount)} raised
                            </span>
                            <span className="text-primary font-semibold">
                              {Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Icon name="Star" size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No favorite campaigns yet</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-6">
            {/* Search and Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by campaign or student name..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Donations</p>
                <p className="text-2xl font-bold text-primary">{filteredDonations.length}</p>
              </div>
            </div>

            {/* Donation List */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Donation History</Card.Title>
                <Card.Description>
                  {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''} found
                </Card.Description>
              </Card.Header>
              <Card.Content>
                {loading ? (
                  <div className="text-center py-12">
                    <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading donations...</p>
                  </div>
                ) : filteredDonations.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDonations.map((donation) => (
                      <div
                        key={donation.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => navigate(`/campaign-details/${donation.campaignId}`)}
                      >
                        {/* Campaign Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {donation.coverImage ? (
                            <Image
                              src={donation.coverImage}
                              alt={donation.campaignTitle}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="GraduationCap" size={32} className="text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Donation Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate mb-1">
                            {donation.campaignTitle}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Icon name="User" size={14} />
                              {donation.studentName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {formatDate(donation.date)}
                            </span>
                          </div>
                          {donation.message && (
                            <p className="text-xs text-gray-500 italic mt-1 truncate">
                              "{donation.message}"
                            </p>
                          )}
                        </div>

                        {/* Amount and Actions */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xl font-bold text-green-600 mb-2">
                            {formatCurrency(donation.amount)}
                          </p>
                          <div className="flex items-center gap-2">
                            <Badge variant={donation.status === 'completed' ? 'success' : 'default'} size="sm">
                              {donation.status}
                            </Badge>
                            {donation.receiptNumber && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    const response = await fetch(`${API_BASE_URL}/export/receipt/${donation.id}`);
                                    if (response.ok) {
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.href = url;
                                      a.download = `receipt-${donation.receiptNumber}.pdf`;
                                      document.body.appendChild(a);
                                      a.click();
                                      a.remove();
                                      window.URL.revokeObjectURL(url);
                                      toast.success('Receipt downloaded successfully');
                                    } else {
                                      toast.error('Failed to generate receipt. Please try again.');
                                    }
                                  } catch (err) {
                                    console.error('Receipt download error:', err);
                                    toast.error('Error downloading receipt. Please try again.');
                                  }
                                }}
                                iconName="Download"
                              >
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Icon name="Receipt" size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {searchTerm ? 'No donations found' : 'No donations yet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm
                        ? 'Try adjusting your search'
                        : 'Start supporting students by making your first donation'}
                    </p>
                    <Button onClick={() => navigate('/discover')}>
                      Discover Campaigns
                    </Button>
                  </div>
                )}
              </Card.Content>
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
                  <Avatar size="2xl" fallback="DO" />
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notification Preferences</label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Email me about campaign updates</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-700">Email me about new campaigns</span>
                      </label>
                    </div>
                  </div>
                </div>
              </Card.Content>
              <Card.Footer>
                <Button variant="default">Save Changes</Button>
              </Card.Footer>
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
              Donor
              <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Dashboard
              </span>
            </h1>
            <p className="text-xl text-gray-600">Track your impact and manage your donations</p>
          </div>

          {/* Tabs Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6 p-2 flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
              { id: 'history', label: 'History', icon: 'Receipt' },
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

export default DonorDashboard;
