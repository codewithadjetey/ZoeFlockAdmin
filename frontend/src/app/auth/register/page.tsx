"use client";
import React, { useState, useEffect } from 'react';
import { Church } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import TextInput from '@/components/ui/TextInput';
import PasswordInput from '@/components/ui/PasswordInput';
import Button from '@/components/ui/Button';
import Link from 'next/link';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { isRegistrationAllowed, settings, isLoading: settingsLoading } = useChurchSettings();
  const router = useRouter();

  // Redirect to 404 if registration is disabled
  useEffect(() => {
    if (!settingsLoading && !isRegistrationAllowed) {
      router.push('/not-found');
    }
  }, [settingsLoading, isRegistrationAllowed, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
      });
      
      toast.success('Registration successful! Please check your email to verify your account.');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner while checking registration status
  if (settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mx-auto">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Checking registration status...</p>
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if registration is disabled (will redirect)
  if (!isRegistrationAllowed) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mx-auto transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <Church className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['Poppins'] transition-colors duration-200">
            {settings?.church.name || 'Zoe Flock Admin'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
            Create your account to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <TextInput
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              disabled={isLoading}
            />
          </div>

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

          <div>
            <PasswordInput
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            loading={isLoading}
            className="w-full"
          >
            Create Account
          </Button>
        </form>

        {/* Registration Requirements */}
        {settings && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <i className="fas fa-info-circle text-blue-600 mr-3 mt-1"></i>
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Registration Information</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  {settings.registration.require_email_verification && (
                    <li>• Email verification required after registration</li>
                  )}
                  {settings.registration.require_admin_approval && (
                    <li>• Admin approval required before account activation</li>
                  )}
                  <li>• Password must be at least 8 characters long</li>
                  <li>• All fields are required for account creation</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Sign in here
            </Link>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Need to verify your email?{" "}
            <Link href="/auth/verify-email" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Verify email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 