import axios from 'axios';

// Debug: Log the API base URL from environment
console.log('API URL from env:', process.env.NEXT_PUBLIC_API_URL);

// Base API URL from configuration
import { config, getApiUrl } from './config';
const API_BASE_URL = getApiUrl();

// Create an axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false, // Set to true if you need cookies
});

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