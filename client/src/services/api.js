import axios from 'axios';

/**
 * API Client Configuration
 * Base Axios instance with interceptors
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request Interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    // TODO: Get token from Firebase auth
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - redirect to login
          console.log('Unauthorized - redirecting to login');
          // TODO: Clear auth state and redirect
          break;
        case 403:
          // Forbidden
          console.log('Forbidden access');
          break;
        case 404:
          // Not found
          console.log('Resource not found');
          break;
        case 500:
          // Server error
          console.log('Server error');
          break;
        default:
          break;
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

/**
 * Helper function to handle API errors
 */
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || 'Ein Fehler ist aufgetreten',
      status: error.response.status
    };
  } else if (error.request) {
    // No response received
    return {
      message: 'Server nicht erreichbar',
      status: 0
    };
  } else {
    // Request setup error
    return {
      message: error.message || 'Unbekannter Fehler',
      status: -1
    };
  }
}