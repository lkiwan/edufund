import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Icon from '../components/AppIcon';
import api from '../services/api';
import { formatCurrency } from '../utils/currency';
import LocationAutocomplete from '../components/ui/LocationAutocomplete';
import UniversityAutocomplete from '../components/ui/UniversityAutocomplete';

const CreateCampaign = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal: '',
    category: '',
    city: '',
    university: '',
    studentName: '',
    field: '',
    year: '',
    coverImage: ''
  });

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    // Check authentication
    const authToken = localStorage.getItem('auth-token');
    const userRole = localStorage.getItem('user-role');

    if (!authToken) {
      navigate('/login');
      return;
    }

    if (userRole !== 'student') {
      navigate('/');
      return;
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, coverImage: '' }));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    setError('');
  };

  // Auto-save effect (simulated - saves to localStorage)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title || formData.description) {
        localStorage.setItem('campaign-draft', JSON.stringify(formData));
        setLastSaved(new Date());
      }
    }, 2000); // Save after 2 seconds of no changes

    return () => clearTimeout(timer);
  }, [formData]);

  const validateStep1 = () => {
    if (!formData.title || formData.title.length < 10) {
      setError('Title must be at least 10 characters');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.goal || formData.goal < 1000) {
      setError('Goal amount must be at least 1,000 MAD');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.description || formData.description.length < 100) {
      setError('Story must be at least 100 characters');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.studentName) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.university) {
      setError('Please enter your university');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');

    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userEmail = localStorage.getItem('user-email');
      let coverImageUrl = formData.coverImage || 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800';

      // Upload image if a file was selected
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResponse = await api.upload.campaignImage(imageFile);
          if (uploadResponse.success) {
            coverImageUrl = uploadResponse.url;
          }
        } catch (uploadErr) {
          console.error('Image upload error:', uploadErr);
          setError('Failed to upload image. Please try again.');
          setLoading(false);
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      // Get user ID from email
      // For now, we'll use a placeholder. In production, you'd fetch this from the backend
      const userId = 2; // Placeholder student user ID

      const campaignData = {
        title: formData.title,
        description: formData.description,
        goal: Number(formData.goal),
        category: formData.category,
        location: formData.city,
        university: formData.university,
        userId: userId,
        featured: false,
        images: {
          coverName: coverImageUrl
        }
      };

      const response = await api.campaigns.create(campaignData);

      if (response.success) {
        // Navigate to student dashboard
        navigate('/student-dashboard', {
          state: { message: 'Campaign created successfully!' }
        });
      } else {
        setError(response.error || 'Failed to create campaign');
      }
    } catch (err) {
      console.error('Campaign creation error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'Medical', label: 'Medical' },
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Law', label: 'Law' },
    { value: 'Business', label: 'Business' },
    { value: 'Science', label: 'Science' },
    { value: 'Education', label: 'Education' },
    { value: 'Architecture', label: 'Architecture' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Other', label: 'Other' }
  ];

  const yearOptions = [
    { value: 'Freshman', label: 'Freshman (Year 1)' },
    { value: 'Sophomore', label: 'Sophomore (Year 2)' },
    { value: 'Junior', label: 'Junior (Year 3)' },
    { value: 'Senior', label: 'Senior (Year 4)' },
    { value: 'Graduate', label: 'Graduate Student' },
    { value: 'PhD', label: 'PhD Candidate' }
  ];

  const steps = [
    { number: 1, title: 'Basic Info', icon: 'Info' },
    { number: 2, title: 'Your Story', icon: 'FileText' },
    { number: 3, title: 'About You', icon: 'User' },
    { number: 4, title: 'Review', icon: 'CheckCircle' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
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

          <div className="flex items-center gap-4">
            {lastSaved && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Icon name="CheckCircle" size={16} className="text-green-500" />
                <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
              </div>
            )}
            <Button
              variant="ghost"
              onClick={() => navigate('/student-dashboard')}
              iconName="X"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.number}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      currentStep >= step.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.number ? (
                      <Icon name="Check" size={24} />
                    ) : (
                      <Icon name={step.icon} size={24} />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.number ? 'text-primary' : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 mb-6 bg-gray-200 rounded">
                    <div
                      className={`h-full rounded transition-all ${
                        currentStep > step.number ? 'bg-primary' : 'bg-gray-200'
                      }`}
                      style={{ width: currentStep > step.number ? '100%' : '0%' }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card variant="elevated" padding="lg" className="animate-scale-in">
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Campaign Basic Information
                  </h2>
                  <p className="text-gray-600">
                    Let's start with the essentials of your fundraising campaign.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Help Me Complete My Medical Degree"
                    required
                    maxLength={100}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div>
                  <Select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={(value) => handleChange({ target: { name: 'category', value } })}
                    options={categories}
                    placeholder="Select a category"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fundraising Goal (MAD) *
                  </label>
                  <Input
                    type="number"
                    name="goal"
                    value={formData.goal}
                    onChange={handleChange}
                    placeholder="e.g., 350000"
                    required
                    min="1000"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Minimum goal is 1,000 MAD
                  </p>
                </div>

                <LocationAutocomplete
                  value={formData.city}
                  onChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                  placeholder="start typing to find..."
                  label="Ville/Localité"
                  helperText="Commencez à taper pour voir les suggestions de villes et zones rurales"
                />

                {/* Helper Tips */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Icon name="Sparkles" size={20} className="text-purple-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-purple-900 mb-2">
                        💡 Quick Tips for Success
                      </p>
                      <ul className="text-xs text-purple-800 space-y-1">
                        <li>• Titles should be clear and specific about your education goal</li>
                        <li>• Set a realistic goal that covers your actual educational costs</li>
                        <li>• Including your location helps local donors find your campaign</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Your Story */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Tell Your Story
                  </h2>
                  <p className="text-gray-600">
                    Share your background, goals, and why you need support. A compelling story helps donors connect with your journey.
                  </p>
                </div>

                {/* Writing Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg border border-emerald-200">
                    <div className="flex items-start gap-2">
                      <Icon name="Lightbulb" size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-900 mb-1">Start with your "why"</p>
                        <p className="text-xs text-emerald-700">
                          "I'm pursuing medical studies because..."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-2">
                      <Icon name="Target" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">Share your dream</p>
                        <p className="text-xs text-blue-700">
                          "After graduation, I want to..."
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Your Story *
                    </label>
                    <span className={`text-xs font-medium ${formData.description.length >= 100 ? 'text-green-600' : 'text-gray-500'}`}>
                      {formData.description.length}/100 min {formData.description.length >= 100 && '✓'}
                    </span>
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={14}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none font-sans"
                    placeholder="Example: I'm a third-year medical student at Université Hassan II de Casablanca, and I'm writing to ask for your support to complete my final year. Growing up in a small town, I witnessed firsthand the lack of accessible healthcare...

Tell your authentic story. What inspired you? What challenges have you overcome? What will this education enable you to do?"
                    required
                    minLength={100}
                  />
                </div>

                {/* Enhanced Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <Icon name="CheckCircle" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-900 font-semibold">
                        What makes a great story?
                      </p>
                    </div>
                    <ul className="text-xs text-blue-800 space-y-2 ml-7">
                      <li>✓ Personal background and achievements</li>
                      <li>✓ Specific financial need and breakdown</li>
                      <li>✓ Career goals and community impact</li>
                      <li>✓ Authentic voice and personal details</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2 mb-3">
                      <Icon name="AlertCircle" size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-900 font-semibold">
                        Things to include:
                      </p>
                    </div>
                    <ul className="text-xs text-amber-800 space-y-2 ml-7">
                      <li>• Your current situation and progress</li>
                      <li>• Why this specific amount is needed</li>
                      <li>• Timeline for your education</li>
                      <li>• How you'll use the support</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: About You */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    About You
                  </h2>
                  <p className="text-gray-600">
                    Help donors get to know you better.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Full Name *
                  </label>
                  <Input
                    type="text"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleChange}
                    placeholder="e.g., Sarah Johnson"
                    required
                  />
                </div>

                <UniversityAutocomplete
                  value={formData.university}
                  onChange={(value) => setFormData(prev => ({ ...prev, university: value }))}
                  placeholder="start typing to find..."
                  label="Université/Institution"
                  helperText="Commencez à taper pour voir les suggestions d'universités marocaines"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Field of Study
                  </label>
                  <Input
                    type="text"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    placeholder="e.g., Medical Sciences"
                  />
                </div>

                <div>
                  <Select
                    label="Year/Level"
                    name="year"
                    value={formData.year}
                    onChange={(value) => handleChange({ target: { name: 'year', value } })}
                    options={yearOptions}
                    placeholder="Select year"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image (optional)
                  </label>

                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative mb-4">
                      <img
                        src={imagePreview}
                        alt="Campaign cover preview"
                        className="w-full h-64 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <Icon name="X" size={20} />
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                        isDragging
                          ? 'border-primary bg-primary/5 scale-105'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        id="image-upload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Icon
                          name="Upload"
                          size={48}
                          className={`mb-4 transition-colors ${
                            isDragging ? 'text-primary' : 'text-gray-400'
                          }`}
                        />
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </label>
                    </div>
                  )}

                  <p className="mt-2 text-xs text-gray-500">
                    A professional photo helps donors connect with your campaign
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                    Review Your Campaign
                  </h2>
                  <p className="text-gray-600">
                    Make sure everything looks good before submitting.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {formData.title}</p>
                      <p><span className="font-medium">Category:</span> {formData.category}</p>
                      <p><span className="font-medium">Goal:</span> {formatCurrency(Number(formData.goal))}</p>
                      {formData.city && <p><span className="font-medium">Location:</span> {formData.city}</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">Your Story</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formData.description}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2">About You</h3>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Name:</span> {formData.studentName}</p>
                      <p><span className="font-medium">University:</span> {formData.university}</p>
                      {formData.field && <p><span className="font-medium">Field:</span> {formData.field}</p>}
                      {formData.year && <p><span className="font-medium">Year:</span> {formData.year}</p>}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <Icon name="Info" size={16} className="inline mr-1" />
                    Your campaign will be saved as a draft and will require verification before going live.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Back
                </Button>
              )}

              <div className="ml-auto">
                {currentStep < 4 ? (
                  <Button
                    type="button"
                    variant="default"
                    onClick={handleNext}
                    iconName="ChevronRight"
                    iconPosition="right"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="default"
                    loading={loading || uploadingImage}
                    iconName="Check"
                    iconPosition="left"
                  >
                    {uploadingImage ? 'Uploading Image...' : loading ? 'Creating...' : 'Create Campaign'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default CreateCampaign;
