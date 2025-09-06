<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Church Information
    |--------------------------------------------------------------------------
    |
    | Basic church information and contact details
    |
    */

    'name' => env('CHURCH_NAME', 'Zoe Flock Church'),
    'address' => env('CHURCH_ADDRESS', ''),
    'phone' => env('CHURCH_PHONE', ''),
    'email' => env('CHURCH_EMAIL', ''),
    'website' => env('CHURCH_WEBSITE', ''),
    'pastor_name' => env('CHURCH_PASTOR_NAME', ''),
    'established_year' => env('CHURCH_ESTABLISHED_YEAR', ''),
    'denomination' => env('CHURCH_DENOMINATION', ''),

    /*
    |--------------------------------------------------------------------------
    | Registration Settings
    |--------------------------------------------------------------------------
    |
    | Control user registration behavior
    |
    */

    'allow_self_registration' => env('ALLOW_SELF_REGISTRATION', true),
    'require_email_verification' => env('REQUIRE_EMAIL_VERIFICATION', true),
    'require_admin_approval' => env('REQUIRE_ADMIN_APPROVAL', false),

    /*
    |--------------------------------------------------------------------------
    | Service Times
    |--------------------------------------------------------------------------
    |
    | Church service schedules
    |
    */

    'service_times' => json_decode(env('SERVICE_TIMES', '{"sunday": ["09:00", "11:00", "18:00"]}'), true),

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    |
    | Additional contact details
    |
    */

    'contact_phone' => env('CONTACT_PHONE', ''),
    'contact_email' => env('CONTACT_EMAIL', ''),
    'emergency_contact' => env('EMERGENCY_CONTACT', ''),

    /*
    |--------------------------------------------------------------------------
    | Social Media
    |--------------------------------------------------------------------------
    |
    | Social media links
    |
    */

    'social_media' => [
        'facebook' => env('FACEBOOK_URL', ''),
        'twitter' => env('TWITTER_URL', ''),
        'instagram' => env('INSTAGRAM_URL', ''),
        'youtube' => env('YOUTUBE_URL', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | Enable/disable specific features
    |
    */

    'features' => [
        'online_giving' => env('ENABLE_ONLINE_GIVING', true),
        'event_registration' => env('ENABLE_EVENT_REGISTRATION', true),
        'group_management' => env('ENABLE_GROUP_MANAGEMENT', true),
        'attendance_tracking' => env('ENABLE_ATTENDANCE_TRACKING', true),
        'financial_reporting' => env('ENABLE_FINANCIAL_REPORTING', true),
    ],
];
