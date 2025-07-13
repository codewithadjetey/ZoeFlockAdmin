"use client"
import React from 'react'
import { ReactNode } from 'react';
import { ProtectedRoute } from '@/components/auth/AuthGuard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('DashboardLayout Debug:', { isAuthenticated, isLoading });
  
  return ( 
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 