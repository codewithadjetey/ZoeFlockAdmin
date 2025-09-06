"use client";
import React from 'react';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';
import { useRouter } from 'next/navigation';

export function RegistrationStatusDemo() {
  const { 
    settings, 
    isLoading, 
    error, 
    isRegistrationAllowed,
    isEmailVerificationRequired,
    isAdminApprovalRequired
  } = useChurchSettings();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading registration settings...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <div className="flex items-center">
          <i className="fas fa-exclamation-triangle text-red-600 mr-3"></i>
          <div>
            <h3 className="font-medium text-red-800 dark:text-red-200">Error Loading Settings</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Registration Status Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Current registration settings for {settings?.church.name || 'the church'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Registration Status */}
        <div className={`p-4 rounded-lg border-2 ${
          isRegistrationAllowed 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-center mb-2">
            <i className={`fas ${
              isRegistrationAllowed ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'
            } mr-2`}></i>
            <h3 className={`font-semibold ${
              isRegistrationAllowed 
                ? 'text-green-800 dark:text-green-200' 
                : 'text-red-800 dark:text-red-200'
            }`}>
              Registration Status
            </h3>
          </div>
          <p className={`text-sm ${
            isRegistrationAllowed 
              ? 'text-green-700 dark:text-green-300' 
              : 'text-red-700 dark:text-red-300'
          }`}>
            {isRegistrationAllowed ? 'Open for new registrations' : 'Closed - Contact administration'}
          </p>
        </div>

        {/* Email Verification */}
        <div className={`p-4 rounded-lg border-2 ${
          isEmailVerificationRequired 
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
            : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        }`}>
          <div className="flex items-center mb-2">
            <i className={`fas ${
              isEmailVerificationRequired ? 'fa-envelope text-blue-600' : 'fa-envelope-open text-gray-600'
            } mr-2`}></i>
            <h3 className={`font-semibold ${
              isEmailVerificationRequired 
                ? 'text-blue-800 dark:text-blue-200' 
                : 'text-gray-800 dark:text-gray-200'
            }`}>
              Email Verification
            </h3>
          </div>
          <p className={`text-sm ${
            isEmailVerificationRequired 
              ? 'text-blue-700 dark:text-blue-300' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {isEmailVerificationRequired ? 'Required after registration' : 'Not required'}
          </p>
        </div>
      </div>

      {/* Admin Approval */}
      <div className={`p-4 rounded-lg border-2 mb-6 ${
        isAdminApprovalRequired 
          ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' 
          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
      }`}>
        <div className="flex items-center mb-2">
          <i className={`fas ${
            isAdminApprovalRequired ? 'fa-user-shield text-yellow-600' : 'fa-user-check text-gray-600'
          } mr-2`}></i>
          <h3 className={`font-semibold ${
            isAdminApprovalRequired 
              ? 'text-yellow-800 dark:text-yellow-200' 
              : 'text-gray-800 dark:text-gray-200'
            }`}>
            Admin Approval
          </h3>
        </div>
        <p className={`text-sm ${
          isAdminApprovalRequired 
            ? 'text-yellow-700 dark:text-yellow-300' 
            : 'text-gray-700 dark:text-gray-300'
        }`}>
          {isAdminApprovalRequired ? 'Required before account activation' : 'Not required'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={() => router.push('/auth/login')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <i className="fas fa-sign-in-alt mr-2"></i>
          Go to Login
        </button>
        
        {isRegistrationAllowed && (
          <button
            onClick={() => router.push('/auth/register')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-user-plus mr-2"></i>
            Go to Register
          </button>
        )}
        
        {!isRegistrationAllowed && (
          <button
            onClick={() => router.push('/not-found')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <i className="fas fa-exclamation-triangle mr-2"></i>
            Test 404 Redirect
          </button>
        )}
      </div>

      {/* Contact Information */}
      {settings?.contact && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {settings.contact.phone && (
              <p><i className="fas fa-phone mr-2"></i>{settings.contact.phone}</p>
            )}
            {settings.contact.email && (
              <p><i className="fas fa-envelope mr-2"></i>{settings.contact.email}</p>
            )}
            {settings.contact.emergency_contact && (
              <p><i className="fas fa-exclamation-triangle mr-2"></i>Emergency: {settings.contact.emergency_contact}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
