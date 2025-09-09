"use client"
import React from 'react'
import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/AuthGuard';
import { DashboardLayout } from '@/components/layout';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  return ( 
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {children}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
} 