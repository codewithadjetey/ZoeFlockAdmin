"use client";
import React, { useState } from 'react';
import { Church } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { isRegistrationAllowed, settings, isLoading: settingsLoading } = useChurchSettings();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      // Use the standard success message from the API
      toast.success('Login successful');
      router.push('/dashboard');
    } catch (error: any) {
      // Use the error message from the API response
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      
      if (error.response?.data?.email_verification_required) {
        toast.error(errorMessage);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg">
              <Church className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your {settings?.church.name || 'Zoe Flock Admin'} account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <TextInput
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <div>
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              loading={isLoading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          {/* Navigation Links */}
          <div className="mt-6 text-center space-y-2">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <Link href="/auth/password-reset" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
                Forgot your password?
              </Link>
            </div>
            {!settingsLoading && isRegistrationAllowed && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;