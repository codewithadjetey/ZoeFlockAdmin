import CryptoJS from 'crypto-js';
import { config } from './config';

/**
 * Simple client-side encryption utility
 * Note: This is for non-sensitive data only. Never encrypt sensitive information client-side.
 */

export interface EncryptionResult {
  encrypted: string;
  iv: string;
}

/**
 * Encrypt data using AES encryption
 * @param data - Data to encrypt
 * @returns Encrypted data as string
 */
export const encrypt = (data: any): string => {
  try {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, config.encryption.key).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
};

/**
 * Decrypt data using AES encryption
 * @param encryptedData - Encrypted data string
 * @returns Decrypted data
 */
export const decrypt = <T = any>(encryptedData: string): T => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, config.encryption.key);
    const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedString);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
};

/**
 * Encrypt and store data in localStorage
 * @param key - Storage key
 * @param data - Data to encrypt and store
 */
export const encryptAndStore = (key: string, data: any): void => {
  try {
    const encryptedData = encrypt(data);
    localStorage.setItem(key, encryptedData);
  } catch (error) {
    console.error('Failed to encrypt and store data:', error);
    throw error;
  }
};

/**
 * Retrieve and decrypt data from localStorage
 * @param key - Storage key
 * @returns Decrypted data or null if not found
 */
export const retrieveAndDecrypt = <T = any>(key: string): T | null => {
  try {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;
    return decrypt<T>(encryptedData);
  } catch (error) {
    console.error('Failed to retrieve and decrypt data:', error);
    // Remove corrupted data
    localStorage.removeItem(key);
    return null;
  }
};

/**
 * Remove encrypted data from localStorage
 * @param key - Storage key
 */
export const removeEncryptedData = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * Encrypt data using the configured encryption key
 */
export async function encryptUsingCryptoJS(data: string): Promise<EncryptionResult> {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }

  try {
    const encrypted = CryptoJS.AES.encrypt(data, config.encryption.key).toString();
    const iv = CryptoJS.lib.WordArray.random(16).toString();
    return {
      encrypted,
      iv,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using the configured encryption key
 */
export async function decryptUsingCryptoJS(encryptedData: string, iv: string): Promise<string> {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }

  try {
         const decrypted = CryptoJS.AES.decrypt(encryptedData, config.encryption.key).toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt data and return as a single string (encrypted + iv)
 */
export async function encryptToString(data: string): Promise<string> {
  const result = await encryptUsingCryptoJS(data);
  return `${result.encrypted}.${result.iv}`;
}

/**
 * Decrypt data from a single string (encrypted + iv)
 */
export async function decryptFromString(encryptedString: string): Promise<string> {
  const [encrypted, iv] = encryptedString.split('.');
  if (!encrypted || !iv) {
    throw new Error('Invalid encrypted string format');
  }
  return decryptUsingCryptoJS(encrypted, iv);
}

/**
 * Check if encryption is available
 */
export function isEncryptionAvailable(): boolean {
  return Boolean(config.encryption.key && typeof crypto !== 'undefined');
}

/**
 * Hash a string using SHA-256 (one-way, cannot be decrypted)
 */
export async function hash(data: string): Promise<string> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
} 