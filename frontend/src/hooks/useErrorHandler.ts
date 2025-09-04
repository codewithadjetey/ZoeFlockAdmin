import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setErrorHandler } from '@/utils/api';

export function useErrorHandler() {
  const router = useRouter();

  useEffect(() => {
    // Set up the error handler for 403 errors
    setErrorHandler((error) => {
      if (error.response?.status === 403) {
        // Extract error details from the response
        const errorData = error.response?.data;
        const errorMessage = errorData?.message || 'Insufficient permissions';
        const errorType = errorData?.error || 'permission_denied';
        const requiredPermissions = errorData?.required_permissions || [];
        const requestedUrl = error.config?.url || window.location.pathname;
        
        // Use Next.js router for better navigation with query parameters
        const params = new URLSearchParams();
        if (errorMessage) params.append('error', errorMessage);
        if (errorType) params.append('errorType', errorType);
        if (requiredPermissions.length > 0) {
          params.append('permissions', requiredPermissions.join(','));
        }
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