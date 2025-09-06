import { api } from '@/utils/api';

export interface ChurchSettings {
  church: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    pastor_name: string;
    established_year: string;
    denomination: string;
  };
  registration: {
    allow_self_registration: boolean;
    require_email_verification: boolean;
    require_admin_approval: boolean;
  };
  service_times: {
    [key: string]: string[];
  };
  contact: {
    phone: string;
    email: string;
    emergency_contact: string;
  };
  social_media: {
    facebook: string;
    twitter: string;
    instagram: string;
    youtube: string;
  };
  features: {
    online_giving: boolean;
    event_registration: boolean;
    group_management: boolean;
    attendance_tracking: boolean;
    financial_reporting: boolean;
  };
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data: ChurchSettings;
}

/**
 * Get church settings and configuration
 */
export const getChurchSettings = async (): Promise<ChurchSettings> => {
  try {
    const response = await api.get<SettingsResponse>('/settings');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch church settings:', error);
    throw error;
  }
};

/**
 * Check if self-registration is allowed
 */
export const isRegistrationAllowed = async (): Promise<boolean> => {
  try {
    const settings = await getChurchSettings();
    return settings.registration.allow_self_registration;
  } catch (error) {
    console.error('Failed to check registration status:', error);
    // Default to true if we can't fetch settings
    return true;
  }
};

/**
 * Check if email verification is required
 */
export const isEmailVerificationRequired = async (): Promise<boolean> => {
  try {
    const settings = await getChurchSettings();
    return settings.registration.require_email_verification;
  } catch (error) {
    console.error('Failed to check email verification status:', error);
    return true;
  }
};

/**
 * Check if admin approval is required
 */
export const isAdminApprovalRequired = async (): Promise<boolean> => {
  try {
    const settings = await getChurchSettings();
    return settings.registration.require_admin_approval;
  } catch (error) {
    console.error('Failed to check admin approval status:', error);
    return false;
  }
};

/**
 * Get church information
 */
export const getChurchInfo = async () => {
  try {
    const settings = await getChurchSettings();
    return settings.church;
  } catch (error) {
    console.error('Failed to fetch church info:', error);
    throw error;
  }
};

/**
 * Get service times
 */
export const getServiceTimes = async () => {
  try {
    const settings = await getChurchSettings();
    return settings.service_times;
  } catch (error) {
    console.error('Failed to fetch service times:', error);
    throw error;
  }
};

/**
 * Get contact information
 */
export const getContactInfo = async () => {
  try {
    const settings = await getChurchSettings();
    return settings.contact;
  } catch (error) {
    console.error('Failed to fetch contact info:', error);
    throw error;
  }
};

/**
 * Get social media links
 */
export const getSocialMediaLinks = async () => {
  try {
    const settings = await getChurchSettings();
    return settings.social_media;
  } catch (error) {
    console.error('Failed to fetch social media links:', error);
    throw error;
  }
};

/**
 * Get feature flags
 */
export const getFeatureFlags = async () => {
  try {
    const settings = await getChurchSettings();
    return settings.features;
  } catch (error) {
    console.error('Failed to fetch feature flags:', error);
    throw error;
  }
};
