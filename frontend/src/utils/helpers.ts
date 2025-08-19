// Date formatting
export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Currency formatting
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

// String utilities
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const truncate = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
};

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

// Local storage utilities
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const setToStorage = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

// Debounce utility
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Generate random ID
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Class name utility
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
}; 

// NEXT_PUBLIC_ASSETS_URL getImageUrl
export const getImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  // If already absolute URL, return as-is
  if (/^https?:\/\//i.test(path)) return path;
  const base = (process.env.NEXT_PUBLIC_ASSETS_URL || '').replace(/\/$/, '');
  const clean = path.replace(/^\/+/, '');
  return `${base}/${clean}`;
};

/**
 * Convert ISO datetime to time format for time input (HH:MM)
 */
export const formatTimeForInput = (isoTime: string | undefined): string => {
  if (!isoTime) return '';
  const date = new Date(isoTime);
  return date.toTimeString().slice(0, 5); // Extract HH:MM
};

/**
 * Convert ISO datetime to date format for date input (YYYY-MM-DD)
 */
export const formatDateForInput = (isoDate: string | undefined): string => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toISOString().split('T')[0]; // Extract YYYY-MM-DD
};

/**
 * Convert ISO datetime to datetime-local format for datetime-local input (YYYY-MM-DDTHH:MM)
 */
export const formatDateTimeLocalForInput = (isoDateTime: string | undefined): string => {
  if (!isoDateTime) return '';
  
  try {
    const date = new Date(isoDateTime);
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

/**
 * Convert datetime-local value to backend format (Y-m-d H:i:s)
 */
export const formatDateTimeForBackend = (dateTimeLocal: string): string => {
  if (!dateTimeLocal) return '';
  const date = new Date(dateTimeLocal);
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

/**
 * Convert date value to backend format (Y-m-d)
 */
export const formatDateForBackend = (dateValue: string): string => {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  return date.toISOString().split('T')[0];
};

export function getMemberOptions(members: Array<{ id?: number; first_name?: string; last_name?: string }>) {
  return members.map(member => ({
    value: member.id?.toString() || '',
    label: `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim()
  }));
}

export function getPartnershipCategoryOptions(categories: Array<{ id?: number; name?: string }>) {
  return categories.map(category => ({
    value: category.id?.toString() || '',
    label: category.name ?? ''
  }));
}

