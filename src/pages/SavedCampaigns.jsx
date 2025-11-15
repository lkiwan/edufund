import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/AppIcon';
import Image from '../components/AppImage';
import Progress from '../components/ui/Progress';
import FavoriteButton from '../components/FavoriteButton';
import toast from '../utils/toast';
import { formatCurrency } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const SavedCampaigns = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [savedCampaigns, setSavedCampaigns] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, completed
  const [sortBy, setSortBy] = useState('recent'); // recent, amount, progress

  useEffect(() => {
    const authToken = localStorage.getItem('auth-token');
    if (!authToken) {
      toast.error('Please login to view saved campaigns');
      navigate('/login');
      return;
    }
    fetchSavedCampaigns();
  }, [navigate]);

  const fetchSavedCampaigns = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/favorites/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSavedCampaigns(data.favorites || []);
      }
    } catch (err) {
      console.error('Error fetching saved campaigns:', err);
      toast.error('Failed to load saved campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = (campaignId) => {
    setSavedCampaigns(savedCampaigns.filter(c => c.id !== campaignId));
    toast.success('Removed from saved campaigns');
  };

  const getFilteredAndSortedCampaigns = () => {
    let filtered = [...savedCampaigns];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(c => c.status === 'active');
    } else if (filterStatus === 'completed') {
      filtered = filtered.filter(c => c.current_amount >= c.goal_amount);
    }

    // Sort
    if (sortBy === 'amount') {
      filtered.sort((a, b) => b.current_amount - a.current_amount);
    } else if (sortBy === 'progress') {
      filtered.sort((a, b) => {
        const progressA = (a.current_amount / a.goal_amount) * 100;
        const progressB = (b.current_amount / b.goal_amount) * 100;
        return progressB - progressA;
      });
    } else {
      // Sort by recent (created_at)
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return filtered;
  };

  const filteredCampaigns = getFilteredAndSortedCampaigns();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900">Loading Saved Campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 bg-pink-100 px-6 py-3 rounded-full mb-4">
              <Icon name="Heart" size={20} className="text-pink-600" />
              <span className="font-semibold text-pink-700">Your Favorites</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              Saved
              <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Campaigns
              </span>
            </h1>
            <p className="text-xl text-gray-600">Keep track of campaigns you care about</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card variant="elevated" className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="Bookmark" size={28} color="white" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">{savedCampaigns.length}</div>
                  <div className="text-sm text-gray-600 font-medium">Total Saved</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="TrendingUp" size={28} color="white" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {savedCampaigns.filter(c => c.status === 'active').length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Active Campaigns</div>
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon name="CheckCircle" size={28} color="white" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {savedCampaigns.filter(c => c.current_amount >= c.goal_amount).length}
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Fully Funded</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters & Sort */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Filter by Status */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <Icon name="Filter" size={16} className="mr-2" />
                    Filter:
                  </span>
                  {['all', 'active', 'completed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                        filterStatus === status
                          ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Sort */}
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <Icon name="ArrowUpDown" size={16} className="mr-2" />
                    Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-semibold text-sm"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="amount">Highest Amount</option>
                    <option value="progress">Most Progress</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Campaigns Grid */}
          {filteredCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCampaigns.map((campaign) => {
                const percentage = Math.min((campaign.current_amount / campaign.goal_amount) * 100, 100);
                const isFullyFunded = percentage >= 100;

                return (
                  <Card
                    key={campaign.id}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={campaign.cover_image}
                        alt={campaign.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      />

                      {/* Favorite Button Overlay */}
                      <div className="absolute top-3 right-3">
                        <FavoriteButton
                          campaignId={campaign.id}
                          userId={localStorage.getItem('user-id')}
                          variant="floating"
                          onRemove={() => handleRemoveFavorite(campaign.id)}
                        />
                      </div>

                      {/* Status Badge */}
                      {isFullyFunded && (
                        <Badge variant="success" className="absolute top-3 left-3 shadow-lg">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Funded
                        </Badge>
                      )}

                      {campaign.verification_status === 'verified' && !isFullyFunded && (
                        <Badge variant="success" className="absolute top-3 left-3 shadow-lg">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Location */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        {campaign.category && (
                          <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                            <Icon name="Tag" size={12} />
                            {campaign.category}
                          </span>
                        )}
                        {campaign.city && (
                          <span className="flex items-center gap-1">
                            <Icon name="MapPin" size={12} />
                            {campaign.city}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3
                        className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      >
                        {campaign.title}
                      </h3>

                      {/* Student Name */}
                      {campaign.student_name && (
                        <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                          <Icon name="User" size={14} />
                          by {campaign.student_name}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <Progress
                        value={campaign.current_amount}
                        max={campaign.goal_amount}
                        size="lg"
                        className="mb-4"
                      />

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(campaign.current_amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            of {formatCurrency(campaign.goal_amount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {Math.round(percentage)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            funded
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          variant="default"
                          size="md"
                          fullWidth
                          onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                          iconName="Eye"
                          className="rounded-xl bg-gradient-to-r from-primary to-teal-600"
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => {
                            navigate(`/campaign-details/${campaign.id}`);
                            // Trigger donation modal (will be handled on page)
                          }}
                          iconName="Heart"
                          className="rounded-xl"
                        >
                          Donate
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card variant="elevated" className="border-2 border-gray-100">
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Icon name="Heart" size={48} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Saved Campaigns</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  {filterStatus !== 'all'
                    ? `No ${filterStatus} campaigns in your saved list`
                    : "You haven't saved any campaigns yet. Start exploring and save campaigns you care about!"}
                </p>
                <Button
                  onClick={() => navigate('/discover')}
                  size="lg"
                  iconName="Compass"
                  className="rounded-full bg-gradient-to-r from-primary to-teal-600 hover:shadow-2xl hover:scale-105 transition-all"
                >
                  Discover Campaigns
                </Button>
              </div>
            </Card>
          )}

          {/* CTA Banner */}
          {savedCampaigns.length > 0 && (
            <div className="mt-12">
              <Card variant="elevated" className="overflow-hidden border-2 border-gray-100">
                <div className="bg-gradient-to-r from-primary via-teal-500 to-cyan-500 p-8 md:p-12 text-white text-center">
                  <h3 className="text-3xl md:text-4xl font-extrabold mb-4">
                    Make a Difference Today
                  </h3>
                  <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                    Your support can change a student's life. Consider donating to one of your saved campaigns.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={() => navigate('/discover')}
                      size="lg"
                      className="bg-white text-primary hover:bg-gray-100 rounded-full shadow-2xl"
                      iconName="Compass"
                    >
                      Discover More Campaigns
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SavedCampaigns;
