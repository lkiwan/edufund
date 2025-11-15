import React, { useState, useEffect } from 'react';
import Navigation from '../components/layout/Navigation';
import Card from '../components/ui/Card';
import Icon from '../components/AppIcon';

const About = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [stats, setStats] = useState([
    { icon: 'Users', label: 'Étudiants Soutenus', value: '...' },
    { icon: 'Banknote', label: 'Fonds Collectés', value: '...' },
    { icon: 'Heart', label: 'Contributeurs', value: '...' },
    { icon: 'Award', label: 'Taux de Réussite', value: '...' },
  ]);

  useEffect(() => {
    // Fetch real stats from database (ultra-professional)
    fetchRealStats();
  }, []);

  const fetchRealStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/homepage`);
      const data = await response.json();

      if (data.success) {
        // Calculate success rate (campaigns that reached 80%+ of goal)
        const campaignsResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/api/campaigns`);
        const campaignsData = await campaignsResponse.json();

        let successRate = 95; // Default
        if (campaignsData.success && campaignsData.campaigns.length > 0) {
          const successfulCampaigns = campaignsData.campaigns.filter(c =>
            (c.currentAmount / c.goalAmount) >= 0.8
          );
          successRate = Math.round((successfulCampaigns.length / campaignsData.campaigns.length) * 100);
        }

        setStats([
          {
            icon: 'Users',
            label: 'Étudiants Soutenus',
            value: `${data.stats.totalStudents}+`
          },
          {
            icon: 'Banknote',
            label: 'Fonds Collectés',
            value: `${Math.round(data.stats.totalRaised / 1000)}K MAD`
          },
          {
            icon: 'Heart',
            label: 'Contributeurs',
            value: `${data.stats.totalDonors}+`
          },
          {
            icon: 'Award',
            label: 'Taux de Réussite',
            value: `${successRate}%`
          },
        ]);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Keep default values if fetch fails
    }
  };

  const values = [
    {
      icon: 'Target',
      title: 'Notre Mission',
      description: 'Rendre l\'éducation accessible à tous les étudiants talentueux, indépendamment de leur situation financière.'
    },
    {
      icon: 'Eye',
      title: 'Notre Vision',
      description: 'Un Maroc où chaque étudiant peut réaliser son potentiel grâce à un accès équitable à l\'éducation.'
    },
    {
      icon: 'Zap',
      title: 'Nos Valeurs',
      description: 'Transparence, solidarité, impact social et excellence dans tout ce que nous faisons.'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section - Magnificent Style */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50" />

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-100/50 to-transparent rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              About
              <span className="block mt-2 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                EduFund
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium">
              We're a crowdfunding platform dedicated to education in Morocco,
              connecting students with generous supporters.
            </p>
          </div>

          {/* Stats - Big & Bold */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:scale-105 transition-transform duration-300">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon name={stat.icon} size={32} color="white" />
                  </div>
                  <p className="text-3xl md:text-4xl font-extrabold mb-2">{stat.value}</p>
                  <p className="text-sm text-white/90 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} variant="elevated" className="p-8 group hover:scale-105 transition-all duration-300 border-2 border-transparent hover:border-primary/20">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br ${
                    index === 0 ? 'from-blue-500 to-cyan-500' :
                    index === 1 ? 'from-purple-500 to-pink-500' :
                    'from-emerald-500 to-teal-500'
                  } rounded-3xl flex items-center justify-center mx-auto transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-300 shadow-xl`}>
                    <Icon name={value.icon} size={40} color="white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed text-center">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card variant="elevated" className="p-8 md:p-12 border-2 border-green-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-6 py-3 rounded-full font-semibold mb-4">
                <Icon name="BookOpen" size={20} />
                <span>Our Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                Building the Future of Education
              </h2>
            </div>

            <div className="space-y-6 text-lg text-gray-700 leading-relaxed">
              <p>
                EduFund was founded in 2024 with a simple but powerful vision: to enable every
                Moroccan student to pursue their educational dreams, regardless of their financial situation.
              </p>
              <p>
                We noticed that many brilliant students were dropping out of school due to
                lack of financial resources. Our platform creates a bridge between these students and contributors
                who believe in their potential.
              </p>
              <p className="font-semibold text-primary">
                Today, we're proud to have helped over 500 students achieve their ambitions,
                with a 95% success rate in completing their studies.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Final CTA - Compelling */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 font-medium max-w-3xl mx-auto">
            Together, we can transform lives through education.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/discover'}
              className="bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 shadow-2xl hover:scale-105 transition-all"
            >
              Discover Campaigns
            </button>
            <button
              onClick={() => window.location.href = '/create-campaign'}
              className="bg-transparent border-2 border-white text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-white/10 backdrop-blur-sm transition-all"
            >
              Create a Campaign
            </button>
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
    </div>
  );
};

export default About;
