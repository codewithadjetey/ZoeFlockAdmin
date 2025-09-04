import axios from 'axios';

// Base API URL from configuration
import { config, getApiUrl } from './config';
import { toast } from 'react-toastify';
const API_BASE_URL = getApiUrl();

// Error handler for 403 redirects
let errorHandler: ((error: any) => void) | null = null;

export const setErrorHandler = (handler: (error: any) => void) => {
  errorHandler = handler;
};

// Create an axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if you need cookies
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
      headers: config.headers || {}
    });
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response?.status === 401) {
      console.log('[API] Unauthorized - clearing auth data');
      // Clear auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('zoe_flock_auth');
      }
      // Redirect to login if in browser
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login';
      }
    }
    
    // Handle permission errors
    if (error.response?.status === 403) {
      console.log('[API] Forbidden - insufficient permissions');
      // Show toast notification
      toast.error('You do not have permission to access this resource');
      
      // Use custom error handler if available, otherwise fallback to window.location
      if (errorHandler) {
        errorHandler(error);
      } else if (typeof window !== 'undefined') {
        // Only redirect if we're not already on the forbidden page
        if (!window.location.pathname.includes('/forbidden')) {
          window.location.href = '/forbidden';
        }
      }
    }
    
    // Handle server errors
    if (error.response?.status >= 500) {
      console.error('[API] Server error:', error.response?.data);
      toast.error('Server error occurred. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

// Generic request function
export async function http<T = any>(
  config: any
): Promise<any> {
  return api.request<T>(config);
}

// Helper for file uploads (multipart/form-data)
export async function httpFile<T = any>(
  url: string,
  data: FormData,
  config: any = {}
): Promise<any> {
  // Get the auth token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  // Debug logging
  console.log('httpFile called with:', { url, token: !!token, baseURL: API_BASE_URL });
  console.log('Full URL will be:', `${API_BASE_URL}/${url}`);
  
  return api.post<T>(url, data, {
    ...config,
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'multipart/form-data',
      // Include Authorization header if token exists
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
  });
}

// Example usage:
// import { http, httpFile } from '@/utils/api';
// const res = await http({ method: 'get', url: '/members' });
// const res = await httpFile('/upload', formData); 