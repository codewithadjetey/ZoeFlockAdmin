"use client";
import React, { useState } from "react";
import { Church } from "lucide-react";
import { api } from "@/utils/api";
import { toast } from 'react-toastify';
import TextInput from '@/components/ui/TextInput';
import Button from '@/components/ui/Button';
import Link from "next/link";

interface PasswordResetResponse {
  success: boolean;
  message: string;
}

const PasswordResetPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await api.post<PasswordResetResponse>('/auth/forgot-password', {
        email,
      });

      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to send reset link");
      }
    } catch (error: any) {
      switch (error.response.status) {
        case 422:
          setErrors(error.response.data.errors);
          break;
        case 400:
          toast.error(error.response.data.message);
          break;
        default:
          toast.error("Failed to send reset link. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
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
            Reset Password
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-200">
            Enter your email to receive a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <TextInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isSubmitting}
              error={errors.email}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            className="w-full"
          >
            Send Reset Link
          </Button>
        </form>

        {/* Navigation Links */}
        <div className="mt-6 text-center space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Remembered your password?{" "}
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

export default PasswordResetPage; 