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
 * Encrypt data using the configured encryption key
 */
export async function encrypt(data: string): Promise<EncryptionResult> {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }

  try {
    // Convert the encryption key to a CryptoKey
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(config.encryption.key),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      keyMaterial,
      new TextEncoder().encode(data)
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv)),
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt data using the configured encryption key
 */
export async function decrypt(encryptedData: string, iv: string): Promise<string> {
  if (!config.encryption.key) {
    throw new Error('Encryption key not configured');
  }

  try {
    // Convert the encryption key to a CryptoKey
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(config.encryption.key),
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    // Convert base64 strings back to Uint8Array
    const encryptedBytes = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    const ivBytes = new Uint8Array(
      atob(iv).split('').map(char => char.charCodeAt(0))
    );

    // Decrypt the data
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      keyMaterial,
      encryptedBytes
    );

    return new TextDecoder().decode(decrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Encrypt data and return as a single string (encrypted + iv)
 */
export async function encryptToString(data: string): Promise<string> {
  const result = await encrypt(data);
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
  return decrypt(encrypted, iv);
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