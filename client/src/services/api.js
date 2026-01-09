import axios from 'axios';
import { auth } from '../config/firebase';

// Create axios instance
// In development: uses proxy from package.json (relative URL)
// In production: uses REACT_APP_API_URL from .env.production
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 seconds timeout
});

// Request interceptor for auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth.currentUser;

      if (currentUser) {
        // Get token (only refreshes if expired)
        const token = await currentUser.getIdToken(false);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Return response data directly
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const currentUser = auth.currentUser;

        if (currentUser) {
          // Force token refresh
          const newToken = await currentUser.getIdToken(true);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          // Retry the request
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }
    }

    // Extract error message
    const message = error.response?.data?.message ||
                    error.message ||
                    'Ein Fehler ist aufgetreten';

    // Create a more useful error object
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.data = error.response?.data;
    enhancedError.originalError = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
