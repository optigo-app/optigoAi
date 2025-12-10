// Get the current hostname if running in browser
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';

// Determine the appropriate API URL based on hostname
export const API_BASE_URL = (() => {
  if (hostname === 'nzen') {
    return process.env.NEXT_NZEN_URL || '';
  }
  if (hostname === 'localhost') {
    return process.env.NEXT_LOC_DEV_API_URL || 'http://localhost:5050';
  }
  if (hostname === 'optigoai.web') {
    return process.env.NEXT_NZEN_URL || 'http://apioptigoai.web';
  }
  return process.env.NEXT_PUBLIC_API_LIVE_URL || '';
})();

export const API_ENDPOINTS = {
  search: {
    image: '/api/search/image',
    text: '/api/search/text',
    hybrid: '/api/search/hybrid',
    keyword: '/api/search/keyword',
  },
};

export const DEFAULT_SEARCH_PARAMS = {
  image: {
    top_k: 8,
    min_percent: 80.0,
  },
  text: {
    top_k: 8,
    min_percent: 50.0,
  },
  hybrid: {
    top_k: 10,
    min_percent: 50.0,
  },
  keyword: {
    min_percent: 50.0,
  },
};

export const API_HEADERS = {
  'Content-Type': 'application/json',
};

// Error messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  INVALID_FILE: 'Invalid file format. Please upload a valid image file.',
  INVALID_QUERY: 'Please enter a valid search query.',
  PROCESSING_FAILED: 'Processing failed. Please try again.',
  SEARCH_FAILED: 'Search failed. Please try again.',
  APPLY_JEWELRY_FAILED: 'Failed to apply jewelry. Please try again.',
  MISSING_IMAGES: 'Both person image and jewelry image are required.',
};
