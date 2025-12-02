export const ENV_CONFIG = {
  OPTIGO_API_BASE_URL: process.env.OPTIGO_API_BASE_URL,
  OPTIGO_API_KEY: process.env.OPTIGO_API_KEY,
  API_TIMEOUT: parseInt(process.env.API_TIMEOUT) || 30000,
  DEBUG_API: process.env.DEBUG_API === 'true',
};

export const getApiHeaders = (authorizationHeader) => {
  const headers = {};
  if (authorizationHeader) {
    headers['Authorization'] = authorizationHeader;
  } else if (ENV_CONFIG.OPTIGO_API_KEY) {
    headers['Authorization'] = `Bearer ${ENV_CONFIG.OPTIGO_API_KEY}`;
  }
  return headers;
};

export const getApiUrl = (endpoint) => {
  return `${ENV_CONFIG.OPTIGO_API_BASE_URL}${endpoint}`;
};
