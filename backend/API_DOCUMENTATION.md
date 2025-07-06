# Zoe Flock Admin API Documentation

## Overview

The Zoe Flock Admin API is a comprehensive RESTful API for church management systems. It provides endpoints for managing members, events, donations, communications, and more.

## Quick Start

### Accessing the Documentation

1. **Swagger UI**: Visit `http://localhost:8000/api/documentation` for interactive API documentation
2. **API Info**: Visit `http://localhost:8000/api/v1/info` for basic API information
3. **Health Check**: Visit `http://localhost:8000/api/v1/health` for API health status

### Base URL

```
http://localhost:8000/api/v1
```

## Authentication

The API uses Laravel Sanctum for authentication with Bearer tokens.

### Getting a Token

1. Register a new user:
   ```bash
   POST /api/v1/auth/register
   ```

2. Login to get a token:
   ```bash
   POST /api/v1/auth/login
   ```

3. Use the token in subsequent requests:
   ```bash
   Authorization: Bearer {your_token}
   ```

## Available Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user (requires authentication)
- `GET /auth/profile` - Get user profile (requires authentication)
- `PUT /auth/profile` - Update user profile (requires authentication)
- `PUT /auth/change-password` - Change password (requires authentication)
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password

### Members
- `GET /members` - List all members (requires authentication)
- `POST /members` - Create a new member (requires authentication)
- `GET /members/{id}` - Get member details (requires authentication)
- `PUT /members/{id}` - Update member (requires authentication)
- `DELETE /members/{id}` - Delete member (requires authentication)
- `GET /members/statistics` - Get member statistics (requires authentication)

### Documentation
- `GET /info` - Get API information
- `GET /health` - Get API health status

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

## Error Handling

Errors are returned with appropriate HTTP status codes:

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

Error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Validation errors (if applicable)
  }
}
```

## Development

### Regenerating Documentation

To regenerate the Swagger documentation after making changes:

```bash
php artisan l5-swagger:generate
```

### Configuration

Swagger configuration is located in `config/l5-swagger.php`. Key settings:

- `generate_always` - Set to `true` in development to regenerate docs on each request
- `ui.dark_mode` - Enable dark mode for the documentation UI
- `ui.doc_expansion` - Control default expansion of documentation sections

### Environment Variables

Add these to your `.env` file:

```env
# Swagger Configuration
L5_SWAGGER_GENERATE_ALWAYS=true
L5_SWAGGER_UI_DARK_MODE=true
L5_SWAGGER_UI_DOC_EXPANSION=list
L5_SWAGGER_UI_FILTERS=true
```

## Testing the API

### Using Swagger UI

1. Visit `http://localhost:8000/api/documentation`
2. Click "Authorize" and enter your Bearer token
3. Try out any endpoint directly from the documentation

### Using curl

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Use the token
curl -X GET http://localhost:8000/api/v1/members \
  -H "Authorization: Bearer {your_token}"
```

### Using Postman

1. Import the API documentation
2. Set the base URL to `http://localhost:8000/api/v1`
3. Add the Authorization header with your Bearer token

## Features

- **Interactive Documentation**: Try endpoints directly from the Swagger UI
- **Authentication**: Secure API with Bearer token authentication
- **Validation**: Comprehensive input validation with detailed error messages
- **Pagination**: Paginated responses for list endpoints
- **Search & Filtering**: Advanced search and filtering capabilities
- **Role-based Access**: Different permissions for different user roles

## Support

For API support or questions:
- Email: support@zoeflock.com
- Documentation: `http://localhost:8000/api/documentation`
- Health Check: `http://localhost:8000/api/v1/health` 