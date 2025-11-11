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
  const userEmail = localStorage.getItem('user-email');

  useEffect(() => {
    if (id) {
      fetchCampaign();
      fetchUpdates();
      fetchDonations();
      fetchComments();
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
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Image */}
      <div className="pt-16">
        <div className="w-full h-96 bg-gray-100 overflow-hidden">
          <Image
            src={campaign.coverImage}
            alt={campaign.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Campaign Info */}
          <div className="lg:col-span-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <button onClick={() => navigate('/')} className="hover:text-primary">Home</button>
              <Icon name="ChevronRight" size={16} />
              <button onClick={() => navigate('/discover')} className="hover:text-primary">Campaigns</button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-gray-900">{campaign.category}</span>
            </div>

            {/* Title & Info */}
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              {campaign.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {campaign.verificationStatus === 'verified' && (
                <Badge variant="success">
                  <Icon name="CheckCircle" size={14} className="mr-1" />
                  Verified Campaign
                </Badge>
              )}
              {campaign.category && (
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="Tag" size={16} className="mr-1" />
                  {campaign.category}
                </div>
              )}
              {campaign.city && (
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="MapPin" size={16} className="mr-1" />
                  {campaign.city}
                </div>
              )}
            </div>

            {/* Organizer Info */}
            <Card variant="outline" padding="sm" className="mb-6">
              <div className="flex items-center gap-3">
                <Avatar
                  src={campaign.studentAvatar}
                  alt={campaign.studentName || 'Student'}
                  size="lg"
                />
                <div>
                  <p className="text-sm text-gray-600">Organized by</p>
                  <h3 className="font-semibold text-gray-900">{campaign.studentName}</h3>
                  {campaign.university && (
                    <p className="text-sm text-gray-600">{campaign.university}</p>
                  )}
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

              {/* Story Tab */}
              <Tabs.Content value="story">
                <Card variant="default" padding="lg">
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {campaign.description}
                    </p>
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

          {/* Right Column - Donation Panel (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <Card variant="elevated" padding="lg" className="mb-4">
                {/* Amount Raised */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {formatCurrency(campaign.currentAmount)}
                  </div>
                  <div className="text-sm text-gray-600">
                    raised of {formatCurrency(campaign.goalAmount)} goal
                  </div>
                </div>

                {/* Progress Bar with Milestones */}
                <Progress
                  value={campaign.currentAmount}
                  max={campaign.goalAmount}
                  size="lg"
                  showMilestones={true}
                  className="mb-4"
                />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <div className="text-lg font-bold text-gray-900">{donations.length}</div>
                    <div className="text-sm text-gray-600">Donors</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{campaign.daysLeft || 30}</div>
                    <div className="text-sm text-gray-600">Days left</div>
                  </div>
                </div>

                {/* Donate Button */}
                <Button
                  variant="default"
                  size="lg"
                  fullWidth
                  onClick={() => setShowDonationModal(true)}
                  className="rounded-full mb-3"
                  iconName="Heart"
                  iconPosition="left"
                >
                  Donate Now
                </Button>

                {/* Favorite Button */}
                <div className="mb-3">
                  <FavoriteButton
                    campaignId={campaign.id}
                    userId={localStorage.getItem('user-id')}
                    variant="button"
                    size="md"
                    fullWidth
                  />
                </div>

                {/* Share Button */}
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setShowShareModal(true)}
                  iconName="Share2"
                  iconPosition="left"
                  className="rounded-full"
                >
                  Share Campaign
                </Button>
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

              {/* Trust & Safety */}
              <Card variant="outline" padding="sm">
                <div className="flex items-start gap-2 text-sm">
                  <Icon name="Shield" size={18} className="text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">EduFund Guarantee</p>
                    <p className="text-xs text-gray-600">
                      Your donation is protected. If something isn't right, we'll work with you to determine if misuse occurred.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

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
