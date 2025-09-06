"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getChurchSettings, ChurchSettings } from '@/services/settings';

interface ChurchSettingsContextType {
  settings: ChurchSettings | null;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
  isRegistrationAllowed: boolean;
  isEmailVerificationRequired: boolean;
  isAdminApprovalRequired: boolean;
}

const ChurchSettingsContext = createContext<ChurchSettingsContextType | undefined>(undefined);

interface ChurchSettingsProviderProps {
  children: ReactNode;
}

export function ChurchSettingsProvider({ children }: ChurchSettingsProviderProps) {
  const [settings, setSettings] = useState<ChurchSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const churchSettings = await getChurchSettings();
      setSettings(churchSettings);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch church settings');
      console.error('Error fetching church settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value: ChurchSettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings,
    isRegistrationAllowed: settings?.registration?.allow_self_registration ?? true,
    isEmailVerificationRequired: settings?.registration?.require_email_verification ?? true,
    isAdminApprovalRequired: settings?.registration?.require_admin_approval ?? false,
  };

  return (
    <ChurchSettingsContext.Provider value={value}>
      {children}
    </ChurchSettingsContext.Provider>
  );
}

export function useChurchSettings() {
  const context = useContext(ChurchSettingsContext);
  if (context === undefined) {
    throw new Error('useChurchSettings must be used within a ChurchSettingsProvider');
  }
  return context;
}
