import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/AppIcon';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import toast from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const AccountSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    campaignUpdates: true,
    donationReceipts: true,
    monthlyReports: true,
    marketingEmails: false,
    twoFactorEnabled: false,
    publicProfile: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    const authToken = localStorage.getItem('auth-token');
    if (!authToken) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchSettings();
  }, [navigate]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/account/settings/${userId}`);
      const data = await response.json();

      if (data.success) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/account/settings/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save settings');
    }
  };

  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/account/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/account/delete/${userId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Account deleted successfully');
        localStorage.clear();
        navigate('/');
      } else {
        toast.error('Failed to delete account');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900">Loading Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
              Account
              <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Settings
              </span>
            </h1>
            <p className="text-xl text-gray-600">Manage your account security and preferences</p>
          </div>

          {/* Security */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-red-700">
                <Icon name="Shield" size={20} />
                <h3 className="text-lg font-bold">Security</h3>
              </div>
            </div>
            <div className="p-8">
              {/* Change Password */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-900 mb-6 text-lg">Change Password</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    disabled={changingPassword}
                    iconName={changingPassword ? "Loader2" : "Lock"}
                    className="rounded-full"
                  >
                    {changingPassword ? 'Changing Password...' : 'Change Password'}
                  </Button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="pt-8 border-t-2 border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.twoFactorEnabled}
                      onChange={(e) => {
                        setSettings({ ...settings, twoFactorEnabled: e.target.checked });
                        handleSaveSettings();
                      }}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Icon name="Bell" size={20} />
                <h3 className="text-lg font-bold">Email Notifications</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">All Email Notifications</h4>
                    <p className="text-sm text-gray-600">
                      Receive updates about your campaigns and donations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.emailNotifications}
                      onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Campaign Updates</h4>
                    <p className="text-sm text-gray-600">
                      Get notified when campaigns you support post updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.campaignUpdates}
                      onChange={(e) => setSettings({ ...settings, campaignUpdates: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Donation Receipts</h4>
                    <p className="text-sm text-gray-600">
                      Receive email receipts for your donations
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.donationReceipts}
                      onChange={(e) => setSettings({ ...settings, donationReceipts: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Monthly Reports</h4>
                    <p className="text-sm text-gray-600">
                      Get monthly summaries of your activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.monthlyReports}
                      onChange={(e) => setSettings({ ...settings, monthlyReports: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Marketing Emails</h4>
                    <p className="text-sm text-gray-600">
                      Receive news and promotional offers
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.marketingEmails}
                      onChange={(e) => setSettings({ ...settings, marketingEmails: e.target.checked })}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>

              <div className="mt-8">
                <Button
                  onClick={handleSaveSettings}
                  iconName="Save"
                  className="rounded-full bg-gradient-to-r from-primary to-teal-600"
                >
                  Save Notification Preferences
                </Button>
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-purple-700">
                <Icon name="Lock" size={20} />
                <h3 className="text-lg font-bold">Privacy</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Public Profile</h4>
                  <p className="text-sm text-gray-600">
                    Allow others to see your profile and campaigns
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={settings.publicProfile}
                    onChange={(e) => {
                      setSettings({ ...settings, publicProfile: e.target.checked });
                      handleSaveSettings();
                    }}
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-6 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card variant="elevated" className="mb-8 border-2 border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
            <div className="bg-gradient-to-r from-red-100 to-orange-100 px-6 py-4 border-b-2 border-red-200">
              <div className="flex items-center gap-2 text-red-700">
                <Icon name="AlertTriangle" size={20} />
                <h3 className="text-lg font-bold">Danger Zone</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h4 className="font-bold text-red-900 mb-2">Delete Account</h4>
                  <p className="text-sm text-red-700">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(true)}
                  iconName="Trash2"
                  className="border-red-500 text-red-600 hover:bg-red-50 rounded-full"
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="md"
      >
        <Modal.Body>
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="AlertTriangle" size={32} className="text-red-600" />
            </div>
            <p className="text-center text-gray-700 mb-4">
              This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold mb-2">
                This will delete:
              </p>
              <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                <li>Your profile and personal information</li>
                <li>All your campaigns</li>
                <li>Your donation history</li>
                <li>All comments and updates</li>
              </ul>
            </div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type "DELETE" to confirm
            </label>
            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="text-center"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'DELETE'}
              className="bg-red-600 hover:bg-red-700"
              iconName="Trash2"
            >
              Delete Account
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <Footer />
    </div>
  );
};

export default AccountSettings;
