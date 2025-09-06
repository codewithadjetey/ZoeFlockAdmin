"use client";
import React from 'react';
import { useChurchSettings } from '@/contexts/ChurchSettingsContext';

export function ChurchInfo() {
  const { 
    settings, 
    isLoading, 
    error, 
    isRegistrationAllowed 
  } = useChurchSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading church information...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading church information: {error}</p>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">No church information available</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {settings.church.name}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {settings.church.denomination} • Established {settings.church.established_year}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Contact Information</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><i className="fas fa-map-marker-alt mr-2"></i>{settings.church.address}</p>
            <p><i className="fas fa-phone mr-2"></i>{settings.church.phone}</p>
            <p><i className="fas fa-envelope mr-2"></i>{settings.church.email}</p>
            {settings.church.website && (
              <p><i className="fas fa-globe mr-2"></i>
                <a href={settings.church.website} target="_blank" rel="noopener noreferrer" 
                   className="text-blue-600 hover:text-blue-800">
                  {settings.church.website}
                </a>
              </p>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Leadership</h3>
          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <p><i className="fas fa-user mr-2"></i>{settings.church.pastor_name}</p>
          </div>
        </div>
      </div>

      {settings.service_times && Object.keys(settings.service_times).length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Service Times</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {Object.entries(settings.service_times).map(([day, times]) => (
              <div key={day} className="bg-gray-50 dark:bg-gray-700 rounded p-2">
                <p className="font-medium text-gray-900 dark:text-white capitalize">{day}</p>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {times.map((time, index) => (
                    <span key={index}>
                      {time}
                      {index < times.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Registration Status: 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
              isRegistrationAllowed 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {isRegistrationAllowed ? 'Open' : 'Closed'}
            </span>
          </div>
          
          {settings.social_media && (
            <div className="flex space-x-2">
              {settings.social_media.facebook && (
                <a href={settings.social_media.facebook} target="_blank" rel="noopener noreferrer"
                   className="text-blue-600 hover:text-blue-800">
                  <i className="fab fa-facebook"></i>
                </a>
              )}
              {settings.social_media.twitter && (
                <a href={settings.social_media.twitter} target="_blank" rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-600">
                  <i className="fab fa-twitter"></i>
                </a>
              )}
              {settings.social_media.instagram && (
                <a href={settings.social_media.instagram} target="_blank" rel="noopener noreferrer"
                   className="text-pink-600 hover:text-pink-800">
                  <i className="fab fa-instagram"></i>
                </a>
              )}
              {settings.social_media.youtube && (
                <a href={settings.social_media.youtube} target="_blank" rel="noopener noreferrer"
                   className="text-red-600 hover:text-red-800">
                  <i className="fab fa-youtube"></i>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
