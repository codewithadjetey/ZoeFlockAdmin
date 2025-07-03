import React from 'react'
import { Church } from 'lucide-react'
import Button from '@/components/ui/Button'

const LoginPage = () => {
  return (
     <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Church className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900">ZoeFlockAdmin</h1>
                    <p className="text-neutral-600 mt-2">Welcome back! Please sign in to your account</p>
                </div>
                <form className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Email Address</label>
                        <input type="email" 
                               className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                               placeholder="Enter your email"/>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Password</label>
                        <input type="password" 
                               className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors"
                               placeholder="Enter your password"/>
                    </div>
                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"/>
                            <span className="ml-2 text-sm text-neutral-600">Remember me</span>
                        </label>
                        <a href="/auth/password-reset" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                            Forgot password?
                        </a>
                    </div>
                    <Button type="submit" variant="primary" className="w-full">Sign In</Button>
                </form>
                <div className="text-center mt-4">
                    <span className="text-sm text-neutral-600">Don't have an account? </span>
                    <a href="/auth/register" className="text-primary-600 hover:text-primary-700 font-medium">Register</a>
                </div>
            </div>
  )
}

export default LoginPage