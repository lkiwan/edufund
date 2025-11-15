import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../ui/Button';
import Icon from '../AppIcon';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const authToken = localStorage.getItem('auth-token');
    const savedUserRole = localStorage.getItem('user-role');
    const savedEmail = localStorage.getItem('user-email');
    if (authToken && savedUserRole) {
      setIsAuthenticated(true);
      setUserRole(savedUserRole);
      setUserEmail(savedEmail || '');
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
      setUserEmail('');
    }
  }, [location]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-role');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-id');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setIsProfileOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (userRole === 'student') return '/student-dashboard';
    if (userRole === 'donor') return '/donor-dashboard';
    if (userRole === 'admin' || userRole === 'super-admin') return '/admin-dashboard';
    return '/';
  };

  const getUserInitials = () => {
    if (userEmail) {
      return userEmail.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getRoleBadgeColor = () => {
    if (userRole === 'admin' || userRole === 'super-admin') return 'bg-purple-100 text-purple-700';
    if (userRole === 'student') return 'bg-blue-100 text-blue-700';
    if (userRole === 'donor') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsProfileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={24} color="white" />
            </div>
            <span className="text-2xl font-heading font-bold text-foreground">
              EduFund
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigate('/discover')}
              className={`font-medium transition-colors ${
                location.pathname === '/discover'
                  ? 'text-primary'
                  : 'text-foreground hover:text-primary'
              }`}
            >
              Discover
            </button>
            {/* Analytics - Admin Only */}
            {(userRole === 'admin' || userRole === 'super-admin') && (
              <button
                onClick={() => navigate('/global-dashboard')}
                className={`font-medium transition-colors ${
                  location.pathname === '/global-dashboard'
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                Analytics
              </button>
            )}
            {/* How It Works - Hidden for Admins */}
            {userRole !== 'admin' && userRole !== 'super-admin' && (
              <button
                onClick={() => navigate('/how-it-works')}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                How It Works
              </button>
            )}
            {/* About - Hidden for Admins */}
            {userRole !== 'admin' && userRole !== 'super-admin' && (
              <button
                onClick={() => navigate('/about')}
                className="font-medium text-foreground hover:text-primary transition-colors"
              >
                About
              </button>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                {/* Profile Toggle Button */}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
                    {getUserInitials()}
                  </div>
                  {/* User Info */}
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {userEmail.split('@')[0]}
                    </div>
                    <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${getRoleBadgeColor()}`}>
                      {userRole}
                    </div>
                  </div>
                  {/* Dropdown Icon */}
                  <Icon
                    name={isProfileOpen ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    className="text-gray-500"
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-slide-up">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {getUserInitials()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{userEmail.split('@')[0]}</div>
                          <div className="text-sm text-gray-500">{userEmail}</div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleBadgeColor()}`}>
                            {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dashboard */}
                      <button
                        onClick={() => handleMenuClick(getDashboardPath())}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="LayoutDashboard" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Dashboard</span>
                      </button>

                      {/* Profile Settings */}
                      <button
                        onClick={() => handleMenuClick('/profile-settings')}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="User" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Profile Settings</span>
                      </button>

                      {/* Account Settings */}
                      <button
                        onClick={() => handleMenuClick('/account-settings')}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="Settings" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Account Settings</span>
                      </button>

                      {/* My Campaigns (Student only) */}
                      {userRole === 'student' && (
                        <button
                          onClick={() => handleMenuClick('/student-dashboard?section=campaign')}
                          className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="Briefcase" size={18} className="text-gray-600" />
                          <span className="text-sm text-gray-700">My Campaigns</span>
                        </button>
                      )}

                      {/* My Donations (Donor only) */}
                      {userRole === 'donor' && (
                        <button
                          onClick={() => handleMenuClick('/donor-dashboard?section=donations')}
                          className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                        >
                          <Icon name="Heart" size={18} className="text-gray-600" />
                          <span className="text-sm text-gray-700">My Donations</span>
                        </button>
                      )}

                      {/* Saved Campaigns */}
                      <button
                        onClick={() => handleMenuClick('/saved-campaigns')}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="Bookmark" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Saved Campaigns</span>
                      </button>

                      {/* Notifications */}
                      <button
                        onClick={() => handleMenuClick('/notifications')}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="Bell" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Notifications</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Help & Support */}
                    <div className="py-2">
                      <button
                        onClick={() => handleMenuClick('/help')}
                        className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                      >
                        <Icon name="HelpCircle" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">Help & Support</span>
                      </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left flex items-center space-x-3 hover:bg-red-50 transition-colors text-red-600"
                    >
                      <Icon name="LogOut" size={18} className="text-red-600" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate('/login')}
                  size="sm"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  onClick={() => navigate('/login')}
                  className="rounded-full"
                  size="sm"
                >
                  Start a Campaign
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-slide-up border-t border-border">
            <button
              onClick={() => {
                navigate('/');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => {
                navigate('/discover');
                setIsMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              Discover
            </button>
            {/* Analytics - Admin Only */}
            {(userRole === 'admin' || userRole === 'super-admin') && (
              <button
                onClick={() => {
                  navigate('/global-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                Analytics
              </button>
            )}
            {/* How It Works - Hidden for Admins */}
            {userRole !== 'admin' && userRole !== 'super-admin' && (
              <button
                onClick={() => {
                  navigate('/how-it-works');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                How It Works
              </button>
            )}
            {/* About - Hidden for Admins */}
            {userRole !== 'admin' && userRole !== 'super-admin' && (
              <button
                onClick={() => {
                  navigate('/about');
                  setIsMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                About
              </button>
            )}

            <div className="pt-3 border-t border-border">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Profile Card */}
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{userEmail.split('@')[0]}</div>
                        <div className="text-sm text-gray-600">{userEmail}</div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getRoleBadgeColor()}`}>
                          {userRole?.charAt(0).toUpperCase() + userRole?.slice(1)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        navigate(getDashboardPath());
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="LayoutDashboard" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/profile-settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="User" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Profile Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/account-settings');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="Settings" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Account Settings</span>
                    </button>

                    {userRole === 'student' && (
                      <button
                        onClick={() => {
                          navigate('/student-dashboard?section=campaign');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Icon name="Briefcase" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">My Campaigns</span>
                      </button>
                    )}

                    {userRole === 'donor' && (
                      <button
                        onClick={() => {
                          navigate('/donor-dashboard?section=donations');
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Icon name="Heart" size={18} className="text-gray-600" />
                        <span className="text-sm text-gray-700">My Donations</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        navigate('/saved-campaigns');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="Bookmark" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Saved Campaigns</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="Bell" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Notifications</span>
                    </button>

                    <button
                      onClick={() => {
                        navigate('/help');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Icon name="HelpCircle" size={18} className="text-gray-600" />
                      <span className="text-sm text-gray-700">Help & Support</span>
                    </button>
                  </div>

                  {/* Sign Out Button */}
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      <Icon name="LogOut" size={18} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                    fullWidth
                  >
                    Start a Campaign
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
