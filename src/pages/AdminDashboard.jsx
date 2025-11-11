import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/AppIcon';
import Badge from '../components/ui/Badge';
import toast from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingCampaigns, setPendingCampaigns] = useState([]);
  const [pendingProfiles, setPendingProfiles] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  useEffect(() => {
    // Check authentication and authorization
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');

    if (!authToken || (userRole !== 'admin' && userRole !== 'super-admin')) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }

    fetchAdminData();
  }, [navigate]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);

      // Fetch admin statistics
      const statsRes = await fetch(`${API_BASE_URL}/admin/stats`);
      const statsData = await statsRes.json();

      // Fetch pending campaigns
      const campaignsRes = await fetch(`${API_BASE_URL}/admin/campaigns/pending`);
      const campaignsData = await campaignsRes.json();

      // Fetch pending profile verifications
      const profilesRes = await fetch(`${API_BASE_URL}/admin/profiles/pending`);
      const profilesData = await profilesRes.json();

      // Fetch all campaigns for management
      const allCampaignsRes = await fetch(`${API_BASE_URL}/admin/campaigns/all`);
      const allCampaignsData = await allCampaignsRes.json();

      if (statsData.success) setStats(statsData.stats);
      if (campaignsData.success) setPendingCampaigns(campaignsData.campaigns);
      if (profilesData.success) setPendingProfiles(profilesData.profiles);
      if (allCampaignsData.success) setAllCampaigns(allCampaignsData.campaigns);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCampaignAction = async (campaignId, action) => {
    try {
      // Get admin info from localStorage
      const adminId = localStorage.getItem('user-id');
      const adminEmail = localStorage.getItem('user-email');

      if (!adminId || !adminEmail) {
        toast.error('Admin authentication required');
        navigate('/login');
        return;
      }

      // Ask for reason if rejecting
      let reason = '';
      let notes = '';

      if (action === 'reject') {
        reason = prompt('Please enter rejection reason (required):');
        if (!reason || reason.trim() === '') {
          toast.error('Rejection reason is required');
          return;
        }
      } else {
        notes = prompt('Add approval notes (optional):') || 'Campaign approved';
      }

      const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminId: parseInt(adminId),
          adminEmail: adminEmail,
          ...(action === 'reject' ? { reason } : { notes })
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Campaign ${action === 'approve' ? 'approved' : 'rejected'} successfully!`);
        fetchAdminData();
      } else {
        toast.error(data.error || 'Failed to update campaign');
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      toast.error('Error updating campaign');
    }
  };

  const handleProfileValidation = async (userId, action) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profiles/${userId}/${action}`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success(`Profile ${action === 'approve' ? 'validated' : 'rejected'} successfully!`);
        setReviewModalOpen(false);
        setSelectedProfile(null);
        fetchAdminData();
      } else {
        toast.error('Failed to validate profile');
      }
    } catch (err) {
      console.error('Error validating profile:', err);
      toast.error('Error validating profile');
    }
  };

  const openReviewModal = (profile) => {
    setSelectedProfile(profile);
    setReviewModalOpen(true);
  };

  const handleCampaignStatusChange = async (campaignId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/campaigns/${campaignId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Campaign status changed to ${newStatus}`);
        fetchAdminData();
      } else {
        toast.error('Failed to update campaign status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Error updating campaign status');
    }
  };

  const generateMonthlyReport = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/monthly`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `monthly-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('Monthly report generated successfully');
      } else {
        toast.error('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      toast.error('Error generating report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  const adminStats = stats || {
    totalUsers: 0,
    totalCampaigns: 0,
    totalDonations: 0,
    pendingValidations: 0,
    activeCampaigns: 0,
    totalRevenue: 0,
  };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: 'LayoutDashboard' },
    { id: 'campaigns', label: 'Campagnes', icon: 'Flag' },
    { id: 'profiles', label: 'Profils étudiants', icon: 'UserCheck' },
    { id: 'reports', label: 'Rapports', icon: 'FileText' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                  Administration EduFund
                </h1>
                <p className="text-gray-600 mt-2">
                  Gestion des campagnes, validations et rapports
                </p>
              </div>
              <Button onClick={generateMonthlyReport} iconName="Download">
                Rapport mensuel
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mt-6 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary font-medium'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon name={tab.icon} size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card variant="elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Utilisateurs</p>
                      <p className="text-3xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Icon name="Users" size={24} className="text-blue-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Campagnes Actives</p>
                      <p className="text-3xl font-bold text-gray-900">{adminStats.activeCampaigns}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Icon name="TrendingUp" size={24} className="text-green-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">En attente</p>
                      <p className="text-3xl font-bold text-gray-900">{adminStats.pendingValidations}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Icon name="Clock" size={24} className="text-orange-600" />
                    </div>
                  </div>
                </Card>

                <Card variant="elevated">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Fonds collectés</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {adminStats.totalRevenue?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Icon name="Banknote" size={24} className="text-purple-600" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="elevated">
                  <Card.Header>
                    <Card.Title>Campagnes en attente ({pendingCampaigns.length})</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    {pendingCampaigns.length > 0 ? (
                      <div className="space-y-3">
                        {pendingCampaigns.slice(0, 5).map((campaign) => (
                          <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                              <p className="text-sm text-gray-600">{campaign.student_name}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleCampaignAction(campaign.id, 'approve')}
                              >
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCampaignAction(campaign.id, 'reject')}
                              >
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Aucune campagne en attente</p>
                    )}
                  </Card.Content>
                </Card>

                <Card variant="elevated">
                  <Card.Header>
                    <Card.Title>Profils à valider ({pendingProfiles.length})</Card.Title>
                  </Card.Header>
                  <Card.Content>
                    {pendingProfiles.length > 0 ? (
                      <div className="space-y-3">
                        {pendingProfiles.slice(0, 5).map((profile) => (
                          <div key={profile.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{profile.full_name || profile.email}</h4>
                              <p className="text-sm text-gray-600">{profile.university || 'Non spécifié'}</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openReviewModal(profile)}
                                iconName="Eye"
                              >
                                Revoir
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleProfileValidation(profile.id, 'approve')}
                              >
                                Valider
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleProfileValidation(profile.id, 'reject')}
                              >
                                Rejeter
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Aucun profil en attente</p>
                    )}
                  </Card.Content>
                </Card>
              </div>
            </>
          )}

          {/* Campaigns Tab */}
          {activeTab === 'campaigns' && (
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Gestion des campagnes</Card.Title>
                <Card.Description>Gérer le statut et la visibilité des campagnes</Card.Description>
              </Card.Header>
              <Card.Content>
                {allCampaigns.length > 0 ? (
                  <div className="space-y-3">
                    {allCampaigns.map((campaign) => (
                      <div key={campaign.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-gray-900">{campaign.title}</h4>
                            <Badge variant={
                              campaign.status === 'published' ? 'success' :
                              campaign.status === 'draft' ? 'default' :
                              campaign.status === 'completed' ? 'default' :
                              'default'
                            }>
                              {campaign.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{campaign.student_name} • {campaign.category}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {campaign.current_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })} / {campaign.goal_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={campaign.status}
                            onChange={(e) => handleCampaignStatusChange(campaign.id, e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          >
                            <option value="draft">Brouillon</option>
                            <option value="published">Publié</option>
                            <option value="completed">Terminé</option>
                            <option value="suspended">Suspendu</option>
                          </select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                            iconName="Eye"
                          >
                            Voir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">Aucune campagne disponible</p>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Profiles Tab */}
          {activeTab === 'profiles' && (
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Validation des profils étudiants</Card.Title>
                <Card.Description>Vérifier et approuver les profils étudiants</Card.Description>
              </Card.Header>
              <Card.Content>
                {pendingProfiles.length > 0 ? (
                  <div className="space-y-4">
                    {pendingProfiles.map((profile) => (
                      <div key={profile.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {profile.full_name || 'Nom non fourni'}
                            </h4>
                            <p className="text-sm text-gray-600">{profile.email}</p>
                          </div>
                          <Badge variant="default">En attente</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <span className="text-gray-600">Université:</span>
                            <p className="font-medium">{profile.university || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Niveau:</span>
                            <p className="font-medium">{profile.year_level || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Domaine:</span>
                            <p className="font-medium">{profile.field_of_study || 'Non spécifié'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date d'inscription:</span>
                            <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => openReviewModal(profile)}
                            iconName="Eye"
                          >
                            Revoir le profil complet
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleProfileValidation(profile.id, 'approve')}
                            iconName="Check"
                          >
                            Valider le profil
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => handleProfileValidation(profile.id, 'reject')}
                            iconName="X"
                          >
                            Rejeter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Icon name="UserCheck" size={64} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun profil en attente</h3>
                    <p className="text-gray-600">Tous les profils ont été validés</p>
                  </div>
                )}
              </Card.Content>
            </Card>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="elevated">
                <Card.Header>
                  <Card.Title>Rapports disponibles</Card.Title>
                  <Card.Description>Télécharger les rapports mensuels et statistiques</Card.Description>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-3">
                    <button
                      onClick={generateMonthlyReport}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon name="FileText" size={20} className="text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">Rapport mensuel</h4>
                          <p className="text-sm text-gray-600">Montants collectés, taux de réussite</p>
                        </div>
                      </div>
                      <Icon name="Download" size={20} className="text-gray-400" />
                    </button>

                    <button
                      onClick={() => navigate('/global-dashboard')}
                      className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon name="BarChart3" size={20} className="text-green-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-semibold text-gray-900">Tableau de bord analytique</h4>
                          <p className="text-sm text-gray-600">Visualisations et statistiques</p>
                        </div>
                      </div>
                      <Icon name="ExternalLink" size={20} className="text-gray-400" />
                    </button>
                  </div>
                </Card.Content>
              </Card>

              <Card variant="elevated">
                <Card.Header>
                  <Card.Title>Statistiques du mois</Card.Title>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nouvelles campagnes</span>
                      <span className="text-2xl font-bold text-gray-900">{adminStats.newCampaignsThisMonth || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Nouveaux utilisateurs</span>
                      <span className="text-2xl font-bold text-gray-900">{adminStats.newUsersThisMonth || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total donations</span>
                      <span className="text-2xl font-bold text-gray-900">{adminStats.totalDonationsThisMonth || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Montant collecté</span>
                      <span className="text-2xl font-bold text-primary">
                        {(adminStats.revenueThisMonth || 0).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                      </span>
                    </div>
                  </div>
                </Card.Content>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Profile Review Modal */}
      {reviewModalOpen && selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Révision du profil étudiant</h2>
                <p className="text-sm text-gray-600 mt-1">Examiner tous les détails avant validation</p>
              </div>
              <button
                onClick={() => setReviewModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Icon name="X" size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Profile Status Badge */}
              <div className="mb-6">
                <Badge variant="default" className="text-sm">
                  <Icon name="Clock" size={16} className="mr-1" />
                  En attente de validation
                </Badge>
              </div>

              {/* Personal Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="User" size={20} className="text-primary" />
                  Informations personnelles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nom complet</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.full_name || 'Non fourni'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Téléphone</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.phone_number || 'Non fourni'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ville</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.city || 'Non fourni'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date de naissance</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.date_of_birth ? new Date(selectedProfile.date_of_birth).toLocaleDateString('fr-FR') : 'Non fourni'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Genre</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.gender === 'male' ? 'Masculin' : selectedProfile.gender === 'female' ? 'Féminin' : 'Non spécifié'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Academic Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="GraduationCap" size={20} className="text-primary" />
                  Informations académiques
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">Université</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.university || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Domaine d'études</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.field_of_study || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Niveau d'études</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.year_level || 'Non spécifié'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Numéro étudiant</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.student_id || 'Non fourni'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">GPA / Moyenne</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.gpa || 'Non fourni'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Biography Section */}
              {selectedProfile.bio && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Icon name="FileText" size={20} className="text-primary" />
                    Biographie
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedProfile.bio}</p>
                  </div>
                </div>
              )}

              {/* Account Information Section */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="Info" size={20} className="text-primary" />
                  Informations du compte
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date d'inscription</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {new Date(selectedProfile.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type de compte</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.role === 'student' ? 'Étudiant' : selectedProfile.role}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Statut de vérification</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      {selectedProfile.is_verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Icon name="CheckCircle" size={16} />
                          Vérifié
                        </span>
                      ) : (
                        <span className="text-orange-600 flex items-center gap-1">
                          <Icon name="Clock" size={16} />
                          En attente
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Profil ID</label>
                    <p className="text-base font-semibold text-gray-900 mt-1">
                      #{selectedProfile.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Completeness Indicator */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Icon name="BarChart3" size={20} className="text-primary" />
                  Complétude du profil
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {(() => {
                    const fields = [
                      selectedProfile.full_name,
                      selectedProfile.email,
                      selectedProfile.phone_number,
                      selectedProfile.city,
                      selectedProfile.date_of_birth,
                      selectedProfile.university,
                      selectedProfile.field_of_study,
                      selectedProfile.year_level,
                      selectedProfile.student_id,
                      selectedProfile.bio
                    ];
                    const completedFields = fields.filter(field => field && field !== '').length;
                    const percentage = Math.round((completedFields / fields.length) * 100);

                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-600">
                            {completedFields} sur {fields.length} champs complétés
                          </span>
                          <span className="text-sm font-bold text-primary">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-primary rounded-full h-3 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setReviewModalOpen(false)}
              >
                Fermer
              </Button>
              <Button
                variant="outline"
                onClick={() => handleProfileValidation(selectedProfile.id, 'reject')}
                iconName="X"
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Rejeter le profil
              </Button>
              <Button
                variant="default"
                onClick={() => handleProfileValidation(selectedProfile.id, 'approve')}
                iconName="Check"
              >
                Valider le profil
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
