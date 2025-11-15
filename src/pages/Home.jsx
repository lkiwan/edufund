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
import FavoriteButton from '../components/FavoriteButton';
import api from '../services/api';
import { formatCurrency as formatMAD } from '../utils/currency';

const Home = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    totalRaised: 0,
    totalStudents: 0,
    totalDonors: 0
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      // Fetch all campaigns
      const allCampaignsData = await api.campaigns.list({ limit: 6 });
      if (allCampaignsData.success) {
        setCampaigns(allCampaignsData.campaigns || []);
      }

      // Fetch featured campaigns
      const featuredData = await api.campaigns.list({ featured: 'true', limit: 3 });
      if (featuredData.success) {
        setFeaturedCampaigns(featuredData.campaigns || []);
      }

      // Fetch homepage stats from backend
      try {
        const statsRes = await api.stats.homepage();
        if (statsRes?.success && statsRes?.stats) {
          setStats({
            totalCampaigns: statsRes.stats.totalCampaigns || 0,
            totalRaised: statsRes.stats.totalRaised || 0,
            totalStudents: statsRes.stats.totalStudents || 0,
            totalDonors: statsRes.stats.totalDonors || 0,
          });
        }
      } catch (err) {
        // Fallback: compute stats from campaigns if backend stats endpoint fails
        const totalCampaignsData = await api.campaigns.list({});
        if (totalCampaignsData.success) {
          const allCampaigns = totalCampaignsData.campaigns || [];
          const totalRaised = allCampaigns.reduce((sum, c) => sum + (c.currentAmount || 0), 0);
          setStats({
            totalCampaigns: allCampaigns.length,
            totalRaised: totalRaised,
            totalStudents: allCampaigns.length,
            totalDonors: 500
          });
        }
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            {/* Hero Title */}
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold text-gray-900 mb-6">
              Help Students
              <span className="block text-primary mt-2">Achieve Their Dreams</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
              Support education. Change lives. Every contribution helps a student pursue their academic goals and build a better future.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                variant="default"
                size="xl"
                onClick={() => navigate('/login')}
                className="rounded-full px-8 shadow-lg hover:shadow-xl"
                iconName="Plus"
                iconPosition="left"
              >
                Start a Campaign
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={() => {
                  document.getElementById('campaigns-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="rounded-full px-8"
                iconName="Search"
                iconPosition="left"
              >
                Discover Campaigns
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { label: 'Active Campaigns', value: stats.totalCampaigns, icon: 'TrendingUp' },
                { label: 'Raised for Students', value: formatMAD(stats.totalRaised), icon: 'DollarSign' },
                { label: 'Students Supported', value: `${stats.totalStudents}+`, icon: 'Users' },
                { label: 'Generous Donors', value: `${stats.totalDonors}+`, icon: 'Heart' }
              ].map((stat, index) => (
                <Card key={index} variant="elevated" className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon name={stat.icon} size={24} className="text-primary" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      {featuredCampaigns.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="success" size="lg" className="mb-4">
                <Icon name="Star" size={16} className="mr-1" />
                Featured Campaigns
              </Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
                Campaigns Making an Impact
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Verified campaigns from students who are making real progress toward their goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-3">
              How EduFund Works
            </h2>
            <p className="text-lg text-gray-600">
              Simple, transparent, and effective
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'UserPlus',
                title: 'Create Campaign',
                description: 'Students share their story and educational goals with our community',
                step: '1'
              },
              {
                icon: 'Heart',
                title: 'Get Support',
                description: 'Donors contribute to help students achieve their educational dreams',
                step: '2'
              },
              {
                icon: 'GraduationCap',
                title: 'Achieve Goals',
                description: 'Students use funds for tuition, books, and living expenses to succeed',
                step: '3'
              }
            ].map((step, index) => (
              <Card key={index} variant="elevated" className="text-center group hover:scale-105 transition-transform">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <Icon name={step.icon} size={32} className="text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/how-it-works')}
              iconName="ArrowRight"
              iconPosition="right"
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* All Campaigns Section */}
      <section id="campaigns-section" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                Support a Student Today
              </h2>
              <p className="text-gray-600">
                {campaigns.length} students need your support
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/discover')}
              iconName="ArrowRight"
              iconPosition="right"
            >
              View All Campaigns
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of supporters helping students achieve their dreams
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/discover')}
              className="bg-white text-primary hover:bg-gray-100 rounded-full"
              iconName="Search"
              iconPosition="left"
            >
              Find a Campaign
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/login')}
              className="border-white text-white hover:bg-white/10 rounded-full"
              iconName="Plus"
              iconPosition="left"
            >
              Start Your Campaign
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign, featured = false }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user-id');

  const percentage = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);

  return (
    <Card
      variant="default"
      padding="none"
      className="overflow-hidden cursor-pointer group hover:shadow-xl transition-all"
      onClick={() => navigate(`/campaign-details/${campaign.id}`)}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Favorite Button Badge */}
        <FavoriteButton
          campaignId={campaign.id}
          userId={userId}
          variant="badge"
          size="md"
        />
        {featured && (
          <Badge variant="success" className="absolute top-3 left-3 shadow-lg">
            <Icon name="Star" size={14} className="mr-1" />
            Featured
          </Badge>
        )}
        {campaign.verificationStatus === 'verified' && (
          <Badge variant="default" className="absolute bottom-3 left-3 bg-white/95 text-primary shadow-lg">
            <Icon name="CheckCircle" size={14} className="mr-1" />
            Verified
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category & Location */}
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          {campaign.category && (
            <span className="flex items-center gap-1">
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
        <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {campaign.title}
        </h3>

        {/* Student Info */}
        {campaign.studentName && (
          <p className="text-sm text-gray-600 mb-4">
            by {campaign.studentName}
          </p>
        )}

        {/* Progress Bar */}
        <Progress value={campaign.currentAmount} max={campaign.goalAmount} size="md" className="mb-3" />

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">
              {formatMAD(campaign.currentAmount)}
            </div>
            <div className="text-sm text-gray-600">
              raised of {formatMAD(campaign.goalAmount)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
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

export default Home;
