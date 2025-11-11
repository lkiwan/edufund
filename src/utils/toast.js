/**
 * Professional Toast Notification System
 * Replaces browser alerts with beautiful toast notifications
 */

import { toast as reactToast } from 'react-toastify';

// Default configuration for all toasts
const defaultConfig = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast utility object
export const toast = {
  success: (message, options = {}) => {
    reactToast.success(message, { ...defaultConfig, ...options });
  },

  error: (message, options = {}) => {
    reactToast.error(message, { ...defaultConfig, ...options });
  },

  info: (message, options = {}) => {
    reactToast.info(message, { ...defaultConfig, ...options });
  },

  warning: (message, options = {}) => {
    reactToast.warning(message, { ...defaultConfig, ...options });
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
};

export default toast;
