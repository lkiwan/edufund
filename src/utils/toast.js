/**
 * Professional Toast Notification System
 * Replaces browser alerts with beautiful toast notifications
 */

import { toast as reactToast } from 'react-toastify';

// Default configuration for all toasts
const defaultConfig = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light",
};

// Toast utility object
export const toast = {
  success: (message, options = {}) => {
    reactToast.success(message, {
      ...defaultConfig,
      autoClose: 3000,
      ...options,
      className: 'toast-success',
    });
  },

  error: (message, options = {}) => {
    reactToast.error(message, {
      ...defaultConfig,
      autoClose: 5000,
      ...options,
      className: 'toast-error',
    });
  },

  info: (message, options = {}) => {
    reactToast.info(message, {
      ...defaultConfig,
      ...options,
      className: 'toast-info',
    });
  },

  warning: (message, options = {}) => {
    reactToast.warning(message, {
      ...defaultConfig,
      autoClose: 4500,
      ...options,
      className: 'toast-warning',
    });
  },

  promise: (promise, messages) => {
    return reactToast.promise(
      promise,
      {
        pending: messages.pending || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'An error occurred',
      },
      defaultConfig
    );
  },

  // Custom toast for campaigns
  campaign: (message, options = {}) => {
    reactToast.success(message, {
      ...defaultConfig,
      autoClose: 5000,
      ...options,
      icon: '🎓',
    });
  },

  // Custom toast for donations
  donation: (message, options = {}) => {
    reactToast.success(message, {
      ...defaultConfig,
      autoClose: 5000,
      ...options,
      icon: '💙',
    });
  },

  // Dismiss all toasts
  dismiss: () => {
    reactToast.dismiss();
  },

  // Dismiss specific toast
  dismissById: (id) => {
    reactToast.dismiss(id);
  },
};

export default toast;
