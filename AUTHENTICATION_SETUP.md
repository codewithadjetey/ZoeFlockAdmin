# Authentication Setup Guide

## Overview

The Zoe Flock Admin system now has a complete authentication system with proper integration between frontend and backend, removing all mock data.

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
composer install
```

### 2. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

### 3. Database Setup
```bash
php artisan migrate
php artisan db:seed --class=RolePermissionSeeder
php artisan db:seed --class=AdminSeeder
```

### 4. Start Backend Server
```bash
php artisan serve
```

The backend will be available at `http://localhost:8000`

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_API_VERSION=v1
```

### 3. Start Frontend Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Test Users

After running the seeders, the following test users are available:

### Admin User
- **Email**: admin@zoeflock.com
- **Password**: admin123
- **Role**: Administrator (Full access)

### Pastor User
- **Email**: pastor@zoeflock.com
- **Password**: pastor123
- **Role**: Pastor (Limited administrative access)

### Member User
- **Email**: member@zoeflock.com
- **Password**: member123
- **Role**: Member (Basic access)

## API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout (requires authentication)
- `GET /api/v1/auth/profile` - Get user profile (requires authentication)
- `PUT /api/v1/auth/profile` - Update user profile (requires authentication)
- `PUT /api/v1/auth/change-password` - Change password (requires authentication)
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Response Format
All authentication endpoints return a consistent response format:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "address": "123 Church St",
      "date_of_birth": "1990-01-01",
      "gender": "male",
      "profile_picture": null,
      "is_active": true,
      "email_verified_at": "2023-01-01T00:00:00.000000Z",
      "created_at": "2023-01-01T00:00:00.000000Z",
      "updated_at": "2023-01-01T00:00:00.000000Z",
      "roles": [
        {
          "id": 1,
          "name": "admin",
          "display_name": "Administrator",
          "description": "Full system access",
          "permissions": [...]
        }
      ],
      "permissions": [...],
      "role_display_name": "Administrator",
      "is_admin": true,
      "is_pastor": false,
      "is_member": false
    },
    "token": "1|abc123def456ghi789...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": null
  }
}
```

## Frontend Authentication

### AuthContext
The frontend uses a React Context for authentication state management:

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

### Features
- **Automatic Token Management**: Tokens are automatically stored and included in API requests
- **Encrypted Storage**: User data is encrypted before storing in localStorage
- **Error Handling**: Comprehensive error handling for all authentication operations
- **Loading States**: Proper loading states for all async operations

### Login Example
```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    await login(email, password);
    // Redirect to dashboard or handle success
  } catch (error) {
    // Handle error
    console.error('Login failed:', error.message);
  }
};
```

## Security Features

### Backend Security
- **Laravel Sanctum**: Token-based authentication
- **Role-based Access Control**: Spatie Laravel Permission package
- **Password Hashing**: Secure password hashing with bcrypt
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Rate Limiting**: Built-in rate limiting for login attempts

### Frontend Security
- **Encrypted Storage**: User data encrypted before localStorage storage
- **Token Management**: Automatic token inclusion in API requests
- **Secure Logout**: Proper token revocation on logout
- **Error Handling**: Secure error handling without exposing sensitive data

## Testing

### Backend Tests
Run the authentication tests:
```bash
cd backend
php artisan test --filter=ApiAuthenticationTest
```

### Manual Testing
1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000/auth/login`
3. Use the test credentials to log in
4. Verify that the user is redirected to the dashboard
5. Check that the user data is properly displayed
6. Test logout functionality

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS configuration allows requests from the frontend domain
2. **Token Issues**: Check that tokens are being properly stored and included in requests
3. **Database Issues**: Ensure migrations and seeders have been run
4. **Environment Variables**: Verify that all environment variables are properly set

### Debug Steps
1. Check browser console for errors
2. Verify API endpoints are accessible
3. Check network tab for failed requests
4. Verify database connection and seeded data
5. Check environment configuration

## API Documentation

For detailed API documentation, visit:
- **Swagger UI**: `http://localhost:8000/api/documentation`
- **API Info**: `http://localhost:8000/api/v1/info`
- **Health Check**: `http://localhost:8000/api/v1/health`

## Migration from Mock Data

The following changes were made to remove mock data:

### Removed Files
- `frontend/src/hooks/useAuth.ts` (deprecated mock authentication)

### Updated Files
- `frontend/src/contexts/AuthContext.tsx` - Real API integration
- `frontend/src/utils/constants.ts` - Removed DEMO_CREDENTIALS
- `church-template/js/auth.js` - Real API integration
- `frontend/src/utils/config.ts` - Updated API URLs for development

### Backend Enhancements
- Complete authentication API with proper response format
- Role and permission system
- Test users for different roles
- Comprehensive API documentation
- Proper error handling and validation 