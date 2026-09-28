import {
  API_BASE_URL,
  API_ENDPOINTS,
  DEFAULT_SEARCH_PARAMS,
  API_ERROR_MESSAGES
} from '../utils/apiConfig';
import { getCurrentDatabaseToken } from '../utils/databaseConfig';

async function apiCall(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getCurrentDatabaseToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      const err = new Error(errMsg);
      err.status = response.status;
      err.isNetworkError = false;
      throw err;
    }

    const data = await response.json();

    if (data && data.detail && typeof data.detail === 'string' && data.detail.includes('Index not found')) {
      const err = new Error(data.detail);
      err.isTrainingPending = true;
      throw err;
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const netErr = new Error(API_ERROR_MESSAGES.NETWORK_ERROR);
      netErr.isNetworkError = true;
      throw netErr;
    }
    throw error;
  }
}

export async function apiCallBinary(endpoint, options = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getCurrentDatabaseToken();
    const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(url, {
      ...options,
      headers: {
        ...authHeader,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errMsg = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      const err = new Error(errMsg);
      err.status = response.status;
      err.isNetworkError = false;
      throw err;
    }

    // Check if response is JSON (e.g. for background remover which returns image_url)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.blob();
  } catch (error) {
    throw error;
  }
}

export const searchService = {
  async searchByImage(file, params = {}) {
    if (!file) {
      throw new Error(API_ERROR_MESSAGES.INVALID_FILE);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('top_k', params.top_k || DEFAULT_SEARCH_PARAMS.image.top_k);
    if (params.aiApi) formData.append('aiApi', params.aiApi);
    formData.append('min_percent', params.min_percent || DEFAULT_SEARCH_PARAMS.image.min_percent);

    return apiCall(API_ENDPOINTS.search.image, {
      method: 'POST',
      body: formData,
    });
  },

  async searchByText(query, params = {}) {
    if (!query || query.trim() === '') {
      throw new Error(API_ERROR_MESSAGES.INVALID_QUERY);
    }

    const requestBody = {
      query: query.trim(),
      top_k: params.top_k || DEFAULT_SEARCH_PARAMS.text.top_k,
      ...(params.aiApi && { aiApi: params.aiApi }),
      min_percent: params.min_percent || DEFAULT_SEARCH_PARAMS.text.min_percent,
    };

    return apiCall(API_ENDPOINTS.search.text, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
  },

  async searchHybrid(searchData, params = {}) {
    const { file, query } = searchData;

    if (!file && (!query || query.trim() === '')) {
      throw new Error('Either image file or text query is required for hybrid search');
    }

    const formData = new FormData();

    if (file) {
      formData.append('file', file);
    }

    if (query && query.trim() !== '') {
      formData.append('query', query.trim());
    }

    formData.append('top_k', params.top_k || DEFAULT_SEARCH_PARAMS.hybrid.top_k);
    if (params.aiApi) formData.append('aiApi', params.aiApi);
    formData.append('min_percent', params.min_percent || DEFAULT_SEARCH_PARAMS.hybrid.min_percent);

    return apiCall(API_ENDPOINTS.search.hybrid, {
      method: 'POST',
      body: formData,
    });
  },

  async searchKeywords(file, params = {}) {
    if (!file) {
      throw new Error(API_ERROR_MESSAGES.INVALID_FILE);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('min_percent', params.min_percent || DEFAULT_SEARCH_PARAMS.keyword.min_percent || '50');

    return apiCall(API_ENDPOINTS.search.keyword, {
      method: 'POST',
      body: formData,
    });
  },
};


export async function preloadService() {
  const aiApi = typeof window !== 'undefined' ? sessionStorage.getItem('aiApi') || '' : '';

  try {
    return await apiCall(API_ENDPOINTS.preload, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ aiApi }),
    });
  } catch (error) {
    console.warn('Preload API failed (non-blocking):', error.message);
    return null;
  }
}

const apiService = {
  search: searchService,
  preload: preloadService,
};

export default apiService;
