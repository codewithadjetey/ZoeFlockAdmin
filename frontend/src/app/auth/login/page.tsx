"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { TextInput, Button } from "@/components/ui";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { DEMO_CREDENTIALS } from "@/utils/constants";
import { isValidEmail, cn } from "@/utils/helpers";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { login, isLoading, error, clearError } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    const success = await login({ email, password, remember: rememberMe });
    if (success) router.push("/dashboard");
  };

  return (
    <div className="h-fit flex items-center justify-center">
      <div className="w-full max-w-md mx-auto p-8 rounded-3xl shadow-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <i className="fas fa-church text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1 font-poppins">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to ZoeFlock Admin</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-envelope" />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 outline-none transition-all duration-200 shadow-sm"
                autoFocus
                required
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <i className="fas fa-lock" />
              </span>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600 outline-none transition-all duration-200 shadow-sm"
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
              />
              Remember me
            </label>
            <a href="/auth/password-reset" className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">Forgot password?</a>
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg transition-all duration-200 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" /> Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
        <div className="mt-8 text-center">
          <span className="text-gray-500 dark:text-gray-400 text-sm">Don't have an account? </span>
          <a href="/auth/register" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium transition-colors">Sign up</a>
        </div>
      </div>
    </div>
  );
}