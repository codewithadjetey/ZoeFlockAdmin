import React from 'react'

import { ReactNode } from 'react';

export const metadata = {
  title: 'ZoeFlockAdmin',
  description: 'Church Management System',
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return ( 
    <section id="login" className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
                       {children}
        </div>
    </section>
  )
}
