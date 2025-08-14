<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Attendance Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the attendance system.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Attendance Entry Window
    |--------------------------------------------------------------------------
    |
    | Number of days after an event when attendance can still be entered.
    | This applies to past events only.
    |
    */
    'window_days' => env('ATTENDANCE_WINDOW_DAYS', 30),

    /*
    |--------------------------------------------------------------------------
    | Pre-attendance Window
    |--------------------------------------------------------------------------
    |
    | Number of hours before an event when attendance can be entered.
    | This allows for pre-registration or early check-in.
    |
    */
    'pre_attendance_hours' => env('ATTENDANCE_PRE_HOURS', 24),

    /*
    |--------------------------------------------------------------------------
    | Default Attendance Status
    |--------------------------------------------------------------------------
    |
    | Default status when creating new attendance records.
    |
    */
    'default_status' => env('ATTENDANCE_DEFAULT_STATUS', 'absent'),

    /*
    |--------------------------------------------------------------------------
    | Allow Past Event Attendance
    |--------------------------------------------------------------------------
    |
    | Whether to allow attendance entry for past events.
    | This is controlled by the window_days setting.
    |
    */
    'allow_past_events' => env('ATTENDANCE_ALLOW_PAST_EVENTS', true),

    /*
    |--------------------------------------------------------------------------
    | Require Notes for Past Events
    |--------------------------------------------------------------------------
    |
    | Whether to require notes when entering attendance for past events.
    | This helps maintain data quality and accountability.
    |
    */
    'require_notes_past_events' => env('ATTENDANCE_REQUIRE_NOTES_PAST_EVENTS', false),

    /*
    |--------------------------------------------------------------------------
    | Auto-create Attendance Records
    |--------------------------------------------------------------------------
    |
    | Whether to automatically create attendance records for eligible members
    | when an event is created or when attendance is first accessed.
    |
    */
    'auto_create_records' => env('ATTENDANCE_AUTO_CREATE_RECORDS', true),
]; 