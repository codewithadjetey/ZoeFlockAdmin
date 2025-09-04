# 403 Error Handling System

This document describes the 403 (Forbidden) error handling system implemented in the ZoeFlockAdmin frontend application.

## Overview

When a user attempts to access a resource they don't have permission for, the system automatically redirects them to a dedicated "Forbidden" page that provides clear information about the missing permission and offers helpful actions.

## Implementation Components

### 1. **Forbidden Page** - `/forbidden`
- **Location**: `frontend/src/app/forbidden/page.tsx`
- **Purpose**: Displays a user-friendly error page when access is denied
- **Features**:
  - Shows the specific missing permission
  - Displays the requested URL
  - Provides helpful action buttons
  - Includes contact administrator functionality

### 2. **Error Handler Hook** - `useErrorHandler`
- **Location**: `frontend/src/hooks/useErrorHandler.ts`
- **Purpose**: Sets up axios interceptor error handling for 403 errors
- **Features**:
  - Captures 403 errors from API calls
  - Extracts missing permission information
  - Redirects to forbidden page with query parameters

### 3. **Error Handler Wrapper** - `ErrorHandlerWrapper`
- **Location**: `frontend/src/components/ErrorHandlerWrapper.tsx`
- **Purpose**: Wraps the application to provide error handling context
- **Features**:
  - Initializes error handler on app load
  - Provides Next.js router context for navigation

### 4. **Axios Interceptor** - Updated API utils
- **Location**: `frontend/src/utils/api.ts`
- **Purpose**: Intercepts API responses and handles 403 errors
- **Features**:
  - Shows toast notification for 403 errors
  - Triggers custom error handler for navigation
  - Falls back to window.location if needed

## How It Works

### 1. **API Call Flow**
```
User Action → API Call → 403 Response → Axios Interceptor → Error Handler → Forbidden Page
```

### 2. **Error Handling Process**
1. User makes an API call to a protected endpoint
2. Backend returns 403 with permission information
3. Axios interceptor catches the 403 response
4. Shows toast notification to user
5. Error handler extracts permission and URL details
6. Redirects to `/forbidden?permission=xxx&url=xxx`
7. Forbidden page displays helpful information

### 3. **Forbidden Page Features**
- **Permission Information**: Shows exactly which permission is missing
- **URL Context**: Displays what the user was trying to access
- **Action Buttons**:
  - Go to Dashboard
  - Go Back (browser history)
  - Contact Administrator (pre-filled email)
- **Error Code**: Displays 403 Forbidden for clarity

## Code Examples

### Error Handler Setup
```typescript
// In ErrorHandlerWrapper.tsx
export function ErrorHandlerWrapper({ children }: ErrorHandlerWrapperProps) {
  useErrorHandler(); // Sets up 403 error handling
  return <>{children}</>;
}
```

### Axios Interceptor
```typescript
// In api.ts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      toast.error('You do not have permission to access this resource');
      
      if (errorHandler) {
        errorHandler(error); // Custom handler for navigation
      }
    }
    return Promise.reject(error);
  }
);
```

### Forbidden Page
```typescript
// In forbidden/page.tsx
export default function ForbiddenPage() {
  const searchParams = useSearchParams();
  const missingPermission = searchParams.get('permission');
  const requestedUrl = searchParams.get('url');
  
  // Display permission information and helpful actions
}
```

## User Experience

### Before Implementation
- User gets generic 403 error
- No clear information about what's missing
- Difficult to request proper permissions
- Poor user experience

### After Implementation
- User sees clear permission information
- Knows exactly what they need to request
- Easy contact administrator functionality
- Helpful navigation options
- Professional error page design

## Permission Descriptions

The forbidden page includes descriptions for common permissions:

- `view-members`: View member information and profiles
- `create-members`: Add new members to the system
- `edit-members`: Modify existing member information
- `delete-members`: Remove members from the system
- `view-events`: View event details and schedules
- `create-events`: Create new events
- `edit-events`: Modify existing events
- `delete-events`: Remove events from the system
- `view-tithes`: View tithe records and reports
- `create-tithes`: Record new tithe payments
- `edit-tithes`: Modify tithe records
- `delete-tithes`: Remove tithe records
- `view-users`: View user accounts and profiles
- `create-users`: Create new user accounts
- `edit-users`: Modify user account settings
- `delete-users`: Remove user accounts
- `view-roles`: View role definitions and permissions
- `create-roles`: Create new roles
- `edit-roles`: Modify role permissions
- `delete-roles`: Remove roles from the system

## Configuration

### Toast Notifications
- Uses react-toastify for user notifications
- Shows error message immediately
- Configurable position and duration

### Email Contact
- Pre-fills email with permission request details
- Includes missing permission and requested URL
- Sends to admin@zoeflock.com (configurable)

### Navigation Options
- Dashboard redirect: Takes user to main dashboard
- Go back: Uses browser history
- Contact admin: Opens email client

## Testing

### Manual Testing
1. **Login with limited permissions**
2. **Try to access protected endpoints**
3. **Verify 403 redirects to forbidden page**
4. **Check permission information display**
5. **Test action buttons functionality**

### Test Cases
- [ ] 403 error from API call
- [ ] Permission information extraction
- [ ] URL parameter passing
- [ ] Toast notification display
- [ ] Navigation to forbidden page
- [ ] Action button functionality
- [ ] Email contact form
- [ ] Permission descriptions
- [ ] Responsive design

## Future Enhancements

1. **Permission Request System**: Built-in permission request workflow
2. **Admin Notification**: Real-time notification to admins about permission requests
3. **Permission History**: Track permission requests and approvals
4. **Custom Error Pages**: Different pages for different error types
5. **Analytics**: Track permission denials and user behavior
6. **Auto-approval**: Automatic approval for certain permission types
7. **Permission Suggestions**: Suggest similar permissions user might need

## Best Practices

1. **Clear Communication**: Always explain what permission is missing
2. **Helpful Actions**: Provide clear next steps for users
3. **Professional Design**: Make error pages look professional
4. **Accessibility**: Ensure error pages are accessible
5. **Logging**: Log permission denials for security monitoring
6. **User Education**: Help users understand the permission system 