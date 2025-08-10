# Attendance Management System

## Overview

The Attendance Management System is designed to track both individual and general attendance for events in the ZoeFlock Admin system. It supports automatic attendance record creation via cron jobs and provides comprehensive APIs for attendance management.

## Features

### 1. Individual Attendance
- Track attendance status for each member (present, absent, first_timer)
- Check-in and check-out timestamps
- Notes and comments for each attendance record
- Bulk attendance updates

### 2. General Attendance
- Track total attendance numbers for events
- Count first-time visitors
- Notes for general event observations

### 3. Automatic Record Creation
- Cron job creates attendance records at midnight for events scheduled that day
- Automatically determines eligible members based on event type and associations

### 4. Event Type Support
- **General Events**: All active members are eligible
- **Group Events**: Only members of associated groups are eligible
- **Family Events**: Only members of associated families are eligible

## Database Schema

### Attendance Table
```sql
CREATE TABLE attendances (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT UNSIGNED NOT NULL,
    member_id BIGINT UNSIGNED NOT NULL,
    status ENUM('present', 'absent', 'first_timer') DEFAULT 'absent',
    check_in_time TIME NULL,
    check_out_time TIME NULL,
    notes TEXT NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    UNIQUE KEY unique_event_member (event_id, member_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

### General Attendance Table
```sql
CREATE TABLE general_attendances (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    event_id BIGINT UNSIGNED NOT NULL,
    total_attendance INT NOT NULL,
    first_timers_count INT DEFAULT 0,
    notes TEXT NULL,
    recorded_by BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    UNIQUE KEY unique_event (event_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE
);
```

## API Endpoints

### Individual Attendance

#### Get Event Attendance
```
GET /api/v1/events/{event}/attendance
```
Returns all attendance records for a specific event with statistics.

#### Get Eligible Members
```
GET /api/v1/events/{event}/attendance/eligible-members
```
Returns all members eligible to attend the event based on event type and associations.

#### Update Attendance Status
```
PUT /api/v1/events/{event}/attendance/{memberId}/status
```
Update the attendance status for a specific member.

**Request Body:**
```json
{
    "status": "present|absent|first_timer",
    "notes": "Optional notes"
}
```

#### Mark Check-in
```
POST /api/v1/events/{event}/attendance/{memberId}/check-in
```
Record check-in time for a member.

#### Mark Check-out
```
POST /api/v1/events/{event}/attendance/{memberId}/check-out
```
Record check-out time for a member.

#### Bulk Update Attendance
```
POST /api/v1/events/{event}/attendance/bulk-update
```
Update attendance status for multiple members at once.

**Request Body:**
```json
{
    "attendances": [
        {
            "member_id": 1,
            "status": "present",
            "notes": "Attended on time"
        },
        {
            "member_id": 2,
            "status": "absent",
            "notes": "Called in sick"
        }
    ]
}
```

### General Attendance

#### Get Event General Attendance
```
GET /api/v1/general-attendance/event/{eventId}
```
Returns general attendance information for a specific event.

#### Update General Attendance
```
POST /api/v1/general-attendance/event/{eventId}
```
Create or update general attendance for an event.

**Request Body:**
```json
{
    "total_attendance": 150,
    "first_timers_count": 25,
    "notes": "Great turnout for the event"
}
```

#### Get Attendance Analytics
```
GET /api/v1/general-attendance/analytics?start_date=2024-01-01&end_date=2024-01-31
```
Returns attendance analytics for a date range.

#### Get Attendance Summary
```
GET /api/v1/general-attendance/summary
```
Returns current and last month attendance summaries for dashboard display.

## Cron Job Setup

### Automatic Attendance Record Creation

The system includes a cron job command that automatically creates attendance records at midnight for events scheduled that day.

#### Command
```bash
php artisan attendance:create-event-records
```

#### Cron Schedule
Add this to your server's crontab to run daily at midnight:
```bash
0 0 * * * cd /path/to/your/project && php artisan attendance:create-event-records
```

#### Manual Execution
You can also run the command manually for specific dates:
```bash
php artisan attendance:create-event-records --date=2024-01-15
```

## Usage Examples

### Creating Attendance Records Manually

```php
use App\Services\AttendanceService;
use App\Models\Event;

$attendanceService = app(AttendanceService::class);
$event = Event::find(1);

// Create attendance records for all eligible members
$result = $attendanceService->createEventAttendance($event);

if ($result['success']) {
    echo "Created {$result['created_records']} attendance records";
}
```

### Updating Individual Attendance

```php
// Mark a member as present
$result = $attendanceService->updateAttendanceStatus(
    eventId: 1,
    memberId: 5,
    status: 'present',
    notes: 'Member attended the full event'
);

if ($result['success']) {
    echo "Attendance updated successfully";
}
```

### Recording General Attendance

```php
// Record general attendance for an event
$result = $attendanceService->updateGeneralAttendance(
    eventId: 1,
    totalAttendance: 180,
    firstTimersCount: 30,
    notes: 'Excellent turnout with many new visitors'
);

if ($result['success']) {
    echo "General attendance recorded successfully";
}
```

## Testing

Run the attendance tests with:
```bash
php artisan test --filter=AttendanceTest
```

## Seeding

Populate the database with sample attendance data:
```bash
php artisan db:seed --class=AttendanceSeeder
```

## Analytics and Reporting

The system provides comprehensive analytics including:

- Individual vs. general attendance comparison
- First-time visitor tracking
- Check-in/check-out patterns
- Monthly and yearly attendance trends
- Event-specific attendance statistics

## Security Considerations

- All attendance endpoints require authentication
- Attendance records are tied to the user who recorded them
- Validation ensures data integrity
- Foreign key constraints prevent orphaned records

## Performance Considerations

- Database indexes on frequently queried fields
- Efficient queries for member eligibility
- Bulk operations for multiple attendance updates
- Caching for frequently accessed statistics

## Troubleshooting

### Common Issues

1. **No eligible members found**: Check if the event has associated groups/families and if members are properly linked.

2. **Duplicate attendance records**: The system prevents duplicates, but if they occur, check the unique constraint on `event_id` and `member_id`.

3. **Cron job not working**: Verify the cron job is properly scheduled and the command path is correct.

### Debug Commands

```bash
# Check if attendance records exist for an event
php artisan tinker
>>> App\Models\Attendance::where('event_id', 1)->count();

# Verify eligible members for an event
>>> $event = App\Models\Event::find(1);
>>> app(App\Services\AttendanceService::class)->getEligibleMembersForEvent($event)->count();
```

## Future Enhancements

- QR code-based check-in system
- Mobile app integration
- Advanced reporting and dashboards
- Integration with external calendar systems
- Automated attendance reminders
- Attendance trend analysis and predictions 