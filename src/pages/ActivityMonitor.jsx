import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/AppIcon';
import Input from '../components/ui/Input';
import toast from '../utils/toast';
import { formatCurrency } from '../utils/currency';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ActivityMonitor = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [timeRange, setTimeRange] = useState('today');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Check admin authentication
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');

    if (!authToken || (userRole !== 'admin' && userRole !== 'super-admin')) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/login');
      return;
    }

    fetchActivities();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchActivities(true);
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeRange, autoRefresh, navigate]);

  // Filter activities when search or filter changes
  useEffect(() => {
    let filtered = [...activities];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(a => a.type === filterType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(a =>
        a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredActivities(filtered);
  }, [searchTerm, filterType, activities]);

  const fetchActivities = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await fetch(`${API_BASE_URL}/admin/activities?timeRange=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
        setFilteredActivities(data.activities || []);
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
      if (!silent) {
        toast.error('Failed to load activities');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const exportActivities = () => {
    const csv = [
      ['Timestamp', 'Type', 'User', 'Action', 'Details'].join(','),
      ...filteredActivities.map(a => [
        new Date(a.timestamp).toLocaleString(),
        a.type,
        a.user || 'System',
        a.action,
        `"${a.details || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-log-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success('Activity log exported');
  };

  const getActivityIcon = (type) => {
    const icons = {
      donation: { name: 'DollarSign', color: 'text-green-600', bg: 'bg-green-100' },
      campaign: { name: 'Briefcase', color: 'text-blue-600', bg: 'bg-blue-100' },
      user: { name: 'UserPlus', color: 'text-purple-600', bg: 'bg-purple-100' },
      approval: { name: 'CheckCircle', color: 'text-emerald-600', bg: 'bg-emerald-100' },
      rejection: { name: 'XCircle', color: 'text-red-600', bg: 'bg-red-100' },
      comment: { name: 'MessageSquare', color: 'text-indigo-600', bg: 'bg-indigo-100' },
      update: { name: 'Bell', color: 'text-orange-600', bg: 'bg-orange-100' },
      verification: { name: 'Shield', color: 'text-cyan-600', bg: 'bg-cyan-100' },
      system: { name: 'Settings', color: 'text-gray-600', bg: 'bg-gray-100' }
    };
    return icons[type] || icons.system;
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: 'Activity' },
    { value: 'donation', label: 'Donations', icon: 'DollarSign' },
    { value: 'campaign', label: 'Campaigns', icon: 'Briefcase' },
    { value: 'user', label: 'Users', icon: 'Users' },
    { value: 'approval', label: 'Approvals', icon: 'CheckCircle' },
    { value: 'rejection', label: 'Rejections', icon: 'XCircle' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-pulse">
            <Icon name="Activity" size={40} color="white" />
          </div>
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">Loading Activity Monitor...</p>
          <p className="text-gray-600">Fetching real-time data</p>
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
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
                    Activity
                    <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                      Monitor
                    </span>
                  </h1>
                  <Badge variant="default" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg px-4 py-2">
                    <Icon name="Shield" size={14} className="mr-1" />
                    Admin Only
                  </Badge>
                </div>
                <p className="text-xl text-gray-600">
                  Real-time monitoring of all platform activities
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
                <Button
                  variant="outline"
                  onClick={exportActivities}
                  iconName="Download"
                  className="rounded-full"
                >
                  Export CSV
                </Button>
                <Button
                  onClick={() => fetchActivities()}
                  iconName="RefreshCw"
                  className="rounded-full bg-gradient-to-r from-primary to-teal-600 hover:shadow-lg"
                >
                  Refresh
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card variant="elevated" className="bg-gradient-to-br from-white to-blue-50 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Activities</p>
                    <p className="text-3xl font-extrabold text-gray-900">{activities.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Icon name="Activity" size={24} className="text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-white to-green-50 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Today's Events</p>
                    <p className="text-3xl font-extrabold text-gray-900">
                      {activities.filter(a => {
                        const today = new Date().toDateString();
                        return new Date(a.timestamp).toDateString() === today;
                      }).length}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Icon name="Calendar" size={24} className="text-green-600" />
                  </div>
                </div>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-white to-purple-50 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Auto Refresh</p>
                    <p className="text-xl font-extrabold text-gray-900">
                      {autoRefresh ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      autoRefresh ? 'bg-purple-500 hover:bg-purple-600' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  >
                    <Icon name={autoRefresh ? 'Zap' : 'ZapOff'} size={24} color="white" />
                  </button>
                </div>
              </Card>

              <Card variant="elevated" className="bg-gradient-to-br from-white to-orange-50 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Filtered Results</p>
                    <p className="text-3xl font-extrabold text-gray-900">{filteredActivities.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Icon name="Filter" size={24} className="text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Filters */}
            <Card variant="elevated" className="mb-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search activities..."
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Type Filter */}
                <div className="flex gap-2 overflow-x-auto">
                  {activityTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setFilterType(type.value)}
                      className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                        filterType === type.value
                          ? 'bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      <Icon name={type.icon} size={16} />
                      {type.label}
                    </button>
                  ))}
                </div>

                {/* Time Range */}
                <div className="flex gap-2">
                  {['today', 'week', 'month', 'all'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-4 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${
                        timeRange === range
                          ? 'bg-primary text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                      }`}
                    >
                      {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Activity Feed */}
          <Card variant="elevated" className="border-2 border-gray-100">
            <Card.Header className="border-b-2 border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Icon name="List" size={20} color="white" />
                </div>
                <div>
                  <Card.Title className="text-xl font-extrabold">Activity Timeline</Card.Title>
                  <Card.Description className="text-base">
                    Real-time feed of platform events
                    {autoRefresh && <span className="text-green-600 ml-2">● Live</span>}
                  </Card.Description>
                </div>
              </div>
            </Card.Header>

            <Card.Content className="p-0">
              {filteredActivities.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {filteredActivities.map((activity, index) => {
                    const iconConfig = getActivityIcon(activity.type);
                    return (
                      <div
                        key={index}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`w-12 h-12 ${iconConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                            <Icon name={iconConfig.name} size={24} className={iconConfig.color} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 mb-1">
                                  {activity.action || 'Activity'}
                                </h4>
                                <p className="text-gray-600 text-sm mb-2">
                                  {activity.description || 'No description'}
                                </p>
                                {activity.details && (
                                  <p className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg inline-block">
                                    {activity.details}
                                  </p>
                                )}
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {getRelativeTime(activity.timestamp)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {new Date(activity.timestamp).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              {activity.user && (
                                <span className="flex items-center gap-1">
                                  <Icon name="User" size={12} />
                                  {activity.user}
                                </span>
                              )}
                              <Badge variant="outline" size="sm">
                                {activity.type}
                              </Badge>
                              {activity.amount && (
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(activity.amount)}
                                </span>
                              )}
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
                    <Icon name="Inbox" size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium mb-2">No activities found</p>
                  <p className="text-sm text-gray-400">
                    {searchTerm || filterType !== 'all'
                      ? 'Try adjusting your filters'
                      : 'Activities will appear here as they occur'}
                  </p>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ActivityMonitor;
