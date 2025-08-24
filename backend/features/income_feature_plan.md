# Income Model & Feature Plan

## Purpose
The `Income` model will provide a structured way to track all incoming funds, such as tithes, offerings, pledges, partnerships, and other income sources. This will enable comprehensive income management and reporting.

## Fields
- `id`: Primary key
- `category_id`: Foreign key to `IncomeCategory`
- `description`: Details about the income
- `amount`: The total amount received
- `received_date`: The date when the income was received
- `due_date`: The due date for the income (if applicable)
- `is_received`: Whether the income has been received (default: true)
- `created_at`, `updated_at`: Timestamps

## Relationships
- Belongs to an `IncomeCategory`
- Can be linked to a user/member (optional, if needed)

## Usage Scenarios
- Track all income in one place for full financial visibility
- Link income records to categories (e.g., Tithes, Offerings, Pledges)
- Support due dates, received tracking, and notes
- Generate income reports by category, date, status, etc.
- Analyze income trends and sources

## Next Steps
1. Create the `Income` Eloquent model
2. Create a migration for the `incomes` table
3. Create an `IncomeCategory` model and migration
4. Implement relationships
5. Add API endpoints and admin UI for managing income records
6. Add reporting features

---
*Edit this plan as requirements evolve. This plan is designed for extensibility to support future financial features.*