"use client"
import React from 'react'
import { ReactNode } from 'react';
import { GuestRoute } from '@/components/auth/AuthGuard';
import ToastContainer from "@/components/ui/ToastContainer";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return ( 
    <GuestRoute>
      <section className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-all duration-500">
        <div className="w-full max-w-md">
          {children}
        </div>
      </section>
      <ToastContainer />
    </GuestRoute>
  )
}
