"use client"
import React from 'react'
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return ( 
    <section id="login" className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-all duration-500">
        <div className="w-full max-w-md">
                       {children}
        </div>
    </section>
  )
}
