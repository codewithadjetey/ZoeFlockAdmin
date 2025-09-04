# API Endpoint Permission Mapping

This document maps all API endpoints to their corresponding permissions in the system. This ensures that every endpoint has proper permission controls.

## Authentication Endpoints

### Public Endpoints (No Authentication Required)
- `POST /api/v1/auth/register` → `register`
- `POST /api/v1/auth/login` → `login`
- `POST /api/v1/auth/forgot-password` → `forgot-password`
- `POST /api/v1/auth/reset-password` → `reset-password`
- `POST /api/v1/auth/send-verification-email` → `send-verification-email`
- `POST /api/v1/auth/verify-email` → `verify-email`

### Protected Endpoints (Authentication Required)
- `POST /api/v1/auth/logout` → `logout`
- `GET /api/v1/auth/profile` → `view-profile`
- `PUT /api/v1/auth/profile` → `edit-profile`
- `PUT /api/v1/auth/change-password` → `change-password`
- `POST /api/v1/auth/resend-verification-email` → `resend-verification-email`

## Documentation Endpoints

### Public Endpoints
- `GET /api/v1/info` → `view-api-info`
- `GET /api/v1/health` → `view-api-health`

## Frontend Endpoints (Public)

### Public Endpoints
- `POST /api/v1/frontend/first-timer` → `create-first-timer-guest`
- `GET /api/v1/frontend/event-category/{id}` → `get-today-event`

## User Management Endpoints

### Protected Endpoints
- `GET /api/v1/users` → `view-users`
- `POST /api/v1/users` → `create-users`
- `GET /api/v1/users/statistics` → `view-users` (uses same permission)
- `GET /api/v1/users/{user}` → `view-users`
- `PUT /api/v1/users/{user}` → `edit-users`
- `DELETE /api/v1/users/{user}` → `delete-users`
- `PUT /api/v1/users/{user}/password` → `change-user-password`
- `PUT /api/v1/users/{user}/toggle-status` → `toggle-user-status`

## Member Management Endpoints

### Protected Endpoints
- `GET /api/v1/members` → `view-members`
- `POST /api/v1/members` → `create-members`
- `GET /api/v1/members/statistics` → `view-member-statistics`
- `GET /api/v1/members/{member}` → `view-members`
- `PUT /api/v1/members/{member}` → `edit-members`
- `DELETE /api/v1/members/{member}` → `delete-members`
- `GET /api/v1/members/{member}/groups` → `manage-member-groups`
- `POST /api/v1/members/{member}/groups` → `manage-member-groups`
- `DELETE /api/v1/members/{member}/groups` → `manage-member-groups`
- `PUT /api/v1/members/{member}/groups/{group_id}` → `update-member-group-role`
- `POST /api/v1/members/{member}/create-user-account` → `create-user-account`

## Group Management Endpoints

### Protected Endpoints
- `GET /api/v1/groups` → `view-groups`
- `POST /api/v1/groups` → `create-groups`
- `GET /api/v1/groups/{id}` → `view-groups`
- `PUT /api/v1/groups/{id}` → `edit-groups`
- `DELETE /api/v1/groups/{id}` → `delete-groups`
- `GET /api/v1/groups/statistics/overall` → `view-group-overall-stats`
- `GET /api/v1/groups/statistics/needing-attention` → `view-groups-needing-attention`
- `POST /api/v1/groups/search` → `search-groups`
- `POST /api/v1/groups/bulk-update-status` → `bulk-update-group-status`
- `GET /api/v1/groups/{id}/members` → `manage-group-members`
- `POST /api/v1/groups/{id}/members` → `manage-group-members`
- `DELETE /api/v1/groups/{id}/members/{member_id}` → `manage-group-members`
- `PUT /api/v1/groups/{id}/members/{member_id}/role` → `update-group-member-role`
- `GET /api/v1/groups/{id}/statistics` → `view-group-statistics`

## Family Management Endpoints

### Protected Endpoints
- `GET /api/v1/families` → `view-families`
- `POST /api/v1/families` → `create-families`
- `GET /api/v1/families/{id}` → `view-families`
- `PUT /api/v1/families/{id}` → `edit-families`
- `DELETE /api/v1/families/{id}` → `delete-families`
- `GET /api/v1/families/{id}/members` → `manage-family-members`
- `POST /api/v1/families/{id}/members` → `manage-family-members`
- `DELETE /api/v1/families/{id}/members/{member_id}` → `manage-family-members`
- `GET /api/v1/families/{id}/events` → `get-family-events`
- `GET /api/v1/families/my-family` → `get-my-family`
- `GET /api/v1/families/statistics` → `get-family-statistics`

## Event Management Endpoints

### Protected Endpoints
- `GET /api/v1/events` → `view-events`
- `POST /api/v1/events` → `create-events`
- `GET /api/v1/events/{event}` → `view-events`
- `PUT /api/v1/events/{event}` → `edit-events`
- `DELETE /api/v1/events/{event}` → `delete-events`
- `POST /api/v1/events/{event}/cancel` → `cancel-events`
- `POST /api/v1/events/{event}/publish` → `publish-events`
- `GET /api/v1/events/{event}/families` → `manage-event-families`
- `POST /api/v1/events/{event}/families` → `manage-event-families`
- `PUT /api/v1/events/{event}/families/{family_id}` → `manage-event-families`
- `DELETE /api/v1/events/{event}/families/{family_id}` → `manage-event-families`
- `GET /api/v1/events/{event}/groups` → `manage-event-groups`
- `POST /api/v1/events/{event}/groups` → `manage-event-groups`
- `PUT /api/v1/events/{event}/groups/{group_id}` → `manage-event-groups`
- `DELETE /api/v1/events/{event}/groups/{group_id}` → `manage-event-groups`
- `GET /api/v1/events/member/{memberId}` → `view-member-events`

## Event Category Management Endpoints

### Protected Endpoints
- `GET /api/v1/event-categories` → `view-event-categories`
- `POST /api/v1/event-categories` → `create-event-categories`
- `GET /api/v1/event-categories/{category}` → `view-event-categories`
- `PUT /api/v1/event-categories/{category}` → `edit-event-categories`
- `DELETE /api/v1/event-categories/{category}` → `delete-event-categories`
- `GET /api/v1/event-categories/{category}/events` → `view-category-events`
- `POST /api/v1/event-categories/{category}/generate-events` → `generate-category-events`
- `POST /api/v1/event-categories/{category}/generate-one-time-event` → `generate-one-time-event`
- `POST /api/v1/event-categories/{category}/toggle-status` → `toggle-category-status`
- `GET /api/v1/event-categories/{category}/statistics` → `view-category-statistics`

## Attendance Management Endpoints

### Protected Endpoints
- `GET /api/v1/attendance/statistics/individual` → `get-individual-statistics`
- `POST /api/v1/attendance/scan-member-id` → `scan-member-id`
- `GET /api/v1/members/{memberId}/identification-id` → `get-member-identification-id`
- `POST /api/v1/members/{memberId}/generate-identification-id` → `generate-member-identification-id`

### Event-Specific Attendance Endpoints
- `GET /api/v1/events/{event}/attendance` → `get-event-attendance`
- `GET /api/v1/events/{event}/attendance/eligible-members` → `get-eligible-members`
- `PUT /api/v1/events/{event}/attendance/{memberId}/status` → `update-attendance-status`
- `POST /api/v1/events/{event}/attendance/{memberId}/check-in` → `mark-check-in`
- `POST /api/v1/events/{event}/attendance/{memberId}/check-out` → `mark-check-out`
- `POST /api/v1/events/{event}/attendance/bulk-update` → `bulk-update-attendance`
- `POST /api/v1/events/{event}/attendance/ensure-records` → `ensure-attendance-records`

## General Attendance Endpoints

### Protected Endpoints
- `GET /api/v1/general-attendance/event/{eventId}` → `get-event-general-attendance`
- `POST /api/v1/general-attendance/event/{eventId}` → `update-general-attendance`
- `GET /api/v1/general-attendance/analytics` → `get-attendance-analytics`
- `GET /api/v1/general-attendance/summary` → `get-general-attendance-summary`
- `GET /api/v1/general-attendance/statistics` → `get-general-attendance-statistics`
- `GET /api/v1/general-attendance/test` → `get-general-attendance-statistics` (uses same permission)
- `GET /api/v1/general-attendance/families` → `get-general-attendance-families`

## First Timer Management Endpoints

### Protected Endpoints
- `GET /api/v1/first-timers` → `view-first-timers`
- `POST /api/v1/first-timers` → `create-first-timers`
- `GET /api/v1/first-timers/{firstTimer}` → `view-first-timers`
- `PUT /api/v1/first-timers/{firstTimer}` → `edit-first-timers`
- `DELETE /api/v1/first-timers/{firstTimer}` → `delete-first-timers`

## File Management Endpoints

### Protected Endpoints
- `POST /api/v1/files/upload` → `upload-files`
- `POST /api/v1/files/upload-multiple` → `upload-multiple-files`
- `GET /api/v1/files/by-model` → `get-files-by-model`
- `GET /api/v1/files/{token}` → `view-files`
- `DELETE /api/v1/files/{token}` → `delete-files`

## Income Management Endpoints

### Protected Endpoints
- `GET /api/v1/incomes` → `view-incomes`
- `POST /api/v1/incomes` → `create-incomes`
- `GET /api/v1/incomes/{income}` → `view-incomes`
- `PUT /api/v1/incomes/{income}` → `edit-incomes`
- `DELETE /api/v1/incomes/{income}` → `delete-incomes`

## Income Category Management Endpoints

### Protected Endpoints
- `GET /api/v1/income-categories` → `view-income-categories`
- `POST /api/v1/income-categories` → `create-income-categories`
- `GET /api/v1/income-categories/{incomeCategory}` → `view-income-categories`
- `PUT /api/v1/income-categories/{incomeCategory}` → `edit-income-categories`
- `DELETE /api/v1/income-categories/{incomeCategory}` → `delete-income-categories`

## Expense Management Endpoints

### Protected Endpoints
- `GET /api/v1/expenses` → `view-expenses`
- `POST /api/v1/expenses` → `create-expenses`
- `GET /api/v1/expenses/{expense}` → `view-expenses`
- `PUT /api/v1/expenses/{expense}` → `edit-expenses`
- `DELETE /api/v1/expenses/{expense}` → `delete-expenses`

## Expense Category Management Endpoints

### Protected Endpoints
- `GET /api/v1/expense-categories` → `view-expense-categories`
- `POST /api/v1/expense-categories` → `create-expense-categories`
- `GET /api/v1/expense-categories/{expenseCategory}` → `view-expense-categories`
- `PUT /api/v1/expense-categories/{expenseCategory}` → `edit-expense-categories`
- `DELETE /api/v1/expense-categories/{expenseCategory}` → `delete-expense-categories`

## Partnership Management Endpoints

### Protected Endpoints
- `GET /api/v1/partnerships` → `view-partnerships`
- `POST /api/v1/partnerships` → `create-partnerships`
- `GET /api/v1/partnerships/{partnership}` → `view-partnerships`
- `PUT /api/v1/partnerships/{partnership}` → `edit-partnerships`
- `DELETE /api/v1/partnerships/{partnership}` → `delete-partnerships`
- `POST /api/v1/partnerships/{id}/generate-schedule` → `generate-partnership-schedule`

## Partnership Category Management Endpoints

### Protected Endpoints
- `GET /api/v1/partnership-categories` → `view-partnership-categories`
- `POST /api/v1/partnership-categories` → `create-partnership-categories`
- `GET /api/v1/partnership-categories/{id}` → `view-partnership-categories`
- `PUT /api/v1/partnership-categories/{id}` → `edit-partnership-categories`
- `DELETE /api/v1/partnership-categories/{id}` → `delete-partnership-categories`

## Tithe Management Endpoints

### Protected Endpoints
- `GET /api/v1/tithes` → `view-tithes`
- `POST /api/v1/tithes` → `create-tithes`
- `GET /api/v1/tithes/statistics` → `view-tithe-statistics`
- `GET /api/v1/tithes/monthly-trends` → `view-monthly-trends`
- `GET /api/v1/tithes/member-performance` → `view-member-performance`
- `GET /api/v1/tithes/frequency-analysis` → `view-frequency-analysis`
- `GET /api/v1/tithes/recent-activity` → `view-recent-activity`
- `POST /api/v1/tithes/export` → `export-tithe-report`
- `GET /api/v1/tithes/{tithe}` → `view-tithes`
- `PUT /api/v1/tithes/{tithe}` → `edit-tithes`
- `DELETE /api/v1/tithes/{tithe}` → `delete-tithes`
- `POST /api/v1/tithes/{tithe}/mark-paid` → `mark-tithe-paid`

## Tithe Payment Management Endpoints

### Protected Endpoints
- `GET /api/v1/tithes/{tithe}/payments` → `view-tithe-payments`
- `POST /api/v1/tithes/{tithe}/payments` → `create-tithe-payments`
- `GET /api/v1/tithes/{tithe}/payments/{payment}` → `view-tithe-payments`
- `PUT /api/v1/tithes/{tithe}/payments/{payment}` → `edit-tithe-payments`
- `DELETE /api/v1/tithes/{tithe}/payments/{payment}` → `delete-tithe-payments`

## Reports Management Endpoints

### Protected Endpoints
- `GET /api/v1/reports/income` → `get-income-report`
- `GET /api/v1/reports/expenses` → `get-expense-report`
- `GET /api/v1/reports/comparison` → `get-comparison-report`
- `POST /api/v1/reports/export` → `export-report`
- `GET /api/v1/reports/export/history` → `get-export-history`
- `GET /api/v1/reports/export/{id}/download` → `download-report`
- `DELETE /api/v1/reports/export/{id}` → `delete-export`
- `GET /api/v1/reports/dashboard-summary` → `get-dashboard-summary`
- `GET /api/v1/reports/insights` → `get-financial-insights`
- `GET /api/v1/reports/recent-activity` → `get-recent-activity`

## Import/Export Management Endpoints

### Protected Endpoints
- `GET /api/v1/import` → `view-imports`
- `GET /api/v1/import/sample/{type}` → `download-import-sample`
- `POST /api/v1/import/{type}` → `process-import`
- `GET /api/v1/import/audit-logs` → `get-audit-logs`

## Dashboard Management Endpoints

### Protected Endpoints
- `GET /api/v1/dashboard/data` → `get-dashboard-data`

## Backup Management Endpoints

### Protected Endpoints
- `GET /api/v1/backups` → `view-backups`
- `POST /api/v1/backups` → `create-backups`
- `GET /api/v1/backups/stats` → `view-backup-stats`
- `POST /api/v1/backups/process` → `process-backups`
- `GET /api/v1/backups/{backup}` → `view-backups`
- `GET /api/v1/backups/{backup}/download` → `download-backup`
- `POST /api/v1/backups/{backup}/restore` → `restore-backups`
- `DELETE /api/v1/backups/{backup}` → `delete-backups`

## Role Management Endpoints

### Protected Endpoints
- `GET /api/v1/roles` → `view-roles`
- `POST /api/v1/roles` → `create-roles`
- `GET /api/v1/roles/statistics` → `view-role-statistics`
- `GET /api/v1/roles/permissions` → `view-role-permissions`
- `GET /api/v1/roles/{role}` → `view-roles`
- `PUT /api/v1/roles/{role}` → `edit-roles`
- `DELETE /api/v1/roles/{role}` → `delete-roles`
- `POST /api/v1/roles/{role}/duplicate` → `duplicate-role`

## Entity Management Endpoints

### Protected Endpoints
- `GET /api/v1/entities` → `view-entities`

## Test Endpoints

### Public Endpoints
- `GET /api/v1/test` → No permission required (public test endpoint)

## Notes

1. **Public Endpoints**: These endpoints don't require authentication and are accessible to anyone.
2. **Protected Endpoints**: These endpoints require authentication and specific permissions.
3. **Role-Based Access**: Some endpoints have additional role-based restrictions implemented in the controller methods.
4. **Permission Inheritance**: Some endpoints use the same permission for multiple operations (e.g., view permission for both list and show operations).

## Validation

To validate that all endpoints have corresponding permissions:

1. Run the permission seeder: `php artisan db:seed --class=RolePermissionSeeder`
2. Check that all permissions are properly assigned to roles
3. Test endpoint access with different user roles
4. Verify that unauthorized access is properly blocked

## Missing Permissions

If you find any endpoints that don't have corresponding permissions, add them to the `$permissions` array in `RolePermissionSeeder.php` and assign them to appropriate roles. 