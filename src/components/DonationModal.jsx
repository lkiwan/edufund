import React, { useState } from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import Input from './ui/Input';
import { Checkbox } from './ui/Checkbox';
import Icon from './AppIcon';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';

const DonationModal = ({ isOpen, onClose, campaign }) => {
  const [step, setStep] = useState(1); // 1: Amount, 2: Details, 3: Payment, 4: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get logged-in user's info from localStorage
  const loggedInEmail = localStorage.getItem('user-email') || '';
  const loggedInName = localStorage.getItem('user-name') || '';

  // Form data - Pre-fill with logged-in user info
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [tipPercentage, setTipPercentage] = useState(15);
  const [donorName, setDonorName] = useState(loggedInName);
  const [donorEmail, setDonorEmail] = useState(loggedInEmail);
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [coverFees, setCoverFees] = useState(true);

  const predefinedAmounts = [250, 500, 1000, 2500, 5000, 10000];

  // Update donor info when modal opens
  React.useEffect(() => {
    if (isOpen && !donorName && loggedInName) {
      setDonorName(loggedInName);
    }
    if (isOpen && !donorEmail && loggedInEmail) {
      setDonorEmail(loggedInEmail);
    }
  }, [isOpen, loggedInName, loggedInEmail]);

  const getSelectedAmount = () => {
    return amount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(amount) || 0;
  };

  const calculateTip = () => {
    if (!coverFees) return 0;
    const baseAmount = getSelectedAmount();
    return (baseAmount * tipPercentage) / 100;
  };

  const calculateTotal = () => {
    return getSelectedAmount() + calculateTip();
  };

  const handleAmountSelect = (value) => {
    setAmount(value);
    if (value !== 'custom') {
      setCustomAmount('');
    }
  };

  const handleNextStep = () => {
    setError('');

    if (step === 1) {
      const selectedAmount = getSelectedAmount();
      if (!selectedAmount || selectedAmount < 50) {
        setError('Minimum donation is 50 MAD');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!isAnonymous && !donorName) {
        setError('Please enter your name');
        return;
      }
      if (!isAnonymous && !donorEmail) {
        setError('Please enter your email');
        return;
      }
      if (!isAnonymous && !donorEmail.includes('@')) {
        setError('Please enter a valid email');
        return;
      }
      setStep(3);
    }
  };

  const handleBackStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleDonate = async () => {
    setError('');
    setLoading(true);

    try {
      const donationData = {
        campaignId: campaign.id,
        amount: getSelectedAmount(),
        tipAmount: calculateTip(),
        donorName: isAnonymous ? null : donorName,
        donorEmail: isAnonymous ? null : donorEmail,
        message: message || null,
        isAnonymous: isAnonymous,
        paymentMethod: 'card' // Mock payment
      };

      const response = await api.donations.create(donationData);

      if (response.success) {
        setStep(4);
      } else {
        setError(response.error || 'Donation failed. Please try again.');
      }
    } catch (err) {
      console.error('Donation error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === 4) {
      // Refresh the page to show updated amounts
      window.location.reload();
    }
    setStep(1);
    setAmount('');
    setCustomAmount('');
    // Reset to logged-in user info
    setDonorName(loggedInName);
    setDonorEmail(loggedInEmail);
    setMessage('');
    setIsAnonymous(false);
    setError('');
    onClose();
  };

  if (!campaign) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-heading font-bold text-gray-900">
              {step === 4 ? 'Thank You!' : 'Support This Campaign'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {campaign.title}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Icon name="X" size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        {step < 4 && (
          <div className="flex items-center justify-center mt-6 space-x-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? 'bg-primary w-16' : 'bg-gray-200 w-12'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Amount Selection */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Amount
            </label>
            <div className="grid grid-cols-3 gap-3">
              {predefinedAmounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleAmountSelect(amt.toString())}
                  className={`p-4 border-2 rounded-lg font-semibold transition-all ${
                    amount === amt.toString()
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-300 hover:border-gray-400 text-gray-700'
                  }`}
                >
                  {formatCurrency(amt, false)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              onClick={() => handleAmountSelect('custom')}
              className={`w-full p-4 border-2 rounded-lg font-semibold transition-all ${
                amount === 'custom'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              Custom Amount
            </button>
            {amount === 'custom' && (
              <div className="mt-3">
                <Input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="50"
                  className="text-lg"
                />
              </div>
            )}
          </div>

          {/* Cover Fees */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Checkbox
                checked={coverFees}
                onChange={(e) => setCoverFees(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">
                  Cover platform fees ({tipPercentage}%)
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Help us keep EduFund running by covering the platform fee of {formatCurrency(calculateTip())}.
                  100% of your {formatCurrency(getSelectedAmount())} donation will go to the campaign.
                </p>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Amount:</span>
              <span className="text-2xl text-primary">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>

          <Button
            variant="default"
            size="lg"
            fullWidth
            onClick={handleNextStep}
            disabled={!getSelectedAmount() || getSelectedAmount() < 50}
          >
            Continue
          </Button>
        </div>
      )}

      {/* Step 2: Donor Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
            <Checkbox
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
            <div>
              <p className="font-medium text-gray-900">Donate anonymously</p>
              <p className="text-sm text-gray-600">Your name won't be displayed publicly</p>
            </div>
          </div>

          {!isAnonymous && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <Input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll send your receipt to this email
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Leave a Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
              placeholder="Write a message of support for the student..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleNextStep}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment (Mock) */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-br from-primary/10 to-emerald-50 rounded-lg border border-primary/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Donation Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Donation Amount:</span>
                <span className="font-semibold">{formatCurrency(getSelectedAmount())}</span>
              </div>
              {coverFees && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform Fee ({tipPercentage}%):</span>
                  <span className="font-semibold">{formatCurrency(calculateTip())}</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-300 flex justify-between text-lg">
                <span className="font-bold">Total:</span>
                <span className="font-bold text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Demo Mode</p>
                <p>
                  This is a demonstration. No actual payment will be processed.
                  In production, this would integrate with Stripe or PayPal.
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              size="lg"
              onClick={handleBackStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={handleDonate}
              loading={loading}
              className="flex-1"
              iconName="Heart"
              iconPosition="left"
            >
              Complete Donation
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <Icon name="CheckCircle" size={48} className="text-green-600" />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Thank You for Your Generosity!
            </h3>
            <p className="text-gray-600">
              Your donation of <span className="font-semibold text-primary">{formatCurrency(getSelectedAmount())}</span> has been received.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg text-left">
            <h4 className="font-semibold text-gray-900 mb-2">What happens next?</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Your donation has been added to the campaign</span>
              </li>
              <li className="flex items-start space-x-2">
                <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>A receipt has been sent to your email</span>
              </li>
              <li className="flex items-start space-x-2">
                <Icon name="Check" size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>The student will be notified of your support</span>
              </li>
            </ul>
          </div>

          <Button
            variant="default"
            size="lg"
            fullWidth
            onClick={handleClose}
          >
            Close
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default DonationModal;
