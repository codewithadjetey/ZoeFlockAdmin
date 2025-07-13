'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/shared/LoadingSpinner';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireGuest?: boolean;
  requiredPermissions?: string[];
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireGuest = false,
  requiredPermissions = [],
  requiredRoles = [],
  fallback,
}: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('[AuthGuard Debug]', {
      isAuthenticated,
      isLoading,
      user,
      requireAuth,
      requireGuest,
      requiredPermissions,
      requiredRoles
    });
  }, [isLoading, isAuthenticated, user, requireAuth, requireGuest, requiredPermissions, requiredRoles]);

  useEffect(() => {
    if (isLoading) {
      console.log('[AuthGuard] Still loading...');
      return;
    }

    console.log('[AuthGuard] Loading complete, checking authentication...');

    // For guest routes (login, register, etc.)
    if (requireGuest) {
      if (isAuthenticated) {
        console.log('[AuthGuard] User is authenticated, redirecting to dashboard');
        setIsRedirecting(true);
        router.push('/dashboard');
        return;
      } else {
        console.log('[AuthGuard] User is not authenticated, allowing access to guest route');
        setShouldRender(true);
        return;
      }
    }

    // For protected routes (dashboard, etc.)
    if (requireAuth) {
      if (!isAuthenticated) {
        console.log('[AuthGuard] User is not authenticated, redirecting to login');
        setIsRedirecting(true);
        router.push('/auth/login');
        return;
      } else {
        console.log('[AuthGuard] User is authenticated, checking permissions...');
        
        // Check role requirements
        if (requiredRoles.length > 0) {
          const userRoles = user?.roles?.map(role => role.name) || [];
          const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
          
          if (!hasRequiredRole) {
            console.log('[AuthGuard] User does not have required role');
            setIsRedirecting(true);
            router.push('/auth/login');
            return;
          }
        }

        // Check permission requirements
        if (requiredPermissions.length > 0) {
          const userPermissions = user?.permissions?.map(p => p.name) || [];
          const hasRequiredPermission = requiredPermissions.some(permission => 
            userPermissions.includes(permission)
          );
          
          if (!hasRequiredPermission) {
            console.log('[AuthGuard] User does not have required permission');
            setIsRedirecting(true);
            router.push('/auth/login');
            return;
          }
        }

        console.log('[AuthGuard] User has required permissions, allowing access');
        setShouldRender(true);
        return;
      }
    }

    // Default: allow access
    console.log('[AuthGuard] No specific requirements, allowing access');
    setShouldRender(true);
  }, [isLoading, isAuthenticated, user, requireAuth, requireGuest, requiredPermissions, requiredRoles, router]);

  // Show loading spinner while checking authentication
  if (isLoading || isRedirecting) {
    console.log('[AuthGuard] Showing loading spinner');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show fallback if provided and not authenticated
  if (fallback && !isAuthenticated) {
    return <>{fallback}</>;
  }

  // Render children if authentication check passes
  if (shouldRender) {
    console.log('[AuthGuard] Rendering children');
    return <>{children}</>;
  }

  // Default loading state
  console.log('[AuthGuard] Default loading state');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="lg" />
    </div>
  );
}

// Convenience components
export function ProtectedRoute({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireAuth={true}>
      {children}
    </AuthGuard>
  );
}

export function GuestRoute({ children }: { children: ReactNode }) {
  return (
    <AuthGuard requireGuest={true}>
      {children}
    </AuthGuard>
  );
} 