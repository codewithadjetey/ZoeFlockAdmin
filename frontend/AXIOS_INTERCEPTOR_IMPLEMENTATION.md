# Axios Interceptor Implementation

This document describes the axios interceptor implementation for the ZoeFlockAdmin frontend application.

## Overview

Axios interceptors have been implemented to automatically handle authentication tokens, error responses, and request/response logging. This provides a centralized way to manage API communication and authentication.

## Implementation Location

The axios interceptors are implemented in: **`frontend/src/utils/api.ts`**

## Features

### 🔐 **Authentication Interceptor**
- **Automatic Token Injection**: Automatically adds `Authorization: Bearer <token>` header to all requests
- **Token Source**: Reads token from `localStorage.getItem('auth_token')`
- **SSR Safe**: Checks for `window` object to ensure server-side rendering compatibility

### 📊 **Request Logging**
- Logs all outgoing requests with method, URL, data, params, and headers
- Helps with debugging and monitoring API calls
- Format: `[API Request] METHOD /endpoint`

### 📊 **Response Logging**
- Logs all successful responses with status and data
- Helps with debugging and monitoring API responses
- Format: `[API Response] METHOD /endpoint`

### ⚠️ **Error Handling**
- **401 Unauthorized**: Automatically clears auth data and redirects to login
- **403 Forbidden**: Logs permission errors (can be extended with toast notifications)
- **500+ Server Errors**: Logs server errors for debugging
- **Network Errors**: Logs all error responses with details

## Code Structure

### Request Interceptor
```typescript
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
```

### Response Interceptor
```typescript
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
      data: response.data
    });
    
    return response;
  },
  (error) => {
    // Handle different error types
    if (error.response?.status === 401) {
      // Clear auth data and redirect
    } else if (error.response?.status === 403) {
      // Handle permission errors
    } else if (error.response?.status >= 500) {
      // Handle server errors
    }
    
    return Promise.reject(error);
  }
);
```

## Benefits

### 🚀 **Automatic Token Management**
- No need to manually add Authorization headers in each API call
- Token is automatically included in all requests
- Handles token storage and retrieval transparently

### 🔒 **Centralized Error Handling**
- Consistent error handling across all API calls
- Automatic logout on authentication failures
- Proper error logging for debugging

### 📈 **Better Debugging**
- Request and response logging for all API calls
- Clear error messages and status codes
- Easy to track API communication issues

### 🛡️ **Security**
- Automatic token validation
- Proper cleanup on authentication failures
- SSR-safe implementation

## Integration with Existing Code

### Updated Files
1. **`frontend/src/utils/api.ts`** - Added interceptors
2. **`frontend/src/utils/auth.ts`** - Removed manual header management
3. **`frontend/src/contexts/AuthContext.tsx`** - Simplified token management

### Removed Manual Header Management
- No more `api.defaults.headers.common['Authorization']` calls
- No more manual header deletion
- Interceptors handle everything automatically

## Usage Examples

### Making API Calls
```typescript
import { api } from '@/utils/api';

// Token is automatically added by interceptor
const response = await api.get('/members');
const response = await api.post('/events', eventData);
const response = await api.put('/profile', profileData);
```

### File Uploads
```typescript
import { httpFile } from '@/utils/api';

// Token is automatically added by interceptor
const response = await httpFile('/upload', formData);
```

## Error Handling Examples

### 401 Unauthorized
- Automatically clears `auth_token` from localStorage
- Clears encrypted user data
- Redirects to `/auth/login`

### 403 Forbidden
- Logs the permission error
- Can be extended to show toast notifications
- Request is rejected for component handling

### 500+ Server Errors
- Logs detailed error information
- Can be extended to show generic error messages
- Request is rejected for component handling

## Configuration Options

### Base Configuration
```typescript
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  withCredentials: false,
});
```

### Customizable Features
- **Logging Level**: Can be adjusted or disabled for production
- **Error Handling**: Can be extended with custom error handlers
- **Token Storage**: Can be modified to use different storage methods
- **Redirect Behavior**: Can be customized for different authentication flows

## Testing

### Manual Testing
1. **Login**: Verify token is automatically added to subsequent requests
2. **Logout**: Verify token is removed and requests fail appropriately
3. **Error Handling**: Test with invalid tokens, expired tokens, and server errors
4. **Logging**: Check browser console for request/response logs

### Automated Testing
- Mock axios interceptors for unit tests
- Test error handling scenarios
- Verify token management behavior

## Best Practices

1. **Don't manually manage headers**: Let interceptors handle authentication
2. **Use the api instance**: Always use the configured `api` instance for requests
3. **Handle errors appropriately**: Let interceptors handle common errors, handle specific errors in components
4. **Monitor logs**: Use the logging for debugging and monitoring
5. **Test thoroughly**: Ensure all error scenarios work as expected

## Future Enhancements

1. **Refresh Token Logic**: Add automatic token refresh on 401 errors
2. **Request Retry**: Add retry logic for failed requests
3. **Loading States**: Add global loading indicators
4. **Toast Notifications**: Integrate with toast system for error messages
5. **Request Caching**: Add request caching for better performance
6. **Rate Limiting**: Add rate limiting protection 