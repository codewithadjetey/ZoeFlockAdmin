"use client"
import React from 'react'
import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return ( 
    <section id="login" className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
                       {children}
        </div>
    </section>
  )
}
