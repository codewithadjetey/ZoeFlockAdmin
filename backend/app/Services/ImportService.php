<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\Family;
use App\Models\Group;
use App\Models\EventCategory;
use App\Models\PartnershipCategory;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class ImportService
{
    protected $request;
    protected $user;
    protected $errors = [];
    protected $successCount = 0;
    protected $skippedCount = 0;
    protected $importData = [];

    public function __construct(Request $request)
    {
        $this->request = $request;
        $this->user = $request->user();
    }

    /**
     * Import families from CSV/Excel data
     */
    public function importFamilies(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2; // +2 because index starts at 0 and we skip header
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'slogan' => 'nullable|string|max:255',
                    'description' => 'nullable|string',
                    'family_head_phone' => 'nullable|string|max:20',
                    'family_head_email' => 'nullable|email|max:255',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for duplicate family name
                if (Family::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                // Find family head if phone or email provided
                $familyHead = null;
                if (!empty($row['family_head_phone'])) {
                    $familyHead = Member::where('phone', $row['family_head_phone'])->first();
                } elseif (!empty($row['family_head_email'])) {
                    $familyHead = Member::where('email', $row['family_head_email'])->first();
                }

                $family = Family::create([
                    'name' => $row['name'],
                    'slogan' => $this->normalizeEmptyValue($row['slogan']),
                    'description' => $this->normalizeEmptyValue($row['description']),
                    'family_head_id' => $familyHead?->id,
                    'active' => true,
                    'deleted' => false,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $family->id,
                    'name' => $family->name,
                    'row' => $rowNumber
                ];

                // Log the import
                $this->logAudit('import', 'Family', $family->id, "Imported family: {$family->name}", [
                    'row_number' => $rowNumber,
                    'family_head_id' => $familyHead?->id,
                ]);
            }

            DB::commit();
            return $this->getImportResult('families');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Family import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('families');
        }
    }

    /**
     * Import groups from CSV/Excel data
     */
    public function importGroups(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                    'meeting_day' => 'nullable|string|max:50',
                    'meeting_time' => 'nullable|string|max:50',
                    'meeting_location' => 'nullable|string|max:255',
                    'leader_phone' => 'nullable|string|max:20',
                    'leader_email' => 'nullable|email|max:255',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for duplicate group name
                if (Group::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                // Find leader if phone or email provided
                $leader = null;
                if (!empty($row['leader_phone'])) {
                    $leader = Member::where('phone', $row['leader_phone'])->first();
                } elseif (!empty($row['leader_email'])) {
                    $leader = Member::where('email', $row['leader_email'])->first();
                }

                $group = Group::create([
                    'name' => $row['name'],
                    'description' => $this->normalizeEmptyValue($row['description']),
                    'meeting_day' => $this->normalizeEmptyValue($row['meeting_day']),
                    'meeting_time' => $this->normalizeEmptyValue($row['meeting_time']),
                    'location' => $this->normalizeEmptyValue($row['meeting_location']),
                    'status' => 'Active',
                    'created_by' => $this->user?->id,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $group->id,
                    'name' => $group->name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'Group', $group->id, "Imported group: {$group->name}", [
                    'row_number' => $rowNumber,
                    'leader_id' => $leader?->id,
                ]);
            }

            DB::commit();
            return $this->getImportResult('groups');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Group import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('groups');
        }
    }

    /**
     * Import members from CSV/Excel data
     */
    public function importMembers(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'first_name' => 'required|string|max:255',
                    'last_name' => 'required|string|max:255',
                    'email' => 'required|email|max:255',
                    'phone' => 'required|string|max:20',
                    'address' => 'nullable|string',
                    'date_of_birth' => 'required|date',
                    'gender' => 'nullable|in:male,female,other',
                    'marital_status' => 'nullable|in:single,married,divorced,widowed',
                    'occupation' => 'nullable|string|max:255',
                    'emergency_contact_name' => 'nullable|string|max:255',
                    'emergency_contact_phone' => 'nullable|string|max:20',
                    'baptism_date' => 'nullable|date',
                    'membership_date' => 'nullable|date',
                    'family_name' => 'nullable|string|max:255',
                    'is_family_head' => 'nullable|in:true,false,1,0,"true","false"',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for existing member by phone number
                $existingMember = Member::where('phone', $row['phone'])->first();
                if ($existingMember) {
                    $this->skippedCount++;
                    continue;
                }

                // Check for existing member by email if provided
                if (!empty($row['email'])) {
                    $existingMemberByEmail = Member::where('email', $row['email'])->first();
                    if ($existingMemberByEmail) {
                        $this->skippedCount++;
                        continue;
                    }
                }

                $member = Member::create([
                    'first_name' => $row['first_name'],
                    'last_name' => $row['last_name'],
                    'email' => $this->normalizeEmptyValue($row['email']),
                    'phone' => $row['phone'],
                    'address' => $this->normalizeEmptyValue($row['address']),
                    'date_of_birth' => $this->normalizeDateValue($row['date_of_birth']),
                    'gender' => $this->normalizeEmptyValue($row['gender']),
                    'marital_status' => $this->normalizeEmptyValue($row['marital_status']),
                    'occupation' => $this->normalizeEmptyValue($row['occupation']),
                    'emergency_contact_name' => $this->normalizeEmptyValue($row['emergency_contact_name']),
                    'emergency_contact_phone' => $this->normalizeEmptyValue($row['emergency_contact_phone']),
                    'baptism_date' => $this->normalizeDateValue($row['baptism_date']),
                    'membership_date' => $this->normalizeDateValue($row['membership_date']),
                    'is_active' => true,
                    'created_by' => $this->user?->id,
                ]);

                // Handle family assignment
                if (!empty($row['family_name'])) {
                    $family = Family::where('name', $row['family_name'])->first();
                    if ($family) {
                        $isFamilyHead = $this->convertToBoolean($row['is_family_head'] ?? false);
                        $role = $isFamilyHead ? 'head' : 'member';
                        $family->members()->attach($member->id, [
                            'role' => $role,
                            'joined_at' => now(),
                            'is_active' => true,
                        ]);

                        // Update family head if this member is designated as head
                        if ($isFamilyHead) {
                            $family->update(['family_head_id' => $member->id]);
                        }
                    }
                }

                $this->successCount++;
                $this->importData[] = [
                    'id' => $member->id,
                    'name' => $member->full_name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'Member', $member->id, "Imported member: {$member->full_name}", [
                    'row_number' => $rowNumber,
                    'phone' => $member->phone,
                    'email' => $member->email,
                ]);
            }

            DB::commit();
            return $this->getImportResult('members');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Member import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('members');
        }
    }

    /**
     * Import event categories from CSV/Excel data
     */
    public function importEventCategories(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'color' => 'required|string|max:7',
                    'attendance_type' => 'required|in:individual,general,none',
                    'recurrence_pattern' => 'required|string|max:50',
                    'weekdays' => 'required|string',
                    'is_recurring' => 'nullable|in:true,false,1,0,"true","false"',
                ]);

                if ($validator->fails()) {
                    $errors = $validator->errors()->toArray();
                    $errorMessage = 'Validation failed';
                    
                    // Provide more specific error messages for required fields
                    if (isset($errors['name'])) {
                        $errorMessage = 'Name is required';
                    } elseif (isset($errors['color'])) {
                        $errorMessage = 'Color is required (hex format: #RRGGBB)';
                    } elseif (isset($errors['description'])) {
                        $errorMessage = 'Description is required';
                    } elseif (isset($errors['attendance_type'])) {
                        $errorMessage = 'Attendance Type is required (individual, general, or none)';
                    } elseif (isset($errors['recurrence_pattern'])) {
                        $errorMessage = 'Recurrence Pattern is required (daily, weekly, monthly, yearly)';
                    } elseif (isset($errors['weekdays'])) {
                        $errorMessage = 'Weekdays is required (comma-separated: 0,1,2,3,4,5,6)';
                    }
                    
                    $this->addError($rowNumber, $errorMessage, $errors);
                    continue;
                }

                // Check for duplicate category name
                if (EventCategory::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                // Process weekdays for recurrence settings
                $recurrenceSettings = [];
                $weekdays = array_map('intval', array_map('trim', explode(',', $row['weekdays'])));
                $recurrenceSettings['weekdays'] = $weekdays;

                $category = EventCategory::create([
                    'name' => $row['name'],
                    'description' => $this->normalizeEmptyValue($row['description']),
                    'color' => $this->normalizeEmptyValue($row['color']),
                    'attendance_type' => $this->normalizeEmptyValue($row['attendance_type']),
                    'is_recurring' => $this->convertToBoolean($row['is_recurring'] ?? false),
                    'recurrence_pattern' => $this->normalizeEmptyValue($row['recurrence_pattern']),
                    'recurrence_settings' => $recurrenceSettings,
                    'is_active' => true,
                    'created_by' => $this->user?->id,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'EventCategory', $category->id, "Imported event category: {$category->name}", [
                    'row_number' => $rowNumber,
                ]);
            }

            DB::commit();
            return $this->getImportResult('event_categories');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Event category import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('event_categories');
        }
    }

    /**
     * Import partnership categories from CSV/Excel data
     */
    public function importPartnershipCategories(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'description' => 'required|string',
                    'amount' => 'nullable|numeric|min:0',
                    'frequency' => 'nullable|string|max:50',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for duplicate category name
                if (PartnershipCategory::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                $category = PartnershipCategory::create([
                    'name' => $row['name'],
                    'description' => $row['description'] ?? null,
                    'amount' => $row['amount'] ?? null,
                    'frequency' => $row['frequency'] ?? null,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'PartnershipCategory', $category->id, "Imported partnership category: {$category->name}", [
                    'row_number' => $rowNumber,
                ]);
            }

            DB::commit();
            return $this->getImportResult('partnership_categories');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Partnership category import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('partnership_categories');
        }
    }

    /**
     * Import income categories from CSV/Excel data
     */
    public function importIncomeCategories(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for duplicate category name
                if (IncomeCategory::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                $category = IncomeCategory::create([
                    'name' => $row['name'],
                    'description' => $row['description'] ?? null,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'IncomeCategory', $category->id, "Imported income category: {$category->name}", [
                    'row_number' => $rowNumber,
                ]);
            }

            DB::commit();
            return $this->getImportResult('income_categories');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Income category import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('income_categories');
        }
    }

    /**
     * Import expense categories from CSV/Excel data
     */
    public function importExpenseCategories(array $data): array
    {
        $this->resetCounters();
        
        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                $rowNumber = $index + 2;
                
                $validator = Validator::make($row, [
                    'name' => 'required|string|max:255',
                    'description' => 'nullable|string',
                ]);

                if ($validator->fails()) {
                    $this->addError($rowNumber, 'Validation failed', $validator->errors()->toArray());
                    continue;
                }

                // Check for duplicate category name
                if (ExpenseCategory::where('name', $row['name'])->exists()) {
                    $this->skippedCount++;
                    continue;
                }

                $category = ExpenseCategory::create([
                    'name' => $row['name'],
                    'description' => $row['description'] ?? null,
                ]);

                $this->successCount++;
                $this->importData[] = [
                    'id' => $category->id,
                    'name' => $category->name,
                    'row' => $rowNumber
                ];

                $this->logAudit('import', 'ExpenseCategory', $category->id, "Imported expense category: {$category->name}", [
                    'row_number' => $rowNumber,
                ]);
            }

            DB::commit();
            return $this->getImportResult('expense_categories');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Expense category import failed: ' . $e->getMessage());
            $this->addError(0, 'Import failed', ['error' => $e->getMessage()]);
            return $this->getImportResult('expense_categories');
        }
    }

    /**
     * Add an error to the errors array
     */
    protected function addError(int $rowNumber, string $message, array $details = []): void
    {
        $this->errors[] = [
            'row' => $rowNumber,
            'message' => $message,
            'details' => $details,
        ];
    }

    /**
     * Reset counters for new import
     */
    protected function resetCounters(): void
    {
        $this->errors = [];
        $this->successCount = 0;
        $this->skippedCount = 0;
        $this->importData = [];
    }

    /**
     * Get the final import result
     */
    protected function getImportResult(string $type): array
    {
        return [
            'type' => $type,
            'success_count' => $this->successCount,
            'skipped_count' => $this->skippedCount,
            'error_count' => count($this->errors),
            'errors' => $this->errors,
            'imported_data' => $this->importData,
            'total_rows' => $this->successCount + $this->skippedCount + count($this->errors),
        ];
    }

    /**
     * Convert string to boolean
     */
    protected function convertToBoolean($value): bool
    {
        if (is_bool($value)) {
            return $value;
        }
        
        if (is_string($value)) {
            return in_array(strtolower($value), ['true', '1', 'yes', 'on']);
        }
        
        if (is_numeric($value)) {
            return $value == 1;
        }
        
        return false;
    }

    /**
     * Log audit entry
     */
    protected function logAudit(string $action, string $modelType, int $modelId, string $description, array $details = []): void
    {
        AuditLog::create([
            'user_id' => $this->user?->id,
            'action' => $action,
            'model_type' => $modelType,
            'model_id' => $modelId,
            'description' => $description,
            'details' => $details,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
            'status' => 'success',
        ]);
    }

    /**
     * Normalize empty values to null
     */
    protected function normalizeEmptyValue($value)
    {
        if (empty($value) || $value === '' || $value === 'null' || $value === 'NULL') {
            return null;
        }
        return trim($value);
    }

    /**
     * Normalize date values, converting empty strings to null
     */
    protected function normalizeDateValue($value)
    {
        if (empty($value) || $value === '' || $value === 'null' || $value === 'NULL') {
            return null;
        }
        
        // If it's already a valid date, return as is
        if ($value instanceof \Carbon\Carbon || $value instanceof \DateTime) {
            return $value;
        }
        
        // Try to parse the date string
        $trimmedValue = trim($value);
        if (empty($trimmedValue)) {
            return null;
        }
        
        try {
            return \Carbon\Carbon::parse($trimmedValue);
        } catch (\Exception $e) {
            // If we can't parse the date, return null
            return null;
        }
    }
} 