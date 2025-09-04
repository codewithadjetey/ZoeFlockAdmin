# Route-Level Permission Implementation

This document describes the route-level permission implementation that has been applied to the ZoeFlockAdmin API routes.

## Overview

All API routes have been updated to include appropriate permission middleware based on the endpoint permission mapping. This ensures that every protected route requires the user to have the specific permission needed to access that endpoint.

## Implementation Details

### Route Structure

All routes are structured with the following pattern:
```php
Route::get('/endpoint', [Controller::class, 'method'])->middleware('permission:permission-name');
```

### Permission Middleware

The `permission` middleware is applied to each route with the specific permission required for that action. The middleware will:

1. Check if the user is authenticated (via `auth:sanctum`)
2. Verify that the authenticated user has the required permission
3. Allow access if permission is granted, or return a 403 Forbidden response if not

### Route Groups

Routes are organized into logical groups with proper middleware stacking:

```php
Route::middleware('auth:sanctum')->group(function () {
    // All authenticated routes with individual permissions
});
```

## Implemented Route Categories

### Authentication Routes
- **Public routes**: login, register, forgot-password, etc. (no permissions required)
- **Protected routes**: profile management, logout (requires specific permissions)

### Core Management Routes
- **Members**: view-members, create-members, edit-members, delete-members, etc.
- **Users**: view-users, create-users, edit-users, delete-users, etc.
- **Roles**: view-roles, create-roles, edit-roles, delete-roles, etc.
- **Groups**: view-groups, create-groups, edit-groups, delete-groups, etc.
- **Families**: view-families, create-families, edit-families, delete-families, etc.

### Event Management Routes
- **Events**: view-events, create-events, edit-events, delete-events, etc.
- **Event Categories**: view-event-categories, create-event-categories, etc.
- **Attendance**: get-event-attendance, update-attendance-status, etc.

### Financial Management Routes
- **Income**: view-incomes, create-incomes, edit-incomes, delete-incomes
- **Income Categories**: view-income-categories, create-income-categories, etc.
- **Expenses**: view-expenses, create-expenses, edit-expenses, delete-expenses
- **Expense Categories**: view-expense-categories, create-expense-categories, etc.
- **Tithes**: view-tithes, create-tithes, edit-tithes, delete-tithes, etc.
- **Tithe Payments**: view-tithe-payments, create-tithe-payments, etc.

### Partnership Management Routes
- **Partnerships**: view-partnerships, create-partnerships, edit-partnerships, etc.
- **Partnership Categories**: view-partnership-categories, create-partnership-categories, etc.

### System Management Routes
- **Files**: upload-files, view-files, delete-files, etc.
- **Imports**: view-imports, process-import, download-import-sample, etc.
- **Backups**: view-backups, create-backups, restore-backups, etc.
- **Reports**: get-income-report, get-expense-report, export-report, etc.

## Permission Examples

### Member Management
```php
Route::prefix('members')->group(function () {
    Route::get('/', [MemberController::class, 'index'])->middleware('permission:view-members');
    Route::post('/', [MemberController::class, 'store'])->middleware('permission:create-members');
    Route::get('/{member}', [MemberController::class, 'show'])->middleware('permission:view-members');
    Route::put('/{member}', [MemberController::class, 'update'])->middleware('permission:edit-members');
    Route::delete('/{member}', [MemberController::class, 'destroy'])->middleware('permission:delete-members');
});
```

### Financial Management
```php
Route::prefix('tithes')->group(function () {
    Route::get('/', [TitheController::class, 'index'])->middleware('permission:view-tithes');
    Route::post('/', [TitheController::class, 'store'])->middleware('permission:create-tithes');
    Route::get('/statistics', [TitheController::class, 'statistics'])->middleware('permission:view-tithe-statistics');
    Route::post('/{tithe}/mark-paid', [TitheController::class, 'markAsPaid'])->middleware('permission:mark-tithe-paid');
});
```

## Benefits

1. **Fine-grained Access Control**: Each route requires specific permissions
2. **Security**: Unauthorized access is prevented at the route level
3. **Maintainability**: Permissions are clearly defined and easy to update
4. **Consistency**: All routes follow the same permission pattern
5. **Documentation**: Routes and their required permissions are self-documenting

## Testing

To test the permission implementation:

1. Create test users with different roles and permissions
2. Attempt to access various endpoints with different user accounts
3. Verify that users without proper permissions receive 403 Forbidden responses
4. Verify that users with proper permissions can access endpoints successfully

## Routes File Updates

The main changes made to `routes/api.php`:

1. Added permission middleware to all protected routes
2. Organized routes into logical groups
3. Added proper controller imports
4. Maintained existing route structure while adding security

## Integration with Existing Permission System

This implementation integrates seamlessly with the existing permission system:

- Uses the same permission names defined in the permission seeder
- Works with the existing role-permission assignments
- Compatible with the existing permission middleware
- Follows the permission mapping documentation

## Maintenance

When adding new routes:

1. Determine the appropriate permission name
2. Add the permission to the seeder if it doesn't exist
3. Apply the permission middleware to the route
4. Update role permissions as needed
5. Test access with different user roles

## Next Steps

1. Test all routes with different user permissions
2. Update any missing permissions in the seeder
3. Assign permissions to appropriate roles
4. Document any custom permission logic in controllers
5. Consider implementing route-specific permission policies for complex scenarios 