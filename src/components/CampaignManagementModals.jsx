import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import Select from './ui/Select';
import { formatCurrency } from '../utils/currency';
import toast from '../utils/toast';

// Edit Campaign Modal
export const EditCampaignModal = ({ isOpen, onClose, campaign, onSave }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [formData, setFormData] = useState({
    title: campaign?.title || '',
    description: campaign?.description || '',
    goalAmount: campaign?.goalAmount || '',
    category: campaign?.category || '',
    city: campaign?.city || '',
    university: campaign?.university || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaign.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          goalAmount: Number(formData.goalAmount),
          category: formData.category,
          city: formData.city,
          university: formData.university,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Campaign updated successfully');
        onSave();
        onClose();
      } else {
        toast.error('Failed to update campaign');
      }
    } catch (err) {
      console.error('Error updating campaign:', err);
      toast.error('Failed to update campaign');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Campaign" size="lg">
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter campaign title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Tell your story..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Goal Amount (MAD)</label>
              <Input
                type="number"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                placeholder="100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select category</option>
                <option value="Medical">Medical</option>
                <option value="Education">Education</option>
                <option value="Emergency">Emergency</option>
                <option value="Community">Community</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <Input
                value={formData.university}
                onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                placeholder="University name"
              />
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !formData.title || !formData.goalAmount}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Offline Donation Modal
export const OfflineDonationModal = ({ isOpen, onClose, campaignId, onSuccess }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [formData, setFormData] = useState({
    donorName: '',
    amount: '',
    paymentMethod: 'cash',
    notes: '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/offline-donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donorName: formData.donorName,
          amount: Number(formData.amount),
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Offline donation recorded successfully');
        setFormData({ donorName: '', amount: '', paymentMethod: 'cash', notes: '' });
        onSuccess();
        onClose();
      } else {
        toast.error('Failed to record donation');
      }
    } catch (err) {
      console.error('Error recording donation:', err);
      toast.error('Failed to record donation');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Offline Donation" size="md">
      <Modal.Body>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
            <Input
              value={formData.donorName}
              onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (MAD)</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            >
              <option value="cash">Cash</option>
              <option value="check">Check</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving || !formData.donorName || !formData.amount}>
          {saving ? 'Recording...' : 'Record Donation'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Team Management Modal
export const TeamManagementModal = ({ isOpen, onClose, campaignId }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: '', name: '', role: 'member' });
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen && campaignId) {
      fetchTeamMembers();
    }
  }, [isOpen, campaignId]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/team`);
      const data = await response.json();
      if (data.success) {
        setTeamMembers(data.teamMembers || []);
      }
    } catch (err) {
      console.error('Error fetching team members:', err);
    }
  };

  const handleInvite = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteForm.email,
          name: inviteForm.name,
          role: inviteForm.role,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Team member invited successfully');
        setInviteForm({ email: '', name: '', role: 'member' });
        fetchTeamMembers();
      } else {
        toast.error('Failed to invite team member');
      }
    } catch (err) {
      console.error('Error inviting team member:', err);
      toast.error('Failed to invite team member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/team/${memberId}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        fetchTeamMembers();
      }
    } catch (err) {
      console.error('Error removing team member:', err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Manage Team" size="lg">
      <Modal.Body>
        <div className="space-y-6">
          {/* Invite Form */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Invite Team Member</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input
                placeholder="Email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              />
              <Input
                placeholder="Name"
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <select
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              >
                <option value="member">Member</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                onClick={handleInvite}
                disabled={!inviteForm.email || loading}
                iconName="UserPlus"
                iconPosition="left"
              >
                Invite
              </Button>
            </div>
          </div>

          {/* Team List */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Team Members ({teamMembers.length})</h4>
            {teamMembers.length > 0 ? (
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{member.name || member.email}</p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <span className="text-xs text-gray-500">
                        {member.role} • {member.status}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemove(member.id)}
                      iconName="Trash2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No team members yet</p>
            )}
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

// Withdrawal Request Modal
export const WithdrawalModal = ({ isOpen, onClose, campaignId, availableAmount, onSuccess }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (Number(amount) > availableAmount) {
      toast.error('Amount exceeds available balance');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/campaigns/${campaignId}/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          notes,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Withdrawal request submitted successfully');
        setAmount('');
        setNotes('');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Failed to request withdrawal');
      }
    } catch (err) {
      console.error('Error requesting withdrawal:', err);
      toast.error('Failed to request withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Withdrawal" size="md">
      <Modal.Body>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900 font-medium">Available Balance</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(availableAmount)}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Amount (MAD)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              max={availableAmount}
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum: {formatCurrency(availableAmount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Purpose of withdrawal..."
            />
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Withdrawal requests are typically processed within 3-5 business days.
            </p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !amount || Number(amount) <= 0}>
          {loading ? 'Requesting...' : 'Request Withdrawal'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
