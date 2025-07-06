# Environment Configuration

This document explains how to configure environment variables for the ZoeFlock Admin frontend application.

## Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Update the values in `.env.local` according to your environment.

## Environment Variables

### API Configuration
- `NEXT_PUBLIC_API_URL`: Base URL for the Laravel API (default: `http://zoeflockadmin.org/api/v1`)
- `NEXT_PUBLIC_API_VERSION`: API version (default: `v1`)

### Assets Configuration
- `NEXT_PUBLIC_ASSETS_URL`: Base URL for static assets (default: `http://zoeflockadmin.org/assets`)
- `NEXT_PUBLIC_CDN_URL`: CDN URL for optimized assets (default: `http://cdn.zoeflockadmin.org`)

### Encryption Configuration
- `NEXT_PUBLIC_ENCRYPTION_KEY`: Encryption key for client-side encryption
- `NEXT_PUBLIC_ENCRYPTION_ALGORITHM`: Encryption algorithm (default: `AES-256-GCM`)

### Application Configuration
- `NEXT_PUBLIC_APP_NAME`: Application name (default: `ZoeFlock Admin`)
- `NEXT_PUBLIC_APP_VERSION`: Application version (default: `1.0.0`)
- `NEXT_PUBLIC_APP_ENV`: Environment (development/production)

### Feature Flags
- `NEXT_PUBLIC_ENABLE_ANALYTICS`: Enable analytics (default: `false`)
- `NEXT_PUBLIC_ENABLE_DEBUG_MODE`: Enable debug mode (default: `true`)
- `NEXT_PUBLIC_DEV_MODE`: Development mode (default: `true`)
- `NEXT_PUBLIC_MOCK_API`: Use mock API (default: `false`)

### External Services
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID`: Google Analytics ID

## Usage in Code

Import the configuration utility:

```typescript
import { config, getApiUrl, getAssetUrl, isDevelopment } from '@/utils/config';

// Access configuration values
const apiUrl = config.api.baseUrl;
const appName = config.app.name;

// Use helper functions
const endpointUrl = getApiUrl('/members');
const imageUrl = getAssetUrl('/images/logo.png');

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}
```

## Available Helper Functions

- `getApiUrl(endpoint)`: Get full API URL with version
- `getAssetUrl(path)`: Get asset URL
- `getCdnUrl(path)`: Get CDN URL
- `isDevelopment()`: Check if running in development
- `isDebugMode()`: Check if debug mode is enabled
- `isAnalyticsEnabled()`: Check if analytics is enabled

## Security Notes

- All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the client
- Never store sensitive information (passwords, private keys) in client-side environment variables
- The encryption key should be used only for client-side encryption of non-sensitive data

## Environment Files Priority

Next.js loads environment files in this order (first takes precedence):
1. `.env.local` (loaded in all environments except test)
2. `.env.development` (when NODE_ENV is development)
3. `.env.production` (when NODE_ENV is production)
4. `.env` (loaded in all environments)

## Example Configuration

```bash
# Development
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_ENABLE_DEBUG_MODE=true

# Production
NEXT_PUBLIC_API_URL=https://api.zoeflockadmin.org/api/v1
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_ENABLE_DEBUG_MODE=false
NEXT_PUBLIC_ENABLE_ANALYTICS=true
``` 