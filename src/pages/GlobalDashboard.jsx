import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import Navigation from '../components/layout/Navigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Icon from '../components/AppIcon';
import Badge from '../components/ui/Badge';
import toast from '../utils/toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const GlobalDashboard = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [byField, setByField] = useState([]);
  const [byRegion, setByRegion] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // all, month, week
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const authToken = localStorage.getItem('auth-token');
    const role = localStorage.getItem('user-role');
    const id = localStorage.getItem('user-id');

    // Redirect if not authenticated
    if (!authToken) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }

    // Redirect if not admin
    if (role !== 'admin' && role !== 'super-admin') {
      toast.error('Access denied. Admin privileges required.');
      // Redirect to appropriate dashboard based on role
      if (role === 'student') {
        navigate('/student-dashboard');
      } else if (role === 'donor') {
        navigate('/donor-dashboard');
      } else {
        navigate('/');
      }
      return;
    }

    setUserRole(role);
    setUserId(id);
    setIsAdmin(true);
    fetchGlobalStats(role, id);
  }, [timeRange, navigate]);

  const fetchGlobalStats = async (role, id) => {
    try {
      setLoading(true);

      // Admin-only: Fetch global analytics for all campaigns
      const url = `${API_BASE_URL}/analytics/global?timeRange=${timeRange}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setByField(data.byField || []);
        setByRegion(data.byRegion || []);
        setRecentCampaigns(data.recentCampaigns || []);
      } else {
        toast.error('Failed to load analytics data');
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Error loading analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/analytics-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeRange }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('PDF report exported successfully');
      } else {
        toast.info('PDF generation coming soon!');
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      toast.error('PDF export error. Please try again later.');
    }
  };

  const exportToCSV = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/export/campaigns-csv`);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campaigns-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        toast.success('CSV exported successfully');
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
      toast.error('CSV export error. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Icon name="Shield" size={40} color="white" />
          </div>
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Loading Analytics Dashboard...</p>
          <p className="text-gray-600">Verifying admin access</p>
        </div>
      </div>
    );
  }

  const globalStats = stats || {
    totalCollected: 0,
    studentsSupported: 0,
    averageCompletion: 0,
    activeCampaigns: 0,
    totalDonors: 0,
    averageDonation: 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header - Modern & Professional */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                    Global Analytics
                    <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                      Dashboard
                    </span>
                  </h1>
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg px-4 py-2">
                    <Icon name="Shield" size={14} className="mr-1" />
                    Admin Only
                  </Badge>
                </div>
                <p className="text-xl text-gray-600">
                  Comprehensive overview of all campaigns and contributions
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/admin-dashboard')}
                  iconName="ArrowLeft"
                  className="rounded-full"
                >
                  Back to Admin
                </Button>
                <Button variant="outline" onClick={exportToCSV} iconName="Download" className="rounded-full">
                  CSV
                </Button>
                <Button onClick={exportToPDF} iconName="FileText" className="rounded-full bg-gradient-to-r from-primary to-teal-600 hover:shadow-lg">
                  PDF Report
                </Button>
              </div>
            </div>

            {/* Time Range Filter - Enhanced */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-2 inline-flex gap-2">
              {['all', 'month', 'week'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg scale-105'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range === 'all' ? '📊 All Time' : range === 'month' ? '📅 This Month' : '⚡ This Week'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics - Enhanced Professional Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Total Collected */}
            <Card variant="elevated" className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-green-200 bg-gradient-to-br from-white to-green-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon name="Banknote" size={28} color="white" />
                </div>
                <Badge variant="success" className="shadow-md">↗ +12%</Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Collected</p>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                {globalStats.totalCollected?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  ≈ ${(globalStats.totalCollected / 10).toLocaleString()} USD
                </span>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <Icon name="TrendingUp" size={12} />
                  Growing
                </span>
              </div>
            </Card>

            {/* Students Supported */}
            <Card variant="elevated" className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon name="Users" size={28} color="white" />
                </div>
                <Badge variant="default" className="shadow-md bg-blue-100 text-blue-700">Active</Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Students Supported</p>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{globalStats.studentsSupported}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {globalStats.activeCampaigns} active campaigns
                </span>
                <span className="text-blue-600 font-semibold flex items-center gap-1">
                  <Icon name="Zap" size={12} />
                  Live
                </span>
              </div>
            </Card>

            {/* Success Rate */}
            <Card variant="elevated" className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-purple-200 bg-gradient-to-br from-white to-purple-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon name="Target" size={28} color="white" />
                </div>
                <Badge variant="default" className="shadow-md bg-purple-100 text-purple-700">{globalStats.averageCompletion}%</Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Avg Success Rate</p>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{globalStats.averageCompletion}%</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Of funding goals reached
                </span>
                <span className="text-purple-600 font-semibold flex items-center gap-1">
                  <Icon name="Award" size={12} />
                  Excellent
                </span>
              </div>
            </Card>

            {/* Total Donors */}
            <Card variant="elevated" className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-orange-200 bg-gradient-to-br from-white to-orange-50">
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Icon name="Heart" size={28} color="white" />
                </div>
                <Badge variant="default" className="shadow-md bg-orange-100 text-orange-700">Growing</Badge>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-2">Total Donors</p>
              <p className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{globalStats.totalDonors}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  Avg: {globalStats.averageDonation?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                </span>
                <span className="text-orange-600 font-semibold flex items-center gap-1">
                  <Icon name="Sparkles" size={12} />
                  Impact
                </span>
              </div>
            </Card>
          </div>

          {/* Additional Insights Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <Card variant="elevated" className="bg-gradient-to-br from-teal-50 to-white border-l-4 border-teal-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Funding Velocity</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {(globalStats.totalCollected / Math.max(globalStats.studentsSupported, 1) / 30).toFixed(0)} MAD/day
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Average per campaign</p>
                </div>
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                  <Icon name="Activity" size={24} className="text-teal-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="bg-gradient-to-br from-indigo-50 to-white border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Donor Engagement</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {(globalStats.totalDonors / Math.max(globalStats.studentsSupported, 1)).toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Donors per campaign</p>
                </div>
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Icon name="UserCheck" size={24} className="text-indigo-600" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" className="bg-gradient-to-br from-amber-50 to-white border-l-4 border-amber-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Platform Impact</p>
                  <p className="text-2xl font-extrabold text-gray-900">
                    {((globalStats.totalCollected / (globalStats.studentsSupported * 50000)) * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Of avg tuition funded</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-amber-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row - Enhanced Professional */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* By Field Chart */}
            <Card variant="elevated" className="border-2 border-gray-100 hover:border-primary/30 transition-all">
              <Card.Header className="border-b-2 border-gray-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                    <Icon name="BookOpen" size={20} color="white" />
                  </div>
                  <Card.Title className="text-xl font-extrabold">Funding by Field of Study</Card.Title>
                </div>
                <Card.Description className="text-base">Distribution of collected amounts by academic field</Card.Description>
              </Card.Header>
              <Card.Content>
                {byField.length > 0 ? (
                  <div className="h-80">
                    <Bar
                      data={{
                        labels: byField.map(item => item.category || 'Other'),
                        datasets: [
                          {
                            label: 'Total Collected (MAD)',
                            data: byField.map(item => item.total),
                            backgroundColor: [
                              'rgba(59, 130, 246, 0.8)',
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(139, 92, 246, 0.8)',
                              'rgba(249, 115, 22, 0.8)',
                              'rgba(239, 68, 68, 0.8)',
                            ],
                            borderColor: [
                              'rgb(59, 130, 246)',
                              'rgb(16, 185, 129)',
                              'rgb(139, 92, 246)',
                              'rgb(249, 115, 22)',
                              'rgb(239, 68, 68)',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            display: false,
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.parsed.y;
                                const item = byField[context.dataIndex];
                                return [
                                  `Total: ${value.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}`,
                                  `Campaigns: ${item.count}`,
                                  `Avg: ${(value / item.count).toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}`
                                ];
                              }
                            }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: (value) => `${(value / 1000).toFixed(0)}K`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No data available</div>
                )}
              </Card.Content>
            </Card>

            {/* By Region Chart */}
            <Card variant="elevated" className="border-2 border-gray-100 hover:border-primary/30 transition-all">
              <Card.Header className="border-b-2 border-gray-100 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <Icon name="MapPin" size={20} color="white" />
                  </div>
                  <Card.Title className="text-xl font-extrabold">Funding by Region</Card.Title>
                </div>
                <Card.Description className="text-base">Geographical distribution of campaigns</Card.Description>
              </Card.Header>
              <Card.Content>
                {byRegion.length > 0 ? (
                  <div className="h-80">
                    <Doughnut
                      data={{
                        labels: byRegion.map(item => item.city || 'Unknown'),
                        datasets: [
                          {
                            label: 'Total Collected',
                            data: byRegion.map(item => item.total),
                            backgroundColor: [
                              'rgba(16, 185, 129, 0.8)',
                              'rgba(6, 182, 212, 0.8)',
                              'rgba(236, 72, 153, 0.8)',
                              'rgba(234, 179, 8, 0.8)',
                              'rgba(99, 102, 241, 0.8)',
                            ],
                            borderColor: [
                              'rgb(16, 185, 129)',
                              'rgb(6, 182, 212)',
                              'rgb(236, 72, 153)',
                              'rgb(234, 179, 8)',
                              'rgb(99, 102, 241)',
                            ],
                            borderWidth: 2,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const value = context.parsed;
                                const item = byRegion[context.dataIndex];
                                const total = byRegion.reduce((sum, i) => sum + i.total, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return [
                                  `${context.label}: ${value.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}`,
                                  `${percentage}% of total`,
                                  `${item.count} campaigns`
                                ];
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No data available</div>
                )}
              </Card.Content>
            </Card>
          </div>

          {/* Recent Campaigns - Enhanced */}
          <Card variant="elevated" className="border-2 border-gray-100">
            <Card.Header className="border-b-2 border-gray-100 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <Icon name="Rocket" size={20} color="white" />
                  </div>
                  <div>
                    <Card.Title className="text-xl font-extrabold">Recent Campaigns</Card.Title>
                    <Card.Description className="text-base">Latest fundraising campaigns and their progress</Card.Description>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/discover')}
                  iconName="ExternalLink"
                  className="rounded-full"
                >
                  View All
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {recentCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => {
                    const percentage = (campaign.current_amount / campaign.goal_amount) * 100;
                    const isHighPerforming = percentage >= 75;
                    const isMidPerforming = percentage >= 50 && percentage < 75;

                    return (
                      <div
                        key={campaign.id}
                        className="group p-5 border-2 border-gray-200 rounded-2xl hover:border-primary hover:shadow-xl transition-all cursor-pointer bg-gradient-to-r from-white to-gray-50 hover:from-primary/5 hover:to-primary/10"
                        onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-bold text-lg text-gray-900 group-hover:text-primary transition-colors">{campaign.title}</h4>
                              {isHighPerforming && (
                                <Badge variant="success" className="shadow-md">
                                  <Icon name="Flame" size={12} className="mr-1" />
                                  Hot
                                </Badge>
                              )}
                              {isMidPerforming && (
                                <Badge variant="default" className="shadow-md bg-blue-100 text-blue-700">
                                  <Icon name="TrendingUp" size={12} className="mr-1" />
                                  Trending
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                                <Icon name="Tag" size={14} />
                                {campaign.category || 'General'}
                              </span>
                              {campaign.city && (
                                <span className="flex items-center gap-1">
                                  <Icon name="MapPin" size={14} />
                                  {campaign.city}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-primary">
                                <Icon name="Eye" size={14} />
                                Click to view
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-semibold text-gray-900">
                              {campaign.current_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                            </span>
                            <span className="text-gray-600">
                              Goal: {campaign.goal_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                            </span>
                          </div>

                          <div className="relative">
                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  isHighPerforming
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                    : isMidPerforming
                                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                                    : 'bg-gradient-to-r from-primary to-teal-600'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs font-semibold">
                              <span className={`${
                                isHighPerforming ? 'text-green-600' : isMidPerforming ? 'text-blue-600' : 'text-primary'
                              }`}>
                                {percentage.toFixed(1)}% funded
                              </span>
                              <span className="text-gray-500">
                                {100 - percentage.toFixed(1)}% to go
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon name="FolderOpen" size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No campaigns yet</p>
                  <p className="text-sm text-gray-400 mt-1">Recent campaigns will appear here</p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;
