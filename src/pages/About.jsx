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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              À Propos d'EduFund
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Nous sommes une plateforme de financement participatif dédiée à l'éducation au Maroc,
              connectant les étudiants avec des contributeurs généreux.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <Card key={index} variant="elevated" className="text-center p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name={stat.icon} size={24} className="text-primary" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </Card>
            ))}
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {values.map((value, index) => (
              <Card key={index} variant="elevated" className="p-8">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mb-4">
                  <Icon name={value.icon} size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </Card>
            ))}
          </div>

          {/* Story */}
          <Card variant="elevated" className="p-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Histoire</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                EduFund a été fondée en 2024 avec une vision simple mais puissante : permettre à chaque
                étudiant marocain de poursuivre ses rêves éducatifs, quelle que soit sa situation financière.
              </p>
              <p>
                Nous avons constaté que de nombreux étudiants brillants abandonnaient leurs études faute
                de moyens financiers. Notre plateforme crée un pont entre ces étudiants et des contributeurs
                qui croient en leur potentiel.
              </p>
              <p>
                Aujourd'hui, nous sommes fiers d'avoir aidé plus de 500 étudiants à réaliser leurs ambitions,
                avec un taux de réussite de 95% dans la complétion de leurs études.
              </p>
            </div>
          </Card>

          {/* Contact CTA */}
          <div className="text-center bg-gradient-to-r from-primary to-emerald-600 rounded-lg p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Rejoignez Notre Mission</h2>
            <p className="text-lg mb-6 opacity-90">
              Ensemble, nous pouvons transformer des vies à travers l'éducation.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/discover'}
                className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Découvrir les Campagnes
              </button>
              <button
                onClick={() => window.location.href = '/create-campaign'}
                className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Créer une Campagne
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
