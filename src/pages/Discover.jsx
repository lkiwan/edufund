import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import Icon from '../components/AppIcon';
import Image from '../components/AppImage';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import UniversityAutocomplete from '../components/ui/UniversityAutocomplete';

const Discover = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    university: '',
    status: '',
    sortBy: 'recent',
    minAmount: '',
    maxAmount: '',
    fundingPercentage: '', // NEW: 0-25, 25-50, 50-75, 75-100, 100+
    timeRemaining: '' // NEW: ending-soon, this-week, this-month
  });

  const categories = ['Medical', 'Engineering', 'Law', 'Business', 'Science', 'Education', 'Architecture', 'Arts'];
  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'goal', label: 'Highest Goal' },
    { value: 'raised', label: 'Most Raised' },
    { value: 'ending-soon', label: 'Ending Soon' },
    { value: 'most-funded', label: 'Most Funded %' },
    { value: 'most-donors', label: 'Most Donors' }
  ];

  const fundingPercentageOptions = [
    { value: '0-25', label: '0-25% Funded' },
    { value: '25-50', label: '25-50% Funded' },
    { value: '50-75', label: '50-75% Funded' },
    { value: '75-100', label: '75-100% Funded' },
    { value: '100+', label: '100%+ (Fully Funded)' }
  ];

  const timeRemainingOptions = [
    { value: 'ending-soon', label: 'Ending in 7 Days' },
    { value: 'this-week', label: 'Ending This Week' },
    { value: 'this-month', label: 'Ending This Month' }
  ];

  useEffect(() => {
    fetchCampaigns();
  }, [filters, page]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit: 9
      };

      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.university) params.university = filters.university;
      if (filters.status) params.status = filters.status;
      if (filters.sortBy) params.sort = filters.sortBy;
      if (filters.fundingPercentage) params.fundingPercentage = filters.fundingPercentage;
      if (filters.timeRemaining) params.timeRemaining = filters.timeRemaining;
      if (filters.minAmount) params.minAmount = filters.minAmount;
      if (filters.maxAmount) params.maxAmount = filters.maxAmount;

      const data = await api.campaigns.list(params);

      if (data.success) {
        if (page === 1) {
          setCampaigns(data.campaigns || []);
        } else {
          setCampaigns(prev => [...prev, ...(data.campaigns || [])]);
        }
        setHasMore(data.hasMore || false);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      location: '',
      university: '',
      status: '',
      sortBy: 'recent',
      minAmount: '',
      maxAmount: '',
      fundingPercentage: '',
      timeRemaining: ''
    });
    setPage(1);
  };

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  const hasActiveFilters = filters.search || filters.category || filters.location || filters.university || filters.status || filters.minAmount || filters.maxAmount || filters.fundingPercentage || filters.timeRemaining;

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section - Magnificent Style */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Discover
              <span className="block mt-2 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Campaigns
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto font-medium">
              Browse student campaigns and make a difference in someone's educational journey
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search campaigns by title, description, or student name..."
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent text-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowFilters(!showFilters)}
                  iconName="SlidersHorizontal"
                  iconPosition="left"
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                <Card variant="default" padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-heading font-bold text-lg">Filters</h3>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Category Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Category
                      </label>
                      <div className="space-y-2">
                        {categories.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleFilterChange('category', filters.category === cat ? '' : cat)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                              filters.category === cat
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Campaign Status
                      </label>
                      <div className="space-y-2">
                        {['active', 'verified'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleFilterChange('status', filters.status === status ? '' : status)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors capitalize ${
                              filters.status === status
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Funding Percentage Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Icon name="TrendingUp" size={14} className="inline mr-1" />
                        Funding Progress
                      </label>
                      <div className="space-y-2">
                        {fundingPercentageOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange('fundingPercentage', filters.fundingPercentage === option.value ? '' : option.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.fundingPercentage === option.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time Remaining Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        <Icon name="Clock" size={14} className="inline mr-1" />
                        Time Remaining
                      </label>
                      <div className="space-y-2">
                        {timeRemainingOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleFilterChange('timeRemaining', filters.timeRemaining === option.value ? '' : option.value)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              filters.timeRemaining === option.value
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Location Filter */}
                    <LocationAutocomplete
                      value={filters.location}
                      onChange={(value) => handleFilterChange('location', value)}
                      placeholder="start typing to find..."
                      label="Localité"
                      helperText="Recherchez par ville ou zone rurale"
                    />

                    {/* University Filter */}
                    <UniversityAutocomplete
                      value={filters.university}
                      onChange={(value) => handleFilterChange('university', value)}
                      placeholder="start typing to find..."
                      label="Université"
                      helperText="Recherchez par nom ou ville"
                    />

                    {/* Amount Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Goal Amount Range
                      </label>
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Minimum (MAD)</label>
                          <input
                            type="number"
                            value={filters.minAmount}
                            onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                            placeholder="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 mb-1 block">Maximum (MAD)</label>
                          <input
                            type="number"
                            value={filters.maxAmount}
                            onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                            placeholder="100000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                          />
                        </div>
                        {(filters.minAmount || filters.maxAmount) && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                            {filters.minAmount && filters.maxAmount
                              ? `${formatCurrency(Number(filters.minAmount), false)} - ${formatCurrency(Number(filters.maxAmount), false)} MAD`
                              : filters.minAmount
                              ? `Min: ${formatCurrency(Number(filters.minAmount))}`
                              : `Max: ${formatCurrency(Number(filters.maxAmount))}`
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Campaign Grid */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-2xl font-heading font-bold text-gray-900">
                  {campaigns.length} Campaigns Found
                </h2>
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {filters.search && (
                      <Badge variant="outline">
                        Search: {filters.search}
                        <button
                          onClick={() => handleFilterChange('search', '')}
                          className="ml-2"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="outline">
                        {filters.category}
                        <button
                          onClick={() => handleFilterChange('category', '')}
                          className="ml-2"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 md:mt-0">
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Loading State */}
            {loading && page === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} padding="none" className="animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : campaigns.length === 0 ? (
              /* Empty State */
              <div className="text-center py-16">
                <Icon name="Search" size={64} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters}>Clear All Filters</Button>
              </div>
            ) : (
              /* Campaign Grid */
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {campaigns.map((campaign) => (
                    <CampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div className="text-center mt-12">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={loadMore}
                      loading={loading}
                    >
                      Load More Campaigns
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Campaign Card Component (Matching Home Page Style)
const CampaignCard = ({ campaign }) => {
  const navigate = useNavigate();

  const percentage = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);

  return (
    <Card
      variant="elevated"
      padding="none"
      className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
      onClick={() => navigate(`/campaign-details/${campaign.id}`)}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {campaign.verificationStatus === 'verified' && (
          <Badge variant="default" className="absolute top-3 left-3 bg-white/95 text-primary shadow-lg">
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
            <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
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
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>

        {/* Student Name */}
        {campaign.studentName && (
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
            <Icon name="User" size={14} />
            by {campaign.studentName}
          </p>
        )}

        {/* Progress Bar */}
        <Progress value={campaign.currentAmount} max={campaign.goalAmount} size="lg" className="mb-4" />

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(campaign.currentAmount)}
            </div>
            <div className="text-sm text-gray-600">
              of {formatCurrency(campaign.goalAmount)}
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
      </div>
    </Card>
  );
};

export default Discover;
