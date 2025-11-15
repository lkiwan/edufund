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
import TrendingSection from '../components/TrendingSection';
import api from '../services/api';
import { formatCurrency as formatMAD } from '../utils/currency';

const Home = () => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [successStories, setSuccessStories] = useState([]);
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

      // Fetch success stories (100% funded campaigns)
      const successData = await api.campaigns.list({ limit: 3 });
      if (successData.success) {
        const funded = (successData.campaigns || []).filter(c =>
          c.currentAmount >= c.goalAmount
        ).slice(0, 3);
        setSuccessStories(funded);
      }

      // Fetch homepage stats
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

  const categories = [
    {
      name: 'Medical',
      icon: 'Heart',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
      description: 'Medical school & healthcare',
      color: 'from-red-500 to-pink-600'
    },
    {
      name: 'Engineering',
      icon: 'Cpu',
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop',
      description: 'Engineering & technology',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      name: 'Law',
      icon: 'Scale',
      image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=300&fit=crop',
      description: 'Law school & legal studies',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      name: 'Business',
      icon: 'TrendingUp',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
      description: 'Business & management',
      color: 'from-green-500 to-emerald-600'
    },
    {
      name: 'Science',
      icon: 'Atom',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop',
      description: 'Sciences & research',
      color: 'from-teal-500 to-cyan-600'
    },
    {
      name: 'Arts',
      icon: 'Palette',
      image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop',
      description: 'Arts & creative studies',
      color: 'from-orange-500 to-amber-600'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* HERO SECTION - Simplified & Powerful */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            {/* Main Headline - Simple & Powerful */}
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Educational Dreams
              <span className="block mt-2 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Start Here
              </span>
            </h1>

            {/* Subheadline - Concise */}
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-medium">
              Free fundraising for students. Trusted by thousands.
            </p>

            {/* Single Primary CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button
                variant="default"
                size="xl"
                onClick={() => navigate('/create-campaign')}
                className="rounded-full px-10 py-6 text-lg shadow-2xl shadow-primary/30 hover:shadow-3xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                iconName="Plus"
                iconPosition="left"
              >
                Start a Campaign
              </Button>

              <button
                onClick={() => navigate('/discover')}
                className="text-lg font-semibold text-gray-700 hover:text-primary transition-colors flex items-center gap-2 group"
              >
                Browse campaigns
                <Icon name="ArrowRight" size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Trust Indicators - Inline */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Icon name="CheckCircle" size={18} className="text-green-500" />
                <span>No platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Shield" size={18} className="text-blue-500" />
                <span>Secure & verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Zap" size={18} className="text-yellow-500" />
                <span>Fast setup</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Users" size={18} className="text-purple-500" />
                <span>{stats.totalDonors}+ donors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF - Big & Bold */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="text-center mb-8">
              <div className="text-5xl md:text-7xl font-extrabold mb-3">
                {formatMAD(stats.totalRaised)}
              </div>
              <div className="text-xl md:text-2xl opacity-95 font-medium">
                raised for students this year
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-3xl font-bold mb-2">{stats.totalCampaigns}</div>
                <div className="text-white/90">Active Campaigns</div>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-3xl font-bold mb-2">{stats.totalStudents}+</div>
                <div className="text-white/90">Students Supported</div>
              </div>
              <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                <div className="text-3xl font-bold mb-2">Every 2 min</div>
                <div className="text-white/90">New Donation</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY SELECTION - Visual & Engaging */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Start Fundraising For...
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose your field and create your campaign in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => navigate(`/create-campaign?category=${category.name}`)}
                className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity`} />
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 text-white">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon name={category.icon} size={32} color="white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.description}</p>

                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Get started</span>
                    <Icon name="ArrowRight" size={16} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES - Build Trust */}
      {successStories.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold mb-4">
                <Icon name="Trophy" size={20} />
                <span>Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Dreams Achieved
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join these students who reached their funding goals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {successStories.map((campaign) => (
                <SuccessStoryCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* TRENDING CAMPAIGNS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingSection />
        </div>
      </section>

      {/* HOW IT WORKS - More Visual */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              How EduFund Works
            </h2>
            <p className="text-xl text-gray-600">
              Three simple steps to fund your education
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 hidden lg:block"
                 style={{ top: '80px', left: '10%', right: '10%', width: '80%' }} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {[
                {
                  step: '1',
                  icon: 'Rocket',
                  title: 'Create Your Campaign',
                  description: 'Tell your story in minutes. Add photos, set your goal, and share your educational dreams.',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  step: '2',
                  icon: 'Share2',
                  title: 'Share With Network',
                  description: 'Spread the word to family, friends, and supporters through social media and email.',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  step: '3',
                  icon: 'GraduationCap',
                  title: 'Achieve Your Goals',
                  description: 'Receive funds directly and use them for tuition, books, and living expenses to succeed.',
                  color: 'from-emerald-500 to-teal-500'
                }
              ].map((step, index) => (
                <div key={index} className="relative">
                  <Card
                    variant="elevated"
                    className="text-center group hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-primary/20"
                    padding="lg"
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-br from-primary to-teal-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">{step.step}</span>
                    </div>

                    {/* Icon with gradient background */}
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 bg-gradient-to-br ${step.color} rounded-3xl flex items-center justify-center mx-auto transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-xl`}>
                        <Icon name={step.icon} size={40} color="white" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-4">
                      {step.description}
                    </p>

                    <button className="text-primary font-semibold text-sm flex items-center gap-2 mx-auto group-hover:gap-3 transition-all">
                      <span>Learn more</span>
                      <Icon name="ArrowRight" size={16} />
                    </button>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/how-it-works')}
              iconName="HelpCircle"
              iconPosition="left"
              className="rounded-full"
            >
              See Full Guide
            </Button>
          </div>
        </div>
      </section>

      {/* FEATURED CAMPAIGNS */}
      {featuredCampaigns.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="success" size="lg" className="mb-4 shadow-lg">
                <Icon name="Star" size={16} className="mr-1" />
                Featured This Week
              </Badge>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Campaigns Making Impact
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Verified campaigns from students making real progress
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} featured />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ALL CAMPAIGNS PREVIEW */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-2">
                Support a Student Today
              </h2>
              <p className="text-xl text-gray-600">
                {campaigns.length} students waiting for your support
              </p>
            </div>

            <Button
              variant="default"
              size="lg"
              onClick={() => navigate('/discover')}
              iconName="ArrowRight"
              iconPosition="right"
              className="rounded-full mt-6 md:mt-0"
            >
              View All Campaigns
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse" padding="none">
                  <div className="h-56 bg-gray-200 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FINAL CTA - Compelling */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Ready to Change Your Future?
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 font-medium max-w-3xl mx-auto">
            Join thousands of students who've raised millions for their education. Start your campaign in just 5 minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="xl"
              onClick={() => navigate('/create-campaign')}
              className="bg-white text-primary hover:bg-gray-100 rounded-full px-10 shadow-2xl hover:scale-105 transition-all"
              iconName="Plus"
              iconPosition="left"
            >
              Start Your Campaign
            </Button>
            <Button
              variant="outline"
              size="xl"
              onClick={() => navigate('/discover')}
              className="border-2 border-white text-white hover:bg-white/10 rounded-full px-10 backdrop-blur-sm"
              iconName="Search"
              iconPosition="left"
            >
              Support a Student
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-8 text-white/90">
            <div className="flex items-center gap-2">
              <Icon name="CheckCircle" size={20} />
              <span>100% secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Zap" size={20} />
              <span>5 min setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Heart" size={20} />
              <span>No hidden fees</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Success Story Card Component
const SuccessStoryCard = ({ campaign }) => {
  const navigate = useNavigate();
  const percentage = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);

  return (
    <Card
      variant="elevated"
      padding="none"
      className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 border-2 border-green-100"
      onClick={() => navigate(`/campaign-details/${campaign.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100">
        <Image
          src={campaign.coverImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Success badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="success" className="shadow-xl bg-green-500 text-white">
            <Icon name="CheckCircle" size={14} className="mr-1" />
            100% Funded
          </Badge>
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-pulse">
            <Icon name="Trophy" size={24} color="white" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
          {campaign.title}
        </h3>

        {campaign.studentName && (
          <p className="text-sm text-gray-600 mb-4 flex items-center gap-2">
            <Icon name="User" size={14} />
            {campaign.studentName}
          </p>
        )}

        {/* Success stats */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatMAD(campaign.currentAmount)}
          </div>
          <div className="text-sm text-green-700">
            Goal achieved! 🎉
          </div>
        </div>
      </div>
    </Card>
  );
};

// Campaign Card Component
const CampaignCard = ({ campaign, featured = false }) => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user-id');
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

        {/* Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            {featured && (
              <Badge variant="success" className="shadow-lg">
                <Icon name="Star" size={14} className="mr-1" />
                Featured
              </Badge>
            )}
            {campaign.verificationStatus === 'verified' && (
              <Badge variant="default" className="bg-white/95 text-primary shadow-lg">
                <Icon name="CheckCircle" size={14} className="mr-1" />
                Verified
              </Badge>
            )}
          </div>

          <FavoriteButton
            campaignId={campaign.id}
            userId={userId}
            variant="badge"
            size="md"
          />
        </div>
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

        {/* Student Info */}
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
              {formatMAD(campaign.currentAmount)}
            </div>
            <div className="text-sm text-gray-600">
              of {formatMAD(campaign.goalAmount)}
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

export default Home;
