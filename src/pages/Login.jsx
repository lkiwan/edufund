import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Icon from '../components/AppIcon';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerFullName, setRegisterFullName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [userType, setUserType] = useState('student');

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });

  useEffect(() => {
    // Check if user is already authenticated
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');

    if (authToken && userRole) {
      redirectToDashboard(userRole);
    }
  }, []);

  // Calculate password strength
  useEffect(() => {
    if (registerPassword) {
      const strength = calculatePasswordStrength(registerPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength({ score: 0, label: '', color: '' });
    }
  }, [registerPassword]);

  const calculatePasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, label: '', color: '' };

    // Length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) score += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) score += 1;

    // Contains numbers
    if (/\d/.test(password)) score += 1;

    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine label and color
    if (score <= 2) {
      return { score, label: 'Weak', color: 'bg-red-500' };
    } else if (score <= 4) {
      return { score, label: 'Medium', color: 'bg-yellow-500' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500' };
    }
  };

  const redirectToDashboard = (role) => {
    if (role === 'student') {
      navigate('/student-dashboard');
    } else if (role === 'donor') {
      navigate('/donor-dashboard');
    } else if (role === 'admin' || role === 'super-admin') {
      navigate('/admin-dashboard'); // Admin has full access to everything
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.auth.login({ email: loginEmail, password: loginPassword });

      if (response.success) {
        localStorage.setItem('auth-token', 'dummy-token');
        localStorage.setItem('user-role', response.user.role);
        localStorage.setItem('user-email', response.user.email);
        localStorage.setItem('user-name', response.user.full_name || response.user.email);
        localStorage.setItem('user-id', response.user.id);
        redirectToDashboard(response.user.role);
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Enhanced validation
    if (!registerFullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!registerEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!registerPhone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    if (!/^[\d\s\-\+\(\)]+$/.test(registerPhone)) {
      setError('Please enter a valid phone number');
      return;
    }

    if (registerPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password (add uppercase, numbers, or special characters)');
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.register({
        email: registerEmail,
        password: registerPassword,
        full_name: registerFullName,
        phone: registerPhone,
        role: userType
      });

      if (response.success) {
        localStorage.setItem('auth-token', 'dummy-token');
        localStorage.setItem('user-role', response.user.role);
        localStorage.setItem('user-email', response.user.email);
        localStorage.setItem('user-name', response.user.full_name || response.user.email);
        localStorage.setItem('user-id', response.user.id);
        redirectToDashboard(response.user.role);
      } else {
        setError(response.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type) => {
    if (type === 'student') {
      setLoginEmail('sarah.johnson@student.edu');
      setLoginPassword('password123');
    } else if (type === 'donor') {
      setLoginEmail('john.doe@donor.com');
      setLoginPassword('password123');
    } else if (type === 'admin') {
      setLoginEmail('admin@edufund.com');
      setLoginPassword('admin123');
    }
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex flex-col page-transition">
      {/* Header */}
      <div className="px-6 py-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GraduationCap" size={24} color="white" />
            </div>
            <span className="text-2xl font-heading font-bold text-gray-900">EduFund</span>
          </div>

          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            iconName="X"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card variant="elevated" padding="lg" className="animate-scale-in">
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
                {activeTab === 'login' ? 'Welcome Back' : 'Join EduFund'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'login'
                  ? 'Sign in to manage your campaigns and support students'
                  : 'Create an account to start your fundraising journey'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Demo Credentials Info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-medium text-blue-900 mb-3">Quick Access (Demo):</p>
              <div className="space-y-2">
                <button
                  onClick={() => fillDemoCredentials('student')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <strong>Student:</strong> sarah.johnson@student.edu
                </button>
                <button
                  onClick={() => fillDemoCredentials('donor')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <strong>Donor:</strong> john.doe@donor.com
                </button>
                <button
                  onClick={() => fillDemoCredentials('admin')}
                  className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-blue-100 transition-colors text-sm"
                >
                  <strong>Admin:</strong> admin@edufund.com
                </button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="login" onChange={setActiveTab}>
              <Tabs.List variant="default" className="mb-6">
                <Tabs.Trigger value="login">Sign In</Tabs.Trigger>
                <Tabs.Trigger value="register">Sign Up</Tabs.Trigger>
              </Tabs.List>

              {/* Login Tab */}
              <Tabs.Content value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        required
                        placeholder="Enter your password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        <Icon name={showLoginPassword ? 'EyeOff' : 'Eye'} size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm text-gray-600">Remember me</span>
                    </label>
                    <button type="button" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    fullWidth
                    loading={loading}
                    className="rounded-full"
                  >
                    Sign In
                  </Button>
                </form>
              </Tabs.Content>

              {/* Register Tab */}
              <Tabs.Content value="register">
                <form onSubmit={handleRegister} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={registerFullName}
                      onChange={(e) => setRegisterFullName(e.target.value)}
                      required
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={registerPhone}
                      onChange={(e) => setRegisterPhone(e.target.value)}
                      required
                      placeholder="+212 6XX XXX XXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showRegisterPassword ? 'text' : 'password'}
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        required
                        placeholder="At least 8 characters"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        <Icon name={showRegisterPassword ? 'EyeOff' : 'Eye'} size={20} />
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {registerPassword && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">Password strength:</span>
                          <span className={`text-xs font-medium ${
                            passwordStrength.score <= 2 ? 'text-red-600' :
                            passwordStrength.score <= 4 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${(passwordStrength.score / 6) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Use 8+ characters with uppercase, lowercase, numbers & symbols
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        required
                        placeholder="Confirm your password"
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        <Icon name={showConfirmPassword ? 'EyeOff' : 'Eye'} size={20} />
                      </button>
                    </div>
                    {registerConfirmPassword && registerPassword !== registerConfirmPassword && (
                      <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      I am a
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setUserType('student')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          userType === 'student'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon
                          name="GraduationCap"
                          size={28}
                          className={`mx-auto mb-2 ${userType === 'student' ? 'text-primary' : 'text-gray-600'}`}
                        />
                        <div className={`text-sm font-semibold ${userType === 'student' ? 'text-primary' : 'text-gray-700'}`}>
                          Student
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Raise funds for education
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setUserType('donor')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          userType === 'donor'
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon
                          name="Heart"
                          size={28}
                          className={`mx-auto mb-2 ${userType === 'donor' ? 'text-primary' : 'text-gray-600'}`}
                        />
                        <div className={`text-sm font-semibold ${userType === 'donor' ? 'text-primary' : 'text-gray-700'}`}>
                          Supporter
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Help students succeed
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600">
                    By creating an account, you agree to our{' '}
                    <button type="button" className="text-primary hover:underline">
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button type="button" className="text-primary hover:underline">
                      Privacy Policy
                    </button>
                  </div>

                  <Button
                    type="submit"
                    variant="default"
                    size="lg"
                    fullWidth
                    loading={loading}
                    className="rounded-full"
                  >
                    Create Account
                  </Button>
                </form>
              </Tabs.Content>
            </Tabs>
          </Card>

          {/* Trust Badges */}
          <div className="mt-8">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Icon name="Shield" size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-xs text-gray-600 font-medium">Secure</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Icon name="Users" size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-xs text-gray-600 font-medium">Trusted</p>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <Icon name="CheckCircle" size={24} className="mx-auto mb-2 text-primary" />
                <p className="text-xs text-gray-600 font-medium">Verified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
