import axios from 'axios';

// Base API URL (adjust as needed)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://zoeflockadmin.org/api/v1';

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
  return api.post<T>(url, data, {
    ...config,
    headers: {
      ...(config.headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  });
}

// Example usage:
// import { http, httpFile } from '@/utils/api';
// const res = await http({ method: 'get', url: '/members' });
// const res = await httpFile('/upload', formData); 