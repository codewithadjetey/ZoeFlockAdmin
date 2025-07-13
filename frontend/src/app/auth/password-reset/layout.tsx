"use client"
import React from 'react'
import { ReactNode } from 'react';

export default function PasswordResetLayout({ children }: { children: ReactNode }) {
  return ( 
    <section className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 transition-all duration-500">
      <div className="w-full max-w-md">
        {children}
      </div>
    </section>
  )
} 