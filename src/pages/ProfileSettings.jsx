import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Icon from '../components/AppIcon';
import Input from '../components/ui/Input';
import Avatar from '../components/ui/Avatar';
import toast from '../utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

const ProfileSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    university: '',
    field: '',
    year: '',
    city: '',
    country: 'Morocco',
    avatar: '',
    role: '',
    // Social Links
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    website: ''
  });

  useEffect(() => {
    const authToken = localStorage.getItem('auth-token');
    if (!authToken) {
      toast.error('Please login to access this page');
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('user-id');
      const response = await fetch(`${API_BASE_URL}/profile/${userId}`);
      const data = await response.json();

      if (data.success) {
        setProfile({
          ...data.profile,
          firstName: data.profile.first_name || '',
          lastName: data.profile.last_name || '',
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const userId = localStorage.getItem('user-id');

      const response = await fetch(`${API_BASE_URL}/profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Profile updated successfully!');
        // Update local storage with new email if changed
        if (profile.email) {
          localStorage.setItem('user-email', profile.email);
        }
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error saving profile:', err);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', localStorage.getItem('user-id'));

      const response = await fetch(`${API_BASE_URL}/upload/avatar`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProfile({ ...profile, avatar: data.avatarUrl });
        toast.success('Avatar updated successfully!');
      } else {
        toast.error(data.message || 'Failed to upload avatar');
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-semibold text-gray-900">Loading Profile...</p>
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
              Profile
              <span className="block mt-1 bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                Settings
              </span>
            </h1>
            <p className="text-xl text-gray-600">Manage your personal information and preferences</p>
          </div>

          {/* Avatar Section */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-purple-700">
                <Icon name="User" size={20} />
                <h3 className="text-lg font-bold">Profile Picture</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar
                    src={profile.avatar}
                    alt={`${profile.firstName} ${profile.lastName}`}
                    size="2xl"
                    className="shadow-2xl ring-4 ring-white"
                  />
                  {uploadingAvatar && (
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                      <Icon name="Loader2" size={32} color="white" className="animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile.firstName} {profile.lastName}
                  </h3>
                  <Badge variant="default" className="mb-4">
                    <Icon name="Shield" size={14} className="mr-1" />
                    {profile.role}
                  </Badge>
                  <p className="text-gray-600 mb-6">
                    Upload a profile picture to personalize your account
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      />
                      <Button
                        as="span"
                        variant="default"
                        iconName="Upload"
                        disabled={uploadingAvatar}
                        className="rounded-full"
                      >
                        {uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                      </Button>
                    </label>
                    {profile.avatar && (
                      <Button
                        variant="outline"
                        iconName="Trash2"
                        className="rounded-full"
                        onClick={() => setProfile({ ...profile, avatar: '' })}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    JPG, PNG or GIF. Max size 5MB
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-blue-700">
                <Icon name="UserCircle" size={20} />
                <h3 className="text-lg font-bold">Personal Information</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={4}
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Brief description for your profile. Max 500 characters.
                </p>
              </div>
            </div>
          </Card>

          {/* Education Information (For Students) */}
          {profile.role === 'student' && (
            <Card variant="elevated" className="mb-8 border-2 border-gray-100">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-2 text-emerald-700">
                  <Icon name="GraduationCap" size={20} />
                  <h3 className="text-lg font-bold">Education Information</h3>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      University/Institution
                    </label>
                    <Input
                      value={profile.university}
                      onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                      placeholder="e.g., Mohammed V University"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Field of Study
                    </label>
                    <Input
                      value={profile.field}
                      onChange={(e) => setProfile({ ...profile, field: e.target.value })}
                      placeholder="e.g., Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Academic Year
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={profile.year}
                      onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                    >
                      <option value="">Select Year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="5th Year">5th Year</option>
                      <option value="Master's">Master's</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Location */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-orange-700">
                <Icon name="MapPin" size={20} />
                <h3 className="text-lg font-bold">Location</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    placeholder="e.g., Casablanca"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Country
                  </label>
                  <Input
                    value={profile.country}
                    onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                    placeholder="Morocco"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card variant="elevated" className="mb-8 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2 text-indigo-700">
                <Icon name="Share2" size={20} />
                <h3 className="text-lg font-bold">Social Links</h3>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="Facebook" size={16} className="text-blue-600" />
                    Facebook
                  </label>
                  <Input
                    value={profile.facebook}
                    onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                    placeholder="https://facebook.com/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="Twitter" size={16} className="text-blue-400" />
                    Twitter
                  </label>
                  <Input
                    value={profile.twitter}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="Linkedin" size={16} className="text-blue-700" />
                    LinkedIn
                  </label>
                  <Input
                    value={profile.linkedin}
                    onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="Instagram" size={16} className="text-pink-600" />
                    Instagram
                  </label>
                  <Input
                    value={profile.instagram}
                    onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Icon name="Globe" size={16} className="text-gray-600" />
                    Website
                  </label>
                  <Input
                    value={profile.website}
                    onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleSave}
              disabled={saving}
              iconName={saving ? "Loader2" : "Save"}
              className="rounded-full bg-gradient-to-r from-primary to-teal-600 hover:shadow-2xl hover:scale-105 transition-all"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfileSettings;
