/**
 * Currency Conversion Service
 *
 * Integrates with OpenExchangeRates API for real-time currency conversion
 *
 * Setup:
 * 1. Sign up for free API key at https://openexchangerates.org/signup/free
 * 2. Add OPENEXCHANGERATES_API_KEY to your .env file
 * 3. Free tier includes 1,000 requests/month with USD base currency
 */

const axios = require('axios');
require('dotenv').config();

const OPENEXCHANGERATES_API_KEY = process.env.OPENEXCHANGERATES_API_KEY;
const OPENEXCHANGERATES_API_URL = 'https://openexchangerates.org/api/latest.json';

// Fallback rates (used if API fails or key not configured)
const FALLBACK_RATES = {
  USD: 1,
  MAD: 10.0,  // 1 USD ≈ 10 MAD
  EUR: 0.92,  // 1 USD ≈ 0.92 EUR
};

// Cache for exchange rates (refreshed hourly)
let cachedRates = null;
let lastFetchTime = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

/**
 * Fetch latest exchange rates from OpenExchangeRates API
 * Returns rates with USD as base currency
 */
async function fetchExchangeRates() {
  try {
    // Check if we have valid cached rates
    if (cachedRates && lastFetchTime && (Date.now() - lastFetchTime < CACHE_DURATION)) {
      console.log('Using cached exchange rates');
      return cachedRates;
    }

    // Check if API key is configured
    if (!OPENEXCHANGERATES_API_KEY) {
      console.warn('OpenExchangeRates API key not configured. Using fallback rates.');
      console.warn('To enable live rates, add OPENEXCHANGERATES_API_KEY to .env file');
      return FALLBACK_RATES;
    }

    console.log('Fetching latest exchange rates from OpenExchangeRates...');
    const response = await axios.get(OPENEXCHANGERATES_API_URL, {
      params: {
        app_id: OPENEXCHANGERATES_API_KEY,
        base: 'USD',
        symbols: 'MAD,EUR,GBP,CAD,AUD,JPY,CHF',
      },
      timeout: 5000,
    });

    if (response.data && response.data.rates) {
      // Add USD to the rates (as base currency, it's always 1)
      const rates = {
        USD: 1,
        ...response.data.rates,
      };

      // Cache the rates
      cachedRates = rates;
      lastFetchTime = Date.now();

      console.log('Exchange rates updated successfully');
      console.log('Rates:', rates);

      return rates;
    } else {
      throw new Error('Invalid API response');
    }
  } catch (err) {
    console.error('Error fetching exchange rates:', err.message);
    console.log('Falling back to default rates');
    return FALLBACK_RATES;
  }
}

/**
 * Convert amount from one currency to another
 * @param {number} amount - Amount to convert
 * @param {string} from - Source currency code (e.g., 'MAD')
 * @param {string} to - Target currency code (e.g., 'USD')
 * @returns {Object} Conversion result with original, converted amounts and rate
 */
async function convertCurrency(amount, from = 'MAD', to = 'USD') {
  try {
    const rates = await fetchExchangeRates();

    // Get rates relative to USD
    const fromRate = rates[from] || 1;
    const toRate = rates[to] || 1;

    // Convert via USD as intermediary
    // amount (in FROM currency) -> USD -> TO currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;

    const exchangeRate = toRate / fromRate;

    return {
      success: true,
      original: {
        amount: Number(amount),
        currency: from,
      },
      converted: {
        amount: Number(convertedAmount.toFixed(2)),
        currency: to,
      },
      exchangeRate: Number(exchangeRate.toFixed(6)),
      timestamp: new Date().toISOString(),
      source: cachedRates === FALLBACK_RATES ? 'fallback' : 'openexchangerates',
    };
  } catch (err) {
    console.error('Currency conversion error:', err);
    throw err;
  }
}

/**
 * Convert MAD to multiple currencies at once (useful for receipts)
 * @param {number} amountMAD - Amount in Moroccan Dirham
 * @returns {Object} Conversions to USD, EUR, and other currencies
 */
async function convertMADToMultiple(amountMAD) {
  try {
    const [usdResult, eurResult] = await Promise.all([
      convertCurrency(amountMAD, 'MAD', 'USD'),
      convertCurrency(amountMAD, 'MAD', 'EUR'),
    ]);

    return {
      success: true,
      MAD: amountMAD,
      USD: usdResult.converted.amount,
      EUR: eurResult.converted.amount,
      rates: {
        MAD_USD: usdResult.exchangeRate,
        MAD_EUR: eurResult.exchangeRate,
      },
      timestamp: new Date().toISOString(),
      source: cachedRates === FALLBACK_RATES ? 'fallback' : 'openexchangerates',
    };
  } catch (err) {
    console.error('Multi-currency conversion error:', err);
    throw err;
  }
}

/**
 * Get all available exchange rates
 * @returns {Object} All exchange rates with USD as base
 */
async function getAllRates() {
  try {
    const rates = await fetchExchangeRates();
    return {
      success: true,
      base: 'USD',
      rates,
      timestamp: new Date().toISOString(),
      source: cachedRates === FALLBACK_RATES ? 'fallback' : 'openexchangerates',
    };
  } catch (err) {
    console.error('Get all rates error:', err);
    throw err;
  }
}

module.exports = {
  convertCurrency,
  convertMADToMultiple,
  getAllRates,
  fetchExchangeRates,
};
