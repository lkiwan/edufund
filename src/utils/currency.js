/**
 * Currency Utility Functions
 * Handles currency formatting for the EduFund platform
 * Default currency: MAD (Moroccan Dirham)
 */

/**
 * Format amount to MAD currency
 * @param {number|string} amount - Amount to format
 * @param {boolean} showCurrency - Whether to show currency symbol (default: true)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, showCurrency = true) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return showCurrency ? 'MAD 0' : '0';

  const formatted = numAmount.toLocaleString('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return showCurrency ? `${formatted} MAD` : formatted;
};

/**
 * Format amount to MAD currency (short version - DH)
 * @param {number|string} amount - Amount to format
 * @returns {string} Formatted currency string with DH symbol
 */
export const formatCurrencyShort = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '0 DH';

  const formatted = numAmount.toLocaleString('fr-MA', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return `${formatted} DH`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - Currency string to parse
 * @returns {number} Numeric value
 */
export const parseCurrency = (currencyString) => {
  if (typeof currencyString === 'number') return currencyString;

  const cleaned = currencyString.toString().replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
};

/**
 * Format currency for input fields
 * @param {number|string} amount - Amount to format
 * @returns {string} Plain number string
 */
export const formatCurrencyInput = (amount) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return isNaN(numAmount) ? '' : numAmount.toString();
};

export default formatCurrency;
