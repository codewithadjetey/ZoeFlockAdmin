import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setErrorHandler } from '@/utils/api';

export function useErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // Set up the error handler for 403 errors
    setErrorHandler((error) => {
      if (error.response?.status === 403) {
        // Get the missing permission from the error response
        const missingPermission = error.response?.data?.message || 'unknown';
        const requestedUrl = error.config?.url || window.location.pathname;
        
        // Use Next.js router for better navigation with query parameters
        const params = new URLSearchParams();
        if (missingPermission) params.append('permission', missingPermission);
        if (requestedUrl) params.append('url', requestedUrl);
        
        const queryString = params.toString();
        const redirectUrl = queryString ? `/forbidden?${queryString}` : '/forbidden';
        
        router.push(redirectUrl);
      }
    });

    // Cleanup function to remove the error handler
    return () => {
      setErrorHandler(() => {});
    };
  }, [router]);

  return null;
} 