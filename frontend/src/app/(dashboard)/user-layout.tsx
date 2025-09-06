"use client"
import React from 'react'
import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/AuthGuard';
import UserDashboardLayout from '@/components/layout/UserDashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function UserLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('UserLayout Debug:', { isAuthenticated, isLoading });
  
  return ( 
    <ProtectedRoute>
      <UserDashboardLayout>
        <div className="space-y-6">
          {children}
        </div>
      </UserDashboardLayout>
    </ProtectedRoute>
  )
} 