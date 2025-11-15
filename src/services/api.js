/**
 * Centralized API Service for EduFund Platform
 * Handles all HTTP requests to the backend (MySQL)
 */

// Use environment variable for API base URL (professional deployment configuration)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Helper function for making API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',  // Bypass ngrok warning page
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Handle non-JSON responses (like HTML error pages)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Request Error [${endpoint}]:`, error);
    throw error;
  }
}

// ==== AUTH API ====

export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (data) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ==== CAMPAIGNS API ====

export const campaignsAPI = {
  list: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/campaigns?${queryString}`);
  },

  getById: (id) => apiRequest(`/campaigns/${id}`),

  create: (campaignData) =>
    apiRequest('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),

  getTrending: (limit = 10) =>
    apiRequest(`/campaigns/trending?limit=${limit}`),

  getRelated: (id, limit = 6) =>
    apiRequest(`/campaigns/${id}/related?limit=${limit}`),

  // Campaign interactions
  incrementView: (id) =>
    apiRequest(`/campaigns/${id}/view`, {
      method: 'POST',
    }),

  incrementShare: (id) =>
    apiRequest(`/campaigns/${id}/share`, {
      method: 'POST',
    }),
};

// ==== STATS API ====

export const statsAPI = {
  homepage: () => apiRequest('/stats/homepage'),
};

// ==== DONATIONS API ====

export const donationsAPI = {
  create: (donationData) =>
    apiRequest('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),

  getByCampaign: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/donations`),

  // Recurring donations
  createRecurring: (recurringData) =>
    apiRequest('/recurring-donations', {
      method: 'POST',
      body: JSON.stringify(recurringData),
    }),

  cancelRecurring: (id) =>
    apiRequest(`/recurring-donations/${id}/cancel`, {
      method: 'POST',
    }),

  getRecurringByUser: (userId) =>
    apiRequest(`/users/${userId}/recurring-donations`),

  // Refunds
  requestRefund: (donationId, reason, requestedBy) =>
    apiRequest(`/donations/${donationId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ reason, requestedBy }),
    }),

  // Thank you messages
  sendThankYou: (donationId, message, sentBy) =>
    apiRequest(`/donations/${donationId}/thank-you`, {
      method: 'POST',
      body: JSON.stringify({ message, sentBy }),
    }),

  getThankYouMessages: (donationId) =>
    apiRequest(`/donations/${donationId}/thank-you`),

  // Receipts
  generateReceipt: (donationId, taxDeductible = false) =>
    apiRequest(`/donations/${donationId}/receipt`, {
      method: 'POST',
      body: JSON.stringify({ taxDeductible }),
    }),

  getReceipt: (donationId) =>
    apiRequest(`/donations/${donationId}/receipt`),

  // Offline donations
  recordOffline: (campaignId, offlineData) =>
    apiRequest(`/campaigns/${campaignId}/offline-donations`, {
      method: 'POST',
      body: JSON.stringify(offlineData),
    }),

  getOfflineDonations: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/offline-donations`),
};

// ==== UPDATES API ====

export const updatesAPI = {
  getByCampaign: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/updates`),

  create: (campaignId, updateData) =>
    apiRequest(`/campaigns/${campaignId}/updates`, {
      method: 'POST',
      body: JSON.stringify(updateData),
    }),
};

// ==== COMMENTS API ====

export const commentsAPI = {
  getByCampaign: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/comments`),

  create: (campaignId, commentData) =>
    apiRequest(`/campaigns/${campaignId}/comments`, {
      method: 'POST',
      body: JSON.stringify(commentData),
    }),
};

// ==== FAVORITES API ====

export const favoritesAPI = {
  add: (campaignId, userId) =>
    apiRequest(`/campaigns/${campaignId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ userId, action: 'add' }),
    }),

  remove: (campaignId, userId) =>
    apiRequest(`/campaigns/${campaignId}/favorite`, {
      method: 'POST',
      body: JSON.stringify({ userId, action: 'remove' }),
    }),

  getByUser: (userId) =>
    apiRequest(`/users/${userId}/favorites`),
};

// ==== TEAM MEMBERS API ====

export const teamAPI = {
  invite: (campaignId, memberData) =>
    apiRequest(`/campaigns/${campaignId}/team`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    }),

  list: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/team`),

  accept: (campaignId, memberId, userId) =>
    apiRequest(`/campaigns/${campaignId}/team/${memberId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  remove: (campaignId, memberId) =>
    apiRequest(`/campaigns/${campaignId}/team/${memberId}`, {
      method: 'DELETE',
    }),
};

// ==== BENEFICIARY API ====

export const beneficiaryAPI = {
  add: (campaignId, beneficiaryData) =>
    apiRequest(`/campaigns/${campaignId}/beneficiary`, {
      method: 'POST',
      body: JSON.stringify(beneficiaryData),
    }),

  get: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/beneficiary`),
};

// ==== BANK ACCOUNTS API ====

export const bankAccountsAPI = {
  add: (userId, accountData) =>
    apiRequest(`/users/${userId}/bank-accounts`, {
      method: 'POST',
      body: JSON.stringify(accountData),
    }),

  list: (userId) =>
    apiRequest(`/users/${userId}/bank-accounts`),

  delete: (userId, accountId) =>
    apiRequest(`/users/${userId}/bank-accounts/${accountId}`, {
      method: 'DELETE',
    }),
};

// ==== WITHDRAWALS API ====

export const withdrawalsAPI = {
  request: (campaignId, withdrawalData) =>
    apiRequest(`/campaigns/${campaignId}/withdrawals`, {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    }),

  list: (campaignId) =>
    apiRequest(`/campaigns/${campaignId}/withdrawals`),

  process: (withdrawalId, status) =>
    apiRequest(`/withdrawals/${withdrawalId}/process`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    }),
};

// ==== VERIFICATION API ====

export const verificationAPI = {
  submit: (campaignId, verificationData) =>
    apiRequest(`/campaigns/${campaignId}/verification`, {
      method: 'POST',
      body: JSON.stringify(verificationData),
    }),

  review: (verificationId, reviewData) =>
    apiRequest(`/verification/${verificationId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    }),

  getPending: () =>
    apiRequest('/verification/pending'),
};

// ==== ANALYTICS API ====

export const analyticsAPI = {
  getCampaign: (campaignId) =>
    apiRequest(`/analytics/campaign/${campaignId}`),

  getStudent: (userId) =>
    apiRequest(`/analytics/student/${userId}`),
};

// ==== NOTIFICATIONS API ====

export const notificationsAPI = {
  queue: (notificationData) =>
    apiRequest('/notifications/email', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    }),

  getPending: () =>
    apiRequest('/notifications/email/pending'),

  markAsSent: (notificationId) =>
    apiRequest(`/notifications/email/${notificationId}/sent`, {
      method: 'POST',
    }),
};

// ==== UPLOAD API ====

export const uploadAPI = {
  campaignImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const url = `${API_BASE_URL}/upload/campaign-image`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },

  campaignImages: async (files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const url = `${API_BASE_URL}/upload/campaign-images`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  },
};

// ==== EMBED API ====

export const embedAPI = {
  getCode: (campaignId, options = {}) => {
    const queryString = new URLSearchParams(options).toString();
    return apiRequest(`/campaigns/${campaignId}/embed?${queryString}`);
  },
};

// ==== ADMIN APIs ====

export const adminAPI = {
  refunds: {
    process: (refundId, status) =>
      apiRequest(`/refunds/${refundId}/process`, {
        method: 'POST',
        body: JSON.stringify({ status }),
      }),
  },
};

// Export a default object with all APIs
const api = {
  auth: authAPI,
  campaigns: campaignsAPI,
  donations: donationsAPI,
  updates: updatesAPI,
  comments: commentsAPI,
  favorites: favoritesAPI,
  team: teamAPI,
  beneficiary: beneficiaryAPI,
  bankAccounts: bankAccountsAPI,
  withdrawals: withdrawalsAPI,
  verification: verificationAPI,
  analytics: analyticsAPI,
  notifications: notificationsAPI,
  upload: uploadAPI,
  embed: embedAPI,
  stats: statsAPI,
  admin: adminAPI,
};

export default api;
