# Backup System Documentation

## Overview

The backup system provides a comprehensive solution for creating, managing, and restoring database backups in the Zoe Flock Admin application. It includes both backend and frontend components with proper permission controls.

## Features

- **Database Backup**: Create SQL dumps of the entire database
- **Full System Backup**: Backup database and files (future implementation)
- **Background Processing**: Backups are processed asynchronously via cron jobs
- **Download Management**: Download completed backups
- **Restore Functionality**: Restore database from backup files
- **Permission Control**: Role-based access control for backup operations
- **Statistics**: View backup statistics and status
- **Auto Cleanup**: Automatic cleanup of old backups

## Architecture

### Backend Components

1. **Backup Model** (`app/Models/Backup.php`)
   - Tracks backup metadata
   - Status management (pending, in_progress, completed, failed)
   - File size and type information

2. **BackupService** (`app/Services/BackupService.php`)
   - Core backup logic
   - Database backup using mysqldump
   - File management and cleanup
   - Statistics generation

3. **BackupController** (`app/Http/Controllers/Api/V1/BackupController.php`)
   - RESTful API endpoints
   - Permission validation
   - Request/response handling

4. **Console Commands**
   - `ProcessBackups`: Process pending backups
   - `CreateBackup`: Create backup requests

### Frontend Components

1. **Backup Service** (`frontend/src/services/backups.ts`)
   - API client for backup operations
   - TypeScript interfaces

2. **Backup Page** (`frontend/src/app/(dashboard)/backups/page.tsx`)
   - Complete backup management interface
   - Statistics dashboard
   - Backup creation and management

## Database Schema

```sql
CREATE TABLE backups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT NULL,
    backup_type ENUM('database', 'full') DEFAULT 'database',
    status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending',
    created_by BIGINT UNSIGNED NULL,
    notes TEXT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_status_created (status, created_at),
    INDEX idx_type_status (backup_type, status),
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

## API Endpoints

### GET /api/v1/backups
List all backups with pagination and filtering.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15)
- `status`: Filter by status (pending, in_progress, completed, failed)
- `type`: Filter by type (database, full)

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 10
  }
}
```

### POST /api/v1/backups
Create a new backup request.

**Request Body:**
```json
{
  "type": "database",
  "notes": "Optional notes"
}
```

### GET /api/v1/backups/{id}
Get backup details.

### GET /api/v1/backups/{id}/download
Get download URL for completed backup.

### POST /api/v1/backups/{id}/restore
Restore database from backup.

### DELETE /api/v1/backups/{id}
Delete backup and associated file.

### GET /api/v1/backups/stats
Get backup statistics.

### POST /api/v1/backups/process
Process pending backups (admin only).

## Permissions

The backup system uses the following permissions:

- `view-backups`: View backup list and details
- `create-backups`: Create new backup requests
- `restore-backups`: Restore database from backup
- `delete-backups`: Delete backup files
- `process-backups`: Process pending backups

### Role Assignments

- **Admin**: All permissions
- **Pastor**: `view-backups`, `create-backups`
- **Family Head**: No backup permissions
- **Member**: No backup permissions

## Configuration

### Environment Variables

```env
# Backup storage
BACKUP_DISK=local
BACKUP_PATH=backups
BACKUP_MAX_COUNT=10

# Database backup
BACKUP_COMPRESS=false

# Notifications
BACKUP_NOTIFY_ON_COMPLETION=true
BACKUP_NOTIFY_ON_FAILURE=true
BACKUP_NOTIFICATION_EMAIL=admin@example.com

# Cron settings
BACKUP_PROCESS_INTERVAL=5
BACKUP_AUTO_CLEANUP=true

# Security
BACKUP_REQUIRE_AUTH=true
BACKUP_ALLOWED_IPS=
```

### Configuration File

The backup system uses `config/backup.php` for detailed configuration options.

## Cron Job Setup

Add the following cron job to process backups:

```bash
# Process backups every 5 minutes
*/5 * * * * cd /path/to/your/app && php artisan backup:process
```

## Usage

### Creating a Backup

1. Navigate to the Backup Management page
2. Click "Create Backup"
3. Select backup type (Database or Full System)
4. Add optional notes
5. Click "Create Backup"

The backup will be queued for processing.

### Processing Backups

Backups are automatically processed by the cron job, or you can manually trigger processing:

```bash
php artisan backup:process
```

### Downloading Backups

1. Navigate to the Backup Management page
2. Find a completed backup
3. Click the download icon
4. The backup file will be downloaded

### Restoring Backups

⚠️ **Warning**: Restoring a backup will overwrite the current database.

1. Navigate to the Backup Management page
2. Find a completed backup
3. Click the restore icon
4. Confirm the restoration

### Manual Commands

```bash
# Create a backup request
php artisan backup:create database --notes="Manual backup"

# Process pending backups
php artisan backup:process

# Process with force flag
php artisan backup:process --force
```

## Security Considerations

1. **Authentication**: All backup operations require authentication
2. **Authorization**: Role-based permissions control access
3. **File Security**: Backup files are stored securely with proper permissions
4. **IP Restrictions**: Optional IP address restrictions for backup operations
5. **Audit Trail**: All backup operations are logged

## Monitoring

### Logs

Backup operations are logged to Laravel's log files:

```bash
tail -f storage/logs/laravel.log | grep backup
```

### Statistics

Monitor backup statistics through the API or frontend dashboard:

- Total backups
- Completed backups
- Failed backups
- Total storage used

## Troubleshooting

### Common Issues

1. **mysqldump not found**
   - Ensure mysqldump is installed and in PATH
   - Check MySQL client installation

2. **Permission denied**
   - Check file permissions for backup directory
   - Ensure web server can write to storage

3. **Backup fails**
   - Check database connection
   - Verify MySQL credentials
   - Check available disk space

4. **Cron job not running**
   - Verify cron service is running
   - Check cron job syntax
   - Test manually with `php artisan backup:process`

### Debug Commands

```bash
# Test backup creation
php artisan backup:create database --notes="Test"

# Check backup status
php artisan tinker
>>> App\Models\Backup::all()

# Test backup processing
php artisan backup:process --force
```

## Future Enhancements

1. **File System Backup**: Include file system in full backups
2. **Compression**: Add backup file compression
3. **Encryption**: Encrypt backup files
4. **Cloud Storage**: Support for cloud storage providers
5. **Scheduled Backups**: Automatic scheduled backups
6. **Email Notifications**: Email notifications for backup events
7. **Backup Verification**: Verify backup integrity
8. **Incremental Backups**: Support for incremental backups

## Testing

Run the backup system tests:

```bash
php artisan test --filter=BackupTest
```

## Support

For issues or questions about the backup system:

1. Check the logs for error messages
2. Verify configuration settings
3. Test with manual commands
4. Review this documentation
5. Contact the development team 