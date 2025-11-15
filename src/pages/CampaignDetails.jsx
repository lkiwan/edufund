import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import Footer from '../components/layout/Footer';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Progress from '../components/ui/Progress';
import Tabs from '../components/ui/Tabs';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/AppIcon';
import Image from '../components/AppImage';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import DonationModal from '../components/DonationModal';
import ShareButtons from '../components/ShareButtons';
import FavoriteButton from '../components/FavoriteButton';
import DonorWall from '../components/DonorWall';
// import MilestoneCelebration from '../components/MilestoneCelebration'; // DISABLED - causing 429 errors
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import toast from '../utils/toast';

const CampaignDetails = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // New state for interactive features
  const [updates, setUpdates] = useState([]);
  const [donations, setDonations] = useState([]);
  const [comments, setComments] = useState([]);
  const [newUpdate, setNewUpdate] = useState({ title: '', content: '' });
  const [newComment, setNewComment] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [thankYouMessage, setThankYouMessage] = useState('');
  // const [showMilestoneCelebration, setShowMilestoneCelebration] = useState(false); // DISABLED
  const [similarCampaigns, setSimilarCampaigns] = useState([]);
  const userEmail = localStorage.getItem('user-email');

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchUpdates();
      fetchDonations();
      fetchComments();
      fetchSimilarCampaigns();
      trackView();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.campaigns.getById(id);
      if (response.success) {
        setCampaign(response.campaign);
      } else {
        setError('Campaign not found');
      }
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/updates`);
      const data = await response.json();
      if (data.success) {
        setUpdates(data.updates || []);
      }
    } catch (err) {
      console.error('Error fetching updates:', err);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/donations`);
      const data = await response.json();
      if (data.success) {
        setDonations(data.donations || []);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/comments`);
      const data = await response.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const fetchSimilarCampaigns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns?status=active&limit=4`);
      const data = await response.json();
      if (data.success) {
        // Filter out current campaign and get similar ones
        const filtered = (data.campaigns || []).filter(c => c.id !== parseInt(id)).slice(0, 3);
        setSimilarCampaigns(filtered);
      }
    } catch (err) {
      console.error('Error fetching similar campaigns:', err);
    }
  };

  const trackView = async () => {
    try {
      await fetch(`${API_BASE_URL}/campaigns/${id}/view`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Error tracking view:', err);
    }
  };

  const handlePostUpdate = async () => {
    if (!newUpdate.content.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newUpdate.title,
          content: newUpdate.content,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewUpdate({ title: '', content: '' });
        fetchUpdates();
      }
    } catch (err) {
      console.error('Error posting update:', err);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          authorName: userEmail || 'Anonymous',
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this campaign: ${campaign?.title}`;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      // Track share
      fetch(`${API_BASE_URL}/campaigns/${id}/share`, { method: 'POST' });
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');

      // Track share
      fetch(`${API_BASE_URL}/campaigns/${id}/share`, { method: 'POST' });
    }
  };

  const handleSendThankYou = async () => {
    if (!thankYouMessage.trim() || !selectedDonation) return;

    try {
      const response = await fetch(`${API_BASE_URL}/donations/${selectedDonation.id}/thank-you`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: thankYouMessage,
          sentBy: userEmail,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setThankYouMessage('');
        setShowThankYouModal(false);
        setSelectedDonation(null);
        toast.success('Thank you message sent successfully!');
      }
    } catch (err) {
      console.error('Error sending thank you:', err);
      toast.error('Failed to send thank you message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Icon name="AlertCircle" size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'This campaign does not exist or has been removed.'}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const percentage = Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50">
      <Navigation />

      {/* Hero Image - Modern Style */}
      <div className="relative pt-16">
        <div className="relative w-full h-[500px] bg-gray-900 overflow-hidden shadow-2xl">
          <Image
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* Floating action buttons */}
          <div className="absolute top-6 right-6 flex gap-3">
            <ShareButtons
              url={window.location.href}
              title={campaign.title}
              variant="floating"
            />
            <FavoriteButton
              campaignId={campaign.id}
              userId={localStorage.getItem('user-id')}
              variant="floating"
              size="lg"
            />
          </div>

          {/* Campaign Badge Overlay */}
          <div className="absolute bottom-6 left-6 flex flex-wrap gap-3">
            {campaign.verificationStatus === 'verified' && (
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-2xl">
                <div className="flex items-center gap-2">
                  <Icon name="CheckCircle" size={16} className="text-green-600" />
                  <span className="font-bold text-gray-900">Verified Campaign</span>
                </div>
              </div>
            )}
            {campaign.category && (
              <div className="bg-primary/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-2xl">
                <div className="flex items-center gap-2 text-white">
                  <Icon name="Tag" size={16} />
                  <span className="font-semibold">{campaign.category}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Info */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
              <Icon name="ChevronRight" size={16} />
              <button onClick={() => navigate('/discover')} className="hover:text-primary transition-colors">Campaigns</button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-gray-900 font-medium">{campaign.category}</span>
            </div>

            {/* Title & Info */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              {campaign.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              {campaign.verificationStatus === 'verified' && (
                <Badge variant="success" size="lg" className="shadow-lg">
                  <Icon name="CheckCircle" size={16} className="mr-1" />
                  Verified Campaign
                </Badge>
              )}
              {campaign.category && (
                <div className="flex items-center text-base text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                  <Icon name="Tag" size={18} className="mr-2" />
                  {campaign.category}
                </div>
              )}
              {campaign.city && (
                <div className="flex items-center text-base text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                  <Icon name="MapPin" size={18} className="mr-2" />
                  {campaign.city}
                </div>
              )}
            </div>

            {/* Organizer Info - Enhanced */}
            <Card variant="elevated" className="mb-8 border-2 border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b-2 border-gray-100">
                <div className="flex items-center gap-2 text-indigo-700 mb-1">
                  <Icon name="User" size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wide">Campaign Organizer</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={campaign.studentAvatar}
                      alt={campaign.studentName || 'Student'}
                      size="xl"
                    />
                    {campaign.verification_status === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Icon name="CheckCircle" size={14} color="white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{campaign.studentName}</h3>
                    {campaign.university && (
                      <div className="flex items-center gap-2 text-gray-600 mb-2">
                        <Icon name="GraduationCap" size={16} />
                        <p className="text-sm font-medium">{campaign.university}</p>
                      </div>
                    )}
                    {campaign.field && (
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-indigo-100 text-indigo-700">
                          <Icon name="BookOpen" size={12} className="mr-1" />
                          {campaign.field}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="story">
              <Tabs.List variant="default" className="mb-6">
                <Tabs.Trigger value="story">
                  <Icon name="FileText" size={16} className="mr-2" />
                  Story
                </Tabs.Trigger>
                <Tabs.Trigger value="updates">
                  <Icon name="Bell" size={16} className="mr-2" />
                  Updates ({updates.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="donor-wall">
                  <Icon name="Trophy" size={16} className="mr-2" />
                  Donor Wall
                </Tabs.Trigger>
                <Tabs.Trigger value="donors">
                  <Icon name="Users" size={16} className="mr-2" />
                  All Donors ({donations.length})
                </Tabs.Trigger>
                <Tabs.Trigger value="comments">
                  <Icon name="MessageCircle" size={16} className="mr-2" />
                  Comments ({comments.length})
                </Tabs.Trigger>
              </Tabs.List>

              {/* Story Tab - Enhanced */}
              <Tabs.Content value="story">
                <Card variant="elevated" className="border-2 border-gray-100">
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b-2 border-gray-100">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Icon name="FileText" size={20} />
                      <h3 className="text-lg font-bold">Campaign Story</h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="prose prose-lg max-w-none">
                      <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                        {campaign.description}
                      </p>
                    </div>

                    {/* Campaign Details Grid */}
                    {(campaign.category || campaign.field || campaign.year) && (
                      <div className="mt-8 pt-8 border-t-2 border-gray-100">
                        <h4 className="font-bold text-gray-900 mb-4">Campaign Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {campaign.category && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                              <div className="flex items-center gap-2 text-blue-700 mb-2">
                                <Icon name="Tag" size={16} />
                                <span className="text-xs font-semibold uppercase">Category</span>
                              </div>
                              <div className="font-bold text-gray-900">{campaign.category}</div>
                            </div>
                          )}
                          {campaign.field && (
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                              <div className="flex items-center gap-2 text-purple-700 mb-2">
                                <Icon name="BookOpen" size={16} />
                                <span className="text-xs font-semibold uppercase">Field of Study</span>
                              </div>
                              <div className="font-bold text-gray-900">{campaign.field}</div>
                            </div>
                          )}
                          {campaign.year && (
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                              <div className="flex items-center gap-2 text-orange-700 mb-2">
                                <Icon name="Calendar" size={16} />
                                <span className="text-xs font-semibold uppercase">Academic Year</span>
                              </div>
                              <div className="font-bold text-gray-900">{campaign.year}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Tabs.Content>

              {/* Updates Tab */}
              <Tabs.Content value="updates">
                <div className="space-y-4">
                  {/* Post Update Form (Only for campaign owner) */}
                  {userEmail && (
                    <Card variant="default" padding="lg">
                      <h3 className="font-semibold text-gray-900 mb-4">Post an Update</h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Update title (optional)"
                          value={newUpdate.title}
                          onChange={(e) => setNewUpdate({ ...newUpdate, title: e.target.value })}
                        />
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                          placeholder="Share progress, milestones, or say thanks..."
                          rows={4}
                          value={newUpdate.content}
                          onChange={(e) => setNewUpdate({ ...newUpdate, content: e.target.value })}
                        />
                        <Button
                          onClick={handlePostUpdate}
                          disabled={!newUpdate.content.trim()}
                          iconName="Send"
                          iconPosition="right"
                        >
                          Post Update
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Updates List */}
                  {updates.length > 0 ? (
                    updates.map((update, index) => (
                      <Card key={update.id || index} variant="default" padding="lg">
                        <div className="flex items-start gap-3">
                          <Icon name="Bell" size={20} className="text-primary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            {update.title && (
                              <h4 className="font-semibold text-gray-900 mb-2">{update.title}</h4>
                            )}
                            <p className="text-gray-700 whitespace-pre-line mb-3">{update.content}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Icon name="User" size={14} />
                              <span>{update.postedBy}</span>
                              <span>•</span>
                              <Icon name="Clock" size={14} />
                              <span>{new Date(update.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card variant="default" padding="lg">
                      <div className="text-center py-8">
                        <Icon name="Bell" size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No updates yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Check back later for updates from the organizer
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </Tabs.Content>

              {/* Donor Wall Tab */}
              <Tabs.Content value="donor-wall">
                <DonorWall campaignId={campaign.id} />
              </Tabs.Content>

              {/* Donors Tab */}
              <Tabs.Content value="donors">
                {donations.length > 0 ? (
                  <div className="space-y-3">
                    {donations.map((donation, index) => (
                      <Card key={donation.id || index} variant="default" padding="md">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={donation.avatar}
                            alt={donation.name}
                            size="md"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-gray-900">{donation.name}</h4>
                              <span className="text-lg font-bold text-primary">
                                {formatCurrency(donation.amount)}
                              </span>
                            </div>
                            {donation.message && (
                              <p className="text-sm text-gray-700 mb-2 italic">"{donation.message}"</p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Icon name="Clock" size={12} />
                                <span>{new Date(donation.createdAt).toLocaleDateString()}</span>
                                {donation.isAnonymous && (
                                  <>
                                    <span>•</span>
                                    <Icon name="EyeOff" size={12} />
                                    <span>Anonymous</span>
                                  </>
                                )}
                              </div>
                              {userEmail && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDonation(donation);
                                    setShowThankYouModal(true);
                                  }}
                                  iconName="Heart"
                                  iconPosition="left"
                                >
                                  Say Thanks
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card variant="default" padding="lg">
                    <div className="text-center py-8">
                      <Icon name="Users" size={48} className="text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No donations yet</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Be the first to support this campaign
                      </p>
                    </div>
                  </Card>
                )}
              </Tabs.Content>

              {/* Comments Tab */}
              <Tabs.Content value="comments">
                <div className="space-y-4">
                  {/* Post Comment Form */}
                  <Card variant="default" padding="lg">
                    <h3 className="font-semibold text-gray-900 mb-4">Leave a Comment</h3>
                    <div className="space-y-3">
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        placeholder="Share your thoughts, encouragement, or questions..."
                        rows={3}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <Button
                        onClick={handlePostComment}
                        disabled={!newComment.trim()}
                        iconName="Send"
                        iconPosition="right"
                      >
                        Post Comment
                      </Button>
                    </div>
                  </Card>

                  {/* Comments List */}
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <Card key={comment.id || index} variant="default" padding="lg">
                        <div className="flex items-start gap-3">
                          <Avatar
                            src=""
                            alt={comment.authorName}
                            size="md"
                          />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{comment.authorName}</h4>
                            <p className="text-gray-700 whitespace-pre-line mb-2">{comment.content}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Icon name="Clock" size={12} />
                              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <Card variant="default" padding="lg">
                      <div className="text-center py-8">
                        <Icon name="MessageCircle" size={48} className="text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No comments yet</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Be the first to share your thoughts
                        </p>
                      </div>
                    </Card>
                  )}
                </div>
              </Tabs.Content>
            </Tabs>
          </div>

          {/* Right Column - Donation Panel (Sticky) - UPGRADED */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Main Donation Card - Premium Design */}
              <Card variant="elevated" className="overflow-hidden border-2 border-gray-100 shadow-2xl">
                {/* Gradient Header */}
                <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white">
                  <div className="mb-4">
                    <div className="text-5xl font-extrabold mb-2">
                      {formatCurrency(campaign.currentAmount)}
                    </div>
                    <div className="text-lg text-white/90 font-medium">
                      raised of {formatCurrency(campaign.goalAmount)} goal
                    </div>
                  </div>

                  {/* Progress Bar - Modern Style */}
                  <div className="relative h-4 bg-white/20 backdrop-blur-sm rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-white via-yellow-200 to-white rounded-full transition-all duration-500 shadow-lg"
                      style={{ width: `${Math.min((campaign.currentAmount / campaign.goalAmount) * 100, 100)}%` }}
                    />
                  </div>

                  {/* Percentage Badge */}
                  <div className="flex items-center justify-between text-white/90 text-sm font-semibold">
                    <span>{Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% funded</span>
                    <span>{100 - Math.round((campaign.currentAmount / campaign.goalAmount) * 100)}% to go</span>
                  </div>
                </div>

                {/* Stats Section - Enhanced */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                          <Icon name="Users" size={20} color="white" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900">{donations.length}</div>
                      <div className="text-sm text-gray-600 font-medium">Donors</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border-2 border-orange-100">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
                          <Icon name="Clock" size={20} color="white" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-gray-900">{campaign.daysLeft || 30}</div>
                      <div className="text-sm text-gray-600 font-medium">Days left</div>
                    </div>
                  </div>

                  {/* Action Buttons - Gorgeous Design */}
                  <div className="space-y-3">
                    {/* Donate Button - Primary CTA */}
                    <Button
                      variant="default"
                      size="lg"
                      fullWidth
                      onClick={() => setShowDonationModal(true)}
                      className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl py-6 text-lg font-bold"
                      iconName="Heart"
                      iconPosition="left"
                    >
                      Donate Now
                    </Button>

                    {/* Favorite Button */}
                    <FavoriteButton
                      campaignId={campaign.id}
                      userId={localStorage.getItem('user-id')}
                      variant="button"
                      size="md"
                      fullWidth
                    />

                    {/* Share Button */}
                    <Button
                      variant="outline"
                      size="lg"
                      fullWidth
                      onClick={() => setShowShareModal(true)}
                      iconName="Share2"
                      iconPosition="left"
                      className="rounded-2xl border-2 hover:bg-gray-50 hover:scale-105 transition-all duration-300"
                    >
                      Share Campaign
                    </Button>
                  </div>

                  {/* Recent Donor Preview */}
                  {donations.length > 0 && (
                    <div className="mt-6 pt-6 border-t-2 border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="TrendingUp" size={18} className="text-primary" />
                        <span className="text-sm font-semibold text-gray-900">Recent Support</span>
                      </div>
                      <div className="space-y-2">
                        {donations.slice(0, 3).map((donation, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                              {donation.donor_name?.charAt(0) || '?'}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{donation.donor_name || 'Anonymous'}</div>
                            </div>
                            <div className="font-bold text-primary">{formatCurrency(donation.amount)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Share Campaign Section */}
              <Card variant="elevated" padding="lg" className="mb-4">
                <ShareButtons
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  campaignUrl={window.location.href}
                />
              </Card>

              {/* Donor Wall */}
              <DonorWall campaignId={campaign.id} />

              {/* Trust & Safety - Enhanced */}
              <Card variant="elevated" className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Icon name="Shield" size={24} color="white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2 text-lg">EduFund Guarantee</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        Your donation is 100% protected. If something isn't right, we'll work with you to determine if misuse occurred.
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-white/80 px-3 py-1.5 rounded-full">
                          <Icon name="CheckCircle" size={12} />
                          <span>Verified</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-white/80 px-3 py-1.5 rounded-full">
                          <Icon name="Lock" size={12} />
                          <span>Secure</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-white/80 px-3 py-1.5 rounded-full">
                          <Icon name="Heart" size={12} />
                          <span>Trusted</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Campaigns Section */}
      {similarCampaigns.length > 0 && (
        <div className="bg-gradient-to-br from-gray-50 to-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-6 py-3 rounded-full mb-4">
                <Icon name="Sparkles" size={20} className="text-primary" />
                <span className="font-semibold text-primary">Discover More</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                Similar Campaigns
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Support other students pursuing their educational dreams
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarCampaigns.map((camp) => {
                const campPercentage = Math.min((camp.current_amount / camp.goal_amount) * 100, 100);
                return (
                  <Card
                    key={camp.id}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-gray-100"
                    onClick={() => navigate(`/campaign-details/${camp.id}`)}
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-gray-100">
                      <Image
                        src={camp.cover_image}
                        alt={camp.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      {camp.verification_status === 'verified' && (
                        <Badge variant="success" className="absolute top-3 left-3 shadow-lg">
                          <Icon name="CheckCircle" size={14} className="mr-1" />
                          Verified
                        </Badge>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Category & Location */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                        {camp.category && (
                          <span className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full font-semibold">
                            <Icon name="Tag" size={12} />
                            {camp.category}
                          </span>
                        )}
                        {camp.city && (
                          <span className="flex items-center gap-1">
                            <Icon name="MapPin" size={12} />
                            {camp.city}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {camp.title}
                      </h3>

                      {/* Student Name */}
                      {camp.student_name && (
                        <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                          <Icon name="User" size={14} />
                          by {camp.student_name}
                        </p>
                      )}

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${campPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">
                            {formatCurrency(camp.current_amount)}
                          </div>
                          <div className="text-sm text-gray-600">
                            of {formatCurrency(camp.goal_amount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {Math.round(campPercentage)}%
                          </div>
                          <div className="text-xs text-gray-600">
                            funded
                          </div>
                        </div>
                      </div>

                      {/* View Campaign Button */}
                      <div className="mt-6">
                        <Button
                          variant="outline"
                          size="md"
                          fullWidth
                          iconName="ArrowRight"
                          iconPosition="right"
                          className="group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all rounded-xl"
                        >
                          View Campaign
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* View All Button */}
            <div className="text-center mt-12">
              <Button
                onClick={() => navigate('/discover')}
                size="lg"
                iconName="ArrowRight"
                iconPosition="right"
                className="rounded-full bg-gradient-to-r from-primary to-teal-600 hover:shadow-2xl hover:scale-105 transition-all"
              >
                View All Campaigns
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Donation Modal */}
      <DonationModal
        isOpen={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        campaign={campaign}
      />

      {/* Social Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Share this campaign"
        size="sm"
      >
        <Modal.Body>
          <p className="text-gray-600 mb-6">
            Help spread the word about {campaign?.title}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleShare('facebook')}
              className="justify-start"
              iconName="Facebook"
              iconPosition="left"
            >
              Facebook
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('twitter')}
              className="justify-start"
              iconName="Twitter"
              iconPosition="left"
            >
              Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('whatsapp')}
              className="justify-start"
              iconName="MessageCircle"
              iconPosition="left"
            >
              WhatsApp
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('linkedin')}
              className="justify-start"
              iconName="Linkedin"
              iconPosition="left"
            >
              LinkedIn
            </Button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Or copy link</p>
            <div className="flex gap-2">
              <Input
                value={window.location.href}
                readOnly
                className="flex-1"
              />
              <Button
                variant={copied ? 'success' : 'default'}
                onClick={() => handleShare('copy')}
                iconName={copied ? 'Check' : 'Copy'}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Thank You Modal */}
      <Modal
        isOpen={showThankYouModal}
        onClose={() => {
          setShowThankYouModal(false);
          setSelectedDonation(null);
          setThankYouMessage('');
        }}
        title="Send Thank You Message"
        size="sm"
      >
        <Modal.Body>
          {selectedDonation && (
            <>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Sending to:</p>
                <p className="font-semibold text-gray-900">{selectedDonation.name}</p>
                <p className="text-sm text-primary">
                  Donated {formatCurrency(selectedDonation.amount)}
                </p>
              </div>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Write a personal thank you message..."
                rows={5}
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline"
            onClick={() => {
              setShowThankYouModal(false);
              setSelectedDonation(null);
              setThankYouMessage('');
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendThankYou}
            disabled={!thankYouMessage.trim()}
            iconName="Send"
            iconPosition="right"
          >
            Send Message
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Milestone Celebration - DISABLED to prevent 429 errors */}
      {/*
      {campaign && (
        <MilestoneCelebration
          campaign={campaign}
          onClose={() => setShowMilestoneCelebration(false)}
        />
      )}
      */}
    </div>
  );
};

export default CampaignDetails;
