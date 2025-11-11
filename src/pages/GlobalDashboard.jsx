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
    const role = localStorage.getItem('user-role');
    const id = localStorage.getItem('user-id');
    setUserRole(role);
    setUserId(id);
    setIsAdmin(role === 'admin' || role === 'super-admin');
    fetchGlobalStats(role, id);
  }, [timeRange]);

  const fetchGlobalStats = async (role, id) => {
    try {
      setLoading(true);
      const currentRole = role || userRole;
      const currentId = id || userId;

      // If student, fetch only their campaigns
      const url = currentRole === 'student' && currentId
        ? `${API_BASE_URL}/analytics/global?timeRange=${timeRange}&userId=${currentId}`
        : `${API_BASE_URL}/analytics/global?timeRange=${timeRange}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
        setByField(data.byField || []);
        setByRegion(data.byRegion || []);
        setRecentCampaigns(data.recentCampaigns || []);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-heading font-bold text-gray-900">
                  {isAdmin ? 'Global Analytics Dashboard' : 'My Campaign Analytics'}
                </h1>
                <p className="text-gray-600 mt-2">
                  {isAdmin
                    ? 'Comprehensive overview of all campaigns and contributions'
                    : 'Track your campaign performance and insights'}
                </p>
              </div>

              <div className="flex gap-3">
                {!isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/student-dashboard')}
                    iconName="ArrowLeft"
                  >
                    Back to Dashboard
                  </Button>
                )}
                <Button variant="outline" onClick={exportToCSV} iconName="Download">
                  Export CSV
                </Button>
                <Button onClick={exportToPDF} iconName="FileText">
                  Generate PDF Report
                </Button>
              </div>
            </div>

            {/* Time Range Filter */}
            <div className="flex gap-2">
              {['all', 'month', 'week'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range === 'all' ? 'All Time' : range === 'month' ? 'This Month' : 'This Week'}
                </button>
              ))}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Icon name="Banknote" size={24} className="text-green-600" />
                </div>
                <Badge variant="success">+12%</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Collected</p>
              <p className="text-3xl font-bold text-gray-900">
                {globalStats.totalCollected?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ≈ ${(globalStats.totalCollected / 10).toLocaleString()} USD
              </p>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-blue-600" />
                </div>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Students Supported</p>
              <p className="text-3xl font-bold text-gray-900">{globalStats.studentsSupported}</p>
              <p className="text-xs text-gray-500 mt-2">
                {globalStats.activeCampaigns} active campaigns
              </p>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} className="text-purple-600" />
                </div>
                <Badge variant="default">{globalStats.averageCompletion}%</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Completion Rate</p>
              <p className="text-3xl font-bold text-gray-900">{globalStats.averageCompletion}%</p>
              <p className="text-xs text-gray-500 mt-2">
                Of funding goals reached
              </p>
            </Card>

            <Card variant="elevated">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Icon name="Heart" size={24} className="text-orange-600" />
                </div>
                <Badge variant="default">Growing</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Donors</p>
              <p className="text-3xl font-bold text-gray-900">{globalStats.totalDonors}</p>
              <p className="text-xs text-gray-500 mt-2">
                Avg donation: {globalStats.averageDonation?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
              </p>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Field Chart */}
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Funding by Field of Study</Card.Title>
                <Card.Description>Distribution of collected amounts by academic field</Card.Description>
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
            <Card variant="elevated">
              <Card.Header>
                <Card.Title>Funding by Region</Card.Title>
                <Card.Description>Geographical distribution of campaigns</Card.Description>
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

          {/* Recent Campaigns */}
          <Card variant="elevated">
            <Card.Header>
              <Card.Title>Recent Campaigns</Card.Title>
              <Card.Description>Latest fundraising campaigns</Card.Description>
            </Card.Header>
            <Card.Content>
              {recentCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {recentCampaigns.map((campaign) => {
                    const percentage = (campaign.current_amount / campaign.goal_amount) * 100;

                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all cursor-pointer"
                        onClick={() => navigate(`/campaign-details/${campaign.id}`)}
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">{campaign.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Icon name="Tag" size={14} />
                              {campaign.category || 'General'}
                            </span>
                            {campaign.city && (
                              <span className="flex items-center gap-1">
                                <Icon name="MapPin" size={14} />
                                {campaign.city}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            {campaign.current_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })} / {campaign.goal_amount?.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}
                          </p>
                          <div className="w-40 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}% funded</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">No campaigns yet</div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GlobalDashboard;
