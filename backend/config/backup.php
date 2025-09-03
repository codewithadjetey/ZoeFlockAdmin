<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Backup Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains the configuration for the backup system.
    |
    */

    // Storage disk for backups
    'disk' => env('BACKUP_DISK', 'local'),

    // Backup storage path
    'path' => env('BACKUP_PATH', 'backups'),

    // Maximum number of backups to keep
    'max_backups' => env('BACKUP_MAX_COUNT', 10),

    // Backup types
    'types' => [
        'database' => [
            'name' => 'Database Backup',
            'description' => 'Backup of database only',
        ],
        'full' => [
            'name' => 'Full System Backup',
            'description' => 'Backup of database and files',
        ],
    ],

    // Database backup settings
    'database' => [
        // MySQL dump options
        'mysqldump_options' => [
            '--single-transaction',
            '--routines',
            '--triggers',
            '--add-drop-database',
        ],
        
        // Compression (if supported)
        'compress' => env('BACKUP_COMPRESS', false),
        
        // Backup file extension
        'extension' => 'sql',
    ],

    // Notification settings
    'notifications' => [
        // Send notifications on backup completion
        'on_completion' => env('BACKUP_NOTIFY_ON_COMPLETION', true),
        
        // Send notifications on backup failure
        'on_failure' => env('BACKUP_NOTIFY_ON_FAILURE', true),
        
        // Email addresses to notify
        'email' => env('BACKUP_NOTIFICATION_EMAIL', ''),
    ],

    // Cron job settings
    'cron' => [
        // Process backups every X minutes
        'process_interval' => env('BACKUP_PROCESS_INTERVAL', 5),
        
        // Auto-cleanup old backups
        'auto_cleanup' => env('BACKUP_AUTO_CLEANUP', true),
    ],

    // Security settings
    'security' => [
        // Require authentication for backup operations
        'require_auth' => env('BACKUP_REQUIRE_AUTH', true),
        
        // Allowed IP addresses for backup operations (empty = all)
        'allowed_ips' => env('BACKUP_ALLOWED_IPS', ''),
        
        // Backup file permissions
        'file_permissions' => 0644,
    ],
]; 