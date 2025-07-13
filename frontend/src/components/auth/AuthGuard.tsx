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

  useEffect(() => {
    // Don't do anything while loading
    if (isLoading) {
      setShouldRender(false);
      setIsRedirecting(false);
      return;
    }

    // If guest is required and user is authenticated, redirect to dashboard
    if (requireGuest && isAuthenticated) {
      setIsRedirecting(true);
      router.push('/dashboard');
      return;
    }

    // If auth is required and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      setIsRedirecting(true);
      router.push('/auth/login');
      return;
    }

    // Check permissions if required
    if (requireAuth && isAuthenticated && user && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user.permissions.some(p => p.name === permission)
      );
      
      if (!hasAllPermissions) {
        setIsRedirecting(true);
        router.push('/dashboard');
        return;
      }
    }

    // Check roles if required
    if (requireAuth && isAuthenticated && user && requiredRoles.length > 0) {
      const hasRequiredRole = user.roles.some(role => requiredRoles.includes(role.name));
      
      if (!hasRequiredRole) {
        setIsRedirecting(true);
        router.push('/dashboard');
        return;
      }
    }

    // If we reach here, all conditions are met
    setShouldRender(true);
    setIsRedirecting(false);
  }, [isLoading, isAuthenticated, user, requireAuth, requireGuest, requiredPermissions, requiredRoles, router]);

  // Show loading spinner while checking authentication or during redirects
  if (isLoading || isRedirecting || !shouldRender) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  // Show fallback if provided and conditions are not met
  if (fallback && (
    (requireAuth && !isAuthenticated) ||
    (requireGuest && isAuthenticated) ||
    (requireAuth && isAuthenticated && user && requiredPermissions.length > 0 && 
     !requiredPermissions.every(permission => user.permissions.some(p => p.name === permission))) ||
    (requireAuth && isAuthenticated && user && requiredRoles.length > 0 && 
     !user.roles.some(role => requiredRoles.includes(role.name)))
  )) {
    return <>{fallback}</>;
  }

  // Render children if all conditions are met
  return <>{children}</>;
}

// Convenience components for common use cases
export function ProtectedRoute({ children, ...props }: Omit<AuthGuardProps, 'requireAuth'>) {
  return (
    <AuthGuard requireAuth={true} {...props}>
      {children}
    </AuthGuard>
  );
}

export function GuestRoute({ children, ...props }: Omit<AuthGuardProps, 'requireGuest'>) {
  return (
    <AuthGuard requireGuest={true} {...props}>
      {children}
    </AuthGuard>
  );
}

export function AdminRoute({ children, ...props }: Omit<AuthGuardProps, 'requiredRoles'>) {
  return (
    <AuthGuard requireAuth={true} requiredRoles={['admin']} {...props}>
      {children}
    </AuthGuard>
  );
}

export function PastorRoute({ children, ...props }: Omit<AuthGuardProps, 'requiredRoles'>) {
  return (
    <AuthGuard requireAuth={true} requiredRoles={['pastor', 'admin']} {...props}>
      {children}
    </AuthGuard>
  );
} 