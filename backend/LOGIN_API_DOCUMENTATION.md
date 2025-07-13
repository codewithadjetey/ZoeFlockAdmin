# Login API Documentation

## Overview

The login API has been enhanced to return comprehensive user information along with authentication tokens. This provides a complete user profile that can be used immediately after login without additional API calls.

## Endpoint

```
POST /api/v1/auth/login
```

## Request

### Headers
```
Content-Type: application/json
```

### Body
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

## Response

### Success Response (200)
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
          "permissions": [
            {
              "id": 1,
              "name": "manage_users",
              "display_name": "Manage Users",
              "description": "Can manage all users"
            }
          ]
        }
      ],
      "permissions": [
        {
          "id": 1,
          "name": "manage_users",
          "display_name": "Manage Users",
          "description": "Can manage all users"
        }
      ],
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

### Error Responses

#### Invalid Credentials (401)
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

#### Validation Errors (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."],
    "password": ["The password field is required."]
  }
}
```

#### Deactivated Account (401)
```json
{
  "success": false,
  "message": "Account is deactivated"
}
```

## User Data Fields

### Basic Information
- `id`: User's unique identifier
- `name`: User's full name
- `email`: User's email address
- `phone`: User's phone number (optional)
- `address`: User's address (optional)
- `date_of_birth`: User's date of birth (optional)
- `gender`: User's gender (male/female/other, optional)
- `profile_picture`: URL to user's profile picture (optional)

### Status Fields
- `is_active`: Whether the user account is active
- `email_verified_at`: When the email was verified (optional)
- `created_at`: When the account was created
- `updated_at`: When the account was last updated

### Role and Permission Information
- `roles`: Array of user's roles with their permissions
- `permissions`: Array of all user's permissions (including inherited)
- `role_display_name`: Display name of the primary role
- `is_admin`: Whether user has admin role
- `is_pastor`: Whether user has pastor role
- `is_member`: Whether user has member role

### Authentication Data
- `token`: Bearer token for API authentication
- `token_type`: Always "Bearer"
- `expires_in`: Token expiration time in seconds
- `refresh_token`: For future refresh token implementation

## Usage Examples

### Frontend Implementation
```javascript
const login = async (email, password) => {
  const response = await fetch('/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('auth_token', data.data.token);
    
    // Store user data
    localStorage.setItem('user', JSON.stringify(data.data.user));
    
    // Use user information
    const user = data.data.user;
    console.log(`Welcome, ${user.name}!`);
    console.log(`Role: ${user.role_display_name}`);
    console.log(`Permissions: ${user.permissions.map(p => p.name).join(', ')}`);
  }
};
```

### API Authentication
```javascript
// Use the token for subsequent API calls
const token = localStorage.getItem('auth_token');
const response = await fetch('/api/v1/members', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Security Notes

1. **Token Storage**: Store tokens securely, preferably in httpOnly cookies for production
2. **Token Expiration**: Check token expiration and refresh when needed
3. **Logout**: Always call logout endpoint to revoke tokens
4. **HTTPS**: Always use HTTPS in production
5. **Rate Limiting**: The API includes rate limiting for login attempts

## Testing

Run the API tests to verify functionality:
```bash
php artisan test --filter=ApiAuthenticationTest
``` 