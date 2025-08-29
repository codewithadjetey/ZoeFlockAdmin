# Tithing Feature Documentation

## Overview

The Tithing feature is a comprehensive system for managing church member tithes with recurring functionality, role-based access control, and detailed tracking capabilities.

## Features

### Core Functionality
1. **Admin Management**: Admins can create, edit, and delete tithes for any member
2. **Recurring Tithes**: Automatic creation of next tithe when current one is marked as paid
3. **Role-Based Access**: Different permissions for admins, family heads, and regular members
4. **Flexible Payment**: Members can pay more than the required amount
5. **Status Tracking**: Track paid, unpaid, overdue, and active tithes
6. **Comprehensive Reporting**: Statistics and analytics for financial management

### Frequencies
- **Weekly**: Tithes due every week
- **Monthly**: Tithes due every month

### User Roles & Permissions

#### Admin/Super Admin
- Create tithes for any member
- Edit any tithe
- Delete any tithe
- View all tithes and statistics
- Mark any tithe as paid

#### Family Head
- View tithes from family members only
- Mark family member tithes as paid
- View family tithe statistics
- Cannot create or edit tithes

#### Regular Member
- View own tithes only
- Mark own tithes as paid
- View own tithe statistics
- Cannot create, edit, or delete tithes

## Database Schema

### Tithes Table
```sql
CREATE TABLE tithes (
    id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
    member_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    frequency ENUM('weekly', 'monthly') NOT NULL,
    start_date DATE NOT NULL,
    next_due_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_paid BOOLEAN DEFAULT FALSE,
    paid_amount DECIMAL(12,2) NULL,
    paid_date DATE NULL,
    notes TEXT NULL,
    created_by BIGINT UNSIGNED NOT NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_member_active (member_id, is_active),
    INDEX idx_due_paid (next_due_date, is_paid),
    INDEX idx_active_paid (is_active, is_paid)
);
```

## API Endpoints

### Base URL
```
/api/v1/tithes
```

### Endpoints

#### 1. Get All Tithes
```http
GET /api/v1/tithes
```

**Query Parameters:**
- `member_id` (optional): Filter by specific member
- `status` (optional): Filter by status (active, paid, unpaid, overdue)
- `frequency` (optional): Filter by frequency (weekly, monthly)
- `start_date` (optional): Filter by start date (YYYY-MM-DD)
- `end_date` (optional): Filter by end date (YYYY-MM-DD)
- `page` (optional): Page number for pagination

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "member_id": 1,
        "amount": "100.00",
        "frequency": "monthly",
        "start_date": "2024-01-01",
        "next_due_date": "2024-02-01",
        "is_active": true,
        "is_paid": false,
        "paid_amount": null,
        "paid_date": null,
        "notes": "Monthly tithe",
        "member": {
          "id": 1,
          "first_name": "John",
          "last_name": "Doe",
          "full_name": "John Doe"
        }
      }
    ],
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 1
  },
  "message": "Tithes retrieved successfully"
}
```

#### 2. Create Tithe
```http
POST /api/v1/tithes
```

**Request Body:**
```json
{
  "member_id": 1,
  "amount": 100.00,
  "frequency": "monthly",
  "start_date": "2024-01-01",
  "notes": "Monthly tithe for John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "member_id": 1,
    "amount": "100.00",
    "frequency": "monthly",
    "start_date": "2024-01-01",
    "next_due_date": "2024-02-01",
    "is_active": true,
    "is_paid": false
  },
  "message": "Tithe created successfully"
}
```

#### 3. Get Tithe by ID
```http
GET /api/v1/tithes/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "member_id": 1,
    "amount": "100.00",
    "frequency": "monthly",
    "start_date": "2024-01-01",
    "next_due_date": "2024-02-01",
    "is_active": true,
    "is_paid": false,
    "member": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "full_name": "John Doe"
    }
  },
  "message": "Tithe retrieved successfully"
}
```

#### 4. Update Tithe
```http
PUT /api/v1/tithes/{id}
```

**Request Body:**
```json
{
  "amount": 150.00,
  "frequency": "weekly",
  "notes": "Updated notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": "150.00",
    "frequency": "weekly",
    "next_due_date": "2024-01-08"
  },
  "message": "Tithe updated successfully"
}
```

#### 5. Mark Tithe as Paid
```http
POST /api/v1/tithes/{id}/mark-paid
```

**Request Body:**
```json
{
  "paid_amount": 160.00,
  "notes": "Payment received with extra offering"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "is_paid": true,
    "paid_amount": "160.00",
    "paid_date": "2024-01-15",
    "next_due_date": "2024-01-22"
  },
  "message": "Tithe marked as paid successfully"
}
```

#### 6. Delete Tithe
```http
DELETE /api/v1/tithes/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Tithe deleted successfully"
}
```

#### 7. Get Tithe Statistics
```http
GET /api/v1/tithes/statistics
```

**Query Parameters:**
- `start_date` (optional): Start date for date range filter
- `end_date` (optional): End date for date range filter

**Response:**
```json
{
  "success": true,
  "data": {
    "total_tithes": 50,
    "active_tithes": 45,
    "paid_tithes": 30,
    "unpaid_tithes": 20,
    "overdue_tithes": 5,
    "total_amount": "5000.00",
    "total_paid_amount": "3000.00",
    "total_outstanding": "2000.00",
    "weekly_tithes": 20,
    "monthly_tithes": 30
  },
  "message": "Tithe statistics retrieved successfully"
}
```

## Business Logic

### Recurring Tithe Creation
When a tithe is marked as paid:
1. The current tithe is marked as paid with payment details
2. If the tithe is active, a new recurring tithe is automatically created
3. The next due date is calculated based on the frequency:
   - Weekly: 7 days from the paid date
   - Monthly: 1 month from the paid date

### Due Date Calculation
- **Weekly**: `next_due_date = start_date + 1 week`
- **Monthly**: `next_due_date = start_date + 1 month`

### Overdue Detection
A tithe is considered overdue when:
- `next_due_date < current_date` AND `is_paid = false` AND `is_active = true`

## Frontend Components

### Main Components
1. **TitheModal**: Create and edit tithes
2. **MarkTithePaidModal**: Mark tithes as paid
3. **TitheFilters**: Filter tithes by various criteria
4. **TithesPage**: Main tithe management page
5. **TitheReportsPage**: Analytics and reporting

### Routes
- `/financials/tithes` - Main tithe management
- `/financials/tithes/reports` - Tithe reports and analytics

## Testing

### Running Tests
```bash
php artisan test --filter=TitheApiTest
```

### Test Coverage
- API endpoint functionality
- Role-based access control
- Business logic validation
- Data filtering and pagination
- Statistics calculation

## Seeding

### Populate with Sample Data
```bash
php artisan db:seed --class=TitheSeeder
```

### Factory Usage
```php
// Create a basic tithe
$tithe = Tithe::factory()->create();

// Create an active tithe
$tithe = Tithe::factory()->active()->create();

// Create a paid tithe
$tithe = Tithe::factory()->paid()->create();

// Create an overdue tithe
$tithe = Tithe::factory()->overdue()->create();

// Create a weekly tithe
$tithe = Tithe::factory()->weekly()->create();

// Create a monthly tithe
$tithe = Tithe::factory()->monthly()->create();
```

## Security Considerations

### Authorization
- All endpoints require authentication
- Role-based access control enforced at controller level
- Family heads can only access family member data
- Regular members can only access own data

### Data Validation
- Input validation on all endpoints
- SQL injection protection through Eloquent ORM
- XSS protection through proper output encoding

### Rate Limiting
- API rate limiting configured through Laravel Sanctum
- Request throttling for sensitive operations

## Performance Optimization

### Database Indexes
- Composite indexes on frequently queried fields
- Optimized queries for role-based filtering
- Efficient pagination implementation

### Caching Strategy
- Statistics caching for improved performance
- Query result caching for frequently accessed data

## Future Enhancements

### Planned Features
1. **Advanced Analytics**: Trend analysis and predictive insights
2. **Export Functionality**: PDF and Excel report generation
3. **Email Notifications**: Automated reminders for overdue tithes
4. **Mobile App Integration**: Native mobile app support
5. **Payment Gateway Integration**: Online payment processing
6. **Bulk Operations**: Mass tithe creation and updates

### Technical Improvements
1. **Real-time Updates**: WebSocket integration for live data
2. **Advanced Filtering**: More sophisticated search and filter options
3. **Data Visualization**: Interactive charts and graphs
4. **API Versioning**: Improved API versioning strategy

## Troubleshooting

### Common Issues

#### 1. Tithe Not Creating Next Recurring
- Check if the tithe is marked as active
- Verify the tithe is marked as paid
- Ensure the frequency is valid (weekly/monthly)

#### 2. Permission Denied Errors
- Verify user has correct role assignment
- Check if user is authenticated
- Ensure proper middleware configuration

#### 3. Date Calculation Issues
- Verify date format (YYYY-MM-DD)
- Check timezone configuration
- Ensure Carbon library is properly configured

### Debug Mode
Enable debug mode in `.env`:
```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Log Files
Check Laravel logs for detailed error information:
```bash
tail -f storage/logs/laravel.log
```

## Support

For technical support or feature requests:
1. Check the existing documentation
2. Review the test cases for usage examples
3. Consult the API documentation
4. Contact the development team

## Version History

- **v1.0.0** - Initial release with core tithing functionality
- **v1.1.0** - Added comprehensive reporting and analytics
- **v1.2.0** - Enhanced role-based access control
- **v1.3.0** - Improved recurring tithe logic and performance optimizations 