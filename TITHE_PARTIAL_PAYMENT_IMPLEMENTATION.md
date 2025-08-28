# Tithe Partial Payment Implementation

## Overview
This implementation adds the ability for church members to pay their tithes in partial amounts over time, rather than requiring full payment at once. This provides flexibility for members who may need to pay in smaller increments.

## Features

### 1. Partial Payment Tracking
- Members can make multiple payments towards a single tithe
- Each payment is tracked individually with method, date, and reference
- Real-time calculation of remaining balance
- Automatic status updates when tithe is fully paid

### 2. Payment Methods
- Cash
- Check
- Bank Transfer
- Mobile Money
- Other

### 3. Payment History
- Complete audit trail of all payments
- Ability to edit/update payment details
- Payment deletion with automatic recalculation

## Database Changes

### New Tables
1. **tithe_payments** - Stores individual payment transactions
   - `id` - Primary key
   - `tithe_id` - Foreign key to tithes table
   - `member_id` - Foreign key to members table
   - `amount` - Payment amount
   - `payment_date` - Date of payment
   - `payment_method` - Method used (cash, check, etc.)
   - `reference_number` - Optional reference (check number, transaction ID)
   - `notes` - Additional payment notes
   - `recorded_by` - User who recorded the payment
   - `created_at`, `updated_at` - Timestamps

### Modified Tables
1. **tithes** - Added new fields
   - `paid_amount` - Changed from nullable to default 0.00
   - `remaining_amount` - NEW: Calculated remaining balance
   - Added index on `remaining_amount` for performance

## API Endpoints

### Tithe Payments
- `POST /api/v1/tithes/{tithe}/payments` - Add new payment
- `GET /api/v1/tithes/{tithe}/payments` - Get payment history
- `GET /api/v1/tithes/{tithe}/payments/{payment}` - Get specific payment
- `PUT /api/v1/tithes/{tithe}/payments/{payment}` - Update payment
- `DELETE /api/v1/tithes/{tithe}/payments/{payment}` - Delete payment

### Existing Tithe Endpoints
- All existing endpoints remain functional
- `markAsPaid` now uses the new partial payment system internally

## Frontend Changes

### New Components
1. **TithePaymentModal** - Modal for adding partial payments
   - Shows tithe information (member, total, paid, remaining)
   - Payment amount validation
   - Payment method selection
   - Reference number and notes

### Updated Components
1. **TithesPage** - Main tithes listing
   - Added payment progress bar
   - "Add Payment" button for unpaid tithes
   - New statistics card for partially paid tithes
   - Enhanced status badges (including "Partially Paid")

### New Features
1. **Payment Progress Visualization**
   - Visual progress bar showing paid vs. total amount
   - Percentage completion display
   - Color-coded status indicators

2. **Enhanced Actions**
   - Add Payment button for unpaid tithes
   - Mark Paid button still available for full payments
   - Edit and Delete functionality for payments

## Business Logic

### Payment Validation
- Payment amount must be greater than 0
- Payment cannot exceed remaining tithe amount
- Automatic calculation of new remaining balance

### Status Management
- **Unpaid**: No payments made
- **Partially Paid**: Some payments made, balance remaining
- **Paid**: Full amount received
- **Overdue**: Past due date and not fully paid

### Automatic Updates
- When payment is added, tithe totals are recalculated
- If remaining amount becomes 0, tithe is marked as paid
- Next due date is calculated when tithe is fully paid

## Migration Process

### 1. Database Migration
```bash
php artisan migrate
```

### 2. Update Existing Data
```bash
php artisan migrate --path=database/migrations/2025_08_28_000001_update_existing_tithes_add_remaining_amount.php
```

### 3. Seed Test Data (Optional)
```bash
php artisan db:seed --class=TitheSeeder
```

## Testing

### Test Coverage
- Partial payment creation
- Multiple partial payments
- Full payment completion
- Payment validation
- Payment history retrieval
- Payment updates and deletion
- Automatic status updates

### Running Tests
```bash
php artisan test --filter=TithePartialPaymentTest
```

## Usage Examples

### Adding a Partial Payment
1. Navigate to Tithes page
2. Click "Add Payment" on an unpaid tithe
3. Enter payment amount (must not exceed remaining balance)
4. Select payment method
5. Add optional reference number and notes
6. Submit payment

### Viewing Payment History
1. Click on a tithe with payments
2. View payment history in the modal
3. See individual payment details
4. Edit or delete payments as needed

### Tracking Progress
- Visual progress bar shows completion percentage
- Status badges indicate current payment state
- Statistics cards show overall payment metrics

## Security & Permissions

### Access Control
- **Admin/Pastor**: Full access to all payment operations
- **Family Head**: Can view and add payments for family members
- **Regular Members**: Can only view their own tithes and payments

### Data Integrity
- All payment operations use database transactions
- Automatic recalculation prevents data inconsistencies
- Validation ensures payment amounts are valid

## Performance Considerations

### Database Indexes
- Added index on `remaining_amount` for faster queries
- Existing indexes on `member_id`, `is_active`, `is_paid` maintained
- Payment queries optimized with proper relationships

### Caching
- Consider caching tithe statistics for better performance
- Payment history can be paginated for large datasets

## Future Enhancements

### Potential Features
1. **Recurring Payments**: Automatic partial payments on schedule
2. **Payment Reminders**: Notifications for overdue tithes
3. **Bulk Operations**: Process multiple payments at once
4. **Advanced Reporting**: Payment trend analysis
5. **Integration**: Connect with external payment gateways

### Scalability
- Database design supports high-volume payment processing
- API endpoints designed for efficient data retrieval
- Frontend components optimized for large datasets

## Rollback Instructions

If you need to rollback this implementation:

### 1. Database Rollback
```bash
php artisan migrate:rollback --step=2
```

### 2. Remove New Files
- Delete `TithePaymentController.php`
- Delete `TithePayment.php` model
- Delete `TithePaymentModal.tsx`
- Remove payment routes from `api.php`

### 3. Restore Original Models
- Restore original `Tithe.php` model
- Remove payment-related interfaces

### 4. Frontend Rollback
- Remove payment-related components
- Restore original tithes page
- Remove payment service methods

## Support & Maintenance

### Monitoring
- Monitor payment processing performance
- Track payment method usage patterns
- Review payment history for anomalies

### Maintenance
- Regular database optimization
- Clean up old payment records if needed
- Monitor for payment validation issues

## Conclusion

This implementation provides a robust, scalable solution for partial tithe payments while maintaining backward compatibility with existing functionality. The system is designed to be user-friendly, secure, and maintainable for long-term church administration needs. 