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
      console.log("Error Data:", errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
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
      console.log("Error Data:", errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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


const apiService = {
  search: searchService,
};

export default apiService;
