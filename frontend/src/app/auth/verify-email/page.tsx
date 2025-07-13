"use client";
import React, { useState, useEffect } from "react";
import { Church } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";

interface VerificationResponse {
  success: boolean;
  message: string;
}

const VerifyEmailPage = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for token and email in URL params
  useEffect(() => {
    const token = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (token && emailParam) {
      setEmail(emailParam);
      handleEmailVerification(token, emailParam);
    }
  }, [searchParams]);

  const handleEmailVerification = async (token: string, email: string) => {
    setIsVerifying(true);
    setMessage("Verifying your email...");

    try {
      const response = await api.post<VerificationResponse>('/auth/verify-email', {
        email,
        token,
      });

      if (response.data.success) {
        setVerificationStatus('success');
        setMessage("Email verified successfully! You can now log in to your account.");
      } else {
        setVerificationStatus('error');
        setMessage(response.data.message || "Verification failed");
      }
    } catch (error: any) {
      setVerificationStatus('error');
      setMessage(error.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await api.post<VerificationResponse>('/auth/send-verification-email', {
        email,
      });

      if (response.data.success) {
        setMessage("Verification email sent successfully! Please check your inbox.");
      } else {
        setMessage(response.data.message || "Failed to send verification email");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to send verification email. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'success':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      default:
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="w-full">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mx-auto transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl">
            <Church className="text-white" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-['Poppins'] transition-colors duration-200">
            Verify Email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
            {verificationStatus === 'idle' 
              ? "Enter your email to receive a verification link"
              : verificationStatus === 'success'
              ? "Your email has been verified successfully"
              : "Email verification failed"
            }
          </p>
        </div>

        {verificationStatus === 'idle' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition-all duration-300 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            {message && (
              <div className={`text-sm ${getStatusColor()} rounded-xl p-3 border transition-all duration-200`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-blue-400 disabled:to-purple-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              {isSubmitting ? "Sending..." : "Send Verification Link"}
            </button>
          </form>
        )}

        {verificationStatus === 'success' && (
          <div className="space-y-6">
            <div className={`text-sm ${getStatusColor()} rounded-xl p-3 border transition-all duration-200`}>
              {message}
            </div>
            <button
              onClick={() => router.push('/auth/login')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Go to Login
            </button>
          </div>
        )}

        {verificationStatus === 'error' && (
          <div className="space-y-6">
            <div className={`text-sm ${getStatusColor()} rounded-xl p-3 border transition-all duration-200`}>
              {message}
            </div>
            <button
              onClick={() => setVerificationStatus('idle')}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {isVerifying && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Verifying your email...</p>
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
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Register here
            </Link>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Forgot your password?{" "}
            <Link href="/auth/password-reset" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:underline transition-colors duration-200">
              Reset password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 