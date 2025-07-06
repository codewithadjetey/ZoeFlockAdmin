import { api } from './api';

// Token management
export const TOKEN_KEY = 'auth_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  delete api.defaults.headers.common['Authorization'];
}

export function isTokenValid(token: string): boolean {
  if (!token) return false;
  
  try {
    // Check if token is a valid JWT format (basic check)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload.exp > currentTime;
  } catch (error) {
    return false;
  }
}

// API authentication helpers
export async function validateToken(): Promise<boolean> {
  try {
    const token = getToken();
    if (!token || !isTokenValid(token)) {
      removeToken();
      return false;
    }

    // Verify token with server
    await api.get('/auth/me');
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
}

export async function refreshToken(): Promise<boolean> {
  try {
    const response = await api.post<{ token: string }>('/auth/refresh');
    setToken(response.data.token);
    return true;
  } catch (error) {
    removeToken();
    return false;
  }
}

// Permission and role helpers
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  return userPermissions.includes(requiredPermission);
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.some(permission => userPermissions.includes(permission));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission));
}

export function hasRole(userRole: string, requiredRole: string): boolean {
  return userRole === requiredRole;
}

export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// Route protection helpers
export function canAccessRoute(
  userRole: string,
  userPermissions: string[],
  requiredRoles: string[] = [],
  requiredPermissions: string[] = []
): boolean {
  // Check roles first
  if (requiredRoles.length > 0 && !hasAnyRole(userRole, requiredRoles)) {
    return false;
  }

  // Check permissions
  if (requiredPermissions.length > 0 && !hasAllPermissions(userPermissions, requiredPermissions)) {
    return false;
  }

  return true;
}

// User session helpers
export function getUserFromStorage(): any {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

export function setUserToStorage(user: any): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeUserFromStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('user');
}

// Logout helper
export async function logout(): Promise<void> {
  try {
    // Call logout endpoint
    await api.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear all auth data
    removeToken();
    removeUserFromStorage();
  }
}

// Initialize auth state
export function initializeAuth(): void {
  const token = getToken();
  if (token && isTokenValid(token)) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    removeToken();
  }
} 