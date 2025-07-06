'use client';

import React, { ReactNode, useEffect } from 'react';
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

  useEffect(() => {
    if (isLoading) return;

    // If guest is required and user is authenticated, redirect to dashboard
    if (requireGuest && isAuthenticated) {
      router.push('/dashboard');
      return;
    }

    // If auth is required and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    // Check permissions if required
    if (requireAuth && isAuthenticated && user && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        user.permissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        router.push('/dashboard');
        return;
      }
    }

    // Check roles if required
    if (requireAuth && isAuthenticated && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      
      if (!hasRequiredRole) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isLoading, isAuthenticated, user, requireAuth, requireGuest, requiredPermissions, requiredRoles, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show fallback if provided and conditions are not met
  if (fallback && (
    (requireAuth && !isAuthenticated) ||
    (requireGuest && isAuthenticated) ||
    (requireAuth && isAuthenticated && user && requiredPermissions.length > 0 && 
     !requiredPermissions.every(permission => user.permissions.includes(permission))) ||
    (requireAuth && isAuthenticated && user && requiredRoles.length > 0 && 
     !requiredRoles.includes(user.role))
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