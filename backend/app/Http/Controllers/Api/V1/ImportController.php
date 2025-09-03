<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

class ImportController extends Controller
{
    protected $importService;

    public function __construct(ImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Get import options and sample files
     */
    public function index()
    {
        return response()->json([
            'message' => 'Import system available',
            'available_imports' => [
                'families' => [
                    'name' => 'Import Families',
                    'description' => 'Import family data with family heads',
                    'sample_file' => route('api.v1.import.sample', 'families'),
                    'endpoint' => route('api.v1.import.process', 'families'),
                    "type" => "families"
                ],
                'groups' => [
                    'name' => 'Import Groups',
                    'description' => 'Import group data with leaders',
                    'sample_file' => route('api.v1.import.sample', 'groups'),
                    'endpoint' => route('api.v1.import.process', 'groups'),
                    "type" => "groups"
                ],
                'members' => [
                    'name' => 'Import Members',
                    'description' => 'Import member data with family assignments',
                    'sample_file' => route('api.v1.import.sample', 'members'),
                    'endpoint' => route('api.v1.import.process', 'members'),
                    "type" => "members"
                ],
                'event_categories' => [
                    'name' => 'Import Event Categories',
                    'description' => 'Import event category data. Required fields: name, description, color, attendance_type, recurrence_pattern, weekdays',
                    'sample_file' => route('api.v1.import.sample', 'event_categories'),
                    'endpoint' => route('api.v1.import.process', 'event_categories'),
                    "type" => "event_categories"
                ],
                'partnership_categories' => [
                    'name' => 'Import Partnership Categories',
                    'description' => 'Import partnership category data. Required fields: name, description',
                    'sample_file' => route('api.v1.import.sample', 'partnership_categories'),
                    'endpoint' => route('api.v1.import.process', 'partnership_categories'),
                    "type" => "partnership_categories"
                ],
                'income_categories' => [
                    'name' => 'Import Income Categories',
                    'description' => 'Import income category data',
                    'sample_file' => route('api.v1.import.sample', 'income_categories'),
                    'endpoint' => route('api.v1.import.process', 'income_categories'),
                    "type" => "income_categories"
                ],
                'expense_categories' => [
                    'name' => 'Import Expense Categories',
                    'description' => 'Import expense category data',
                    'sample_file' => route('api.v1.import.sample', 'expense_categories'),
                    'endpoint' => route('api.v1.import.process', 'expense_categories'),
                    "type" => "expense_categories"
                ],
            ],
        ]);
    }

    /**
     * Download sample file for specific import type
     */
    public function downloadSample(string $type)
    {
        $sampleData = $this->getSampleData($type);
        
        if (!$sampleData) {
            return response()->json([
                'message' => 'Invalid import type',
                'available_types' => ['families', 'groups', 'members', 'event_categories', 'partnership_categories', 'income_categories', 'expense_categories']
            ], 400);
        }

        $filename = "sample_{$type}.csv";
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function() use ($sampleData) {
            $file = fopen('php://output', 'w');
            
            // Write headers
            fputcsv($file, array_keys($sampleData[0]));
            
            // Write sample data
            foreach ($sampleData as $row) {
                fputcsv($file, $row);
            }
            
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Process import file
     */
    public function processImport(Request $request, string $type)
    {
        $validator = Validator::make($request->all(), [
            'file' => [
                'required',
                'file',
                'max:10240',
                function ($attribute, $value, $fail) {
                    $extension = strtolower($value->getClientOriginalExtension());
                    $mimeType = strtolower($value->getMimeType());
                    
                    $allowedExtensions = ['csv', 'xlsx', 'xls'];
                    $allowedMimeTypes = [
                        'text/csv',
                        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        'application/vnd.ms-excel',
                        'application/octet-stream',
                        'text/plain', // Some CSV files might be detected as text/plain
                        'application/csv',
                        'text/comma-separated-values'
                    ];
                    
                    if (!in_array($extension, $allowedExtensions) && !in_array($mimeType, $allowedMimeTypes)) {
                        $fail("The {$attribute} must be a file of type: csv, xlsx, xls. Detected: {$extension} ({$mimeType})");
                    }
                }
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('file');
            $data = $this->readFile($file);
            
            if (empty($data)) {
                return response()->json([
                    'message' => 'No data found in file',
                    'errors' => ['file' => 'The uploaded file appears to be empty or invalid']
                ], 422);
            }

            $result = $this->processData($type, $data);

            return response()->json([
                'message' => 'Import completed',
                'result' => $result,
                'summary' => [
                    'total_rows' => $result['total_rows'],
                    'successful' => $result['success_count'],
                    'skipped' => $result['skipped_count'],
                    'errors' => $result['error_count'],
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get audit logs for imports
     */
    public function getAuditLogs(Request $request)
    {
        $query = \App\Models\AuditLog::with('user')
            ->where('action', 'import')
            ->orderBy('created_at', 'desc');

        // Filter by date range
        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        // Filter by model type
        if ($request->filled('model_type')) {
            $query->where('model_type', $request->model_type);
        }

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $logs = $query->paginate($request->get('per_page', 15));

        return response()->json([
            'message' => 'Audit logs retrieved successfully',
            'data' => $logs
        ]);
    }

    /**
     * Get sample data for different import types
     */
    protected function getSampleData(string $type): ?array
    {
        $samples = [
            'families' => [
                [
                    'name' => 'Johnson Family',
                    'slogan' => 'Faith, Family, Future',
                    'description' => 'A family dedicated to serving God and community',
                    'family_head_phone' => '+1234567890',
                    'family_head_email' => 'johnson@example.com',
                ],
                [
                    'name' => 'Smith Family',
                    'slogan' => 'Together in Christ',
                    'description' => 'Building a legacy of faith',
                    'family_head_phone' => '+1234567891',
                    'family_head_email' => 'smith@example.com',
                ],
            ],
            'groups' => [
                [
                    'name' => 'Youth Ministry',
                    'description' => 'Engaging young people in faith',
                    'meeting_day' => 'Sunday',
                    'meeting_time' => '10:00 AM',
                    'meeting_location' => 'Youth Hall',
                    'leader_phone' => '+1234567890',
                    'leader_email' => 'youth@example.com',
                ],
                [
                    'name' => 'Prayer Warriors',
                    'description' => 'Intercessory prayer group',
                    'meeting_day' => 'Wednesday',
                    'meeting_time' => '7:00 PM',
                    'meeting_location' => 'Prayer Room',
                    'leader_phone' => '+1234567891',
                    'leader_email' => 'prayer@example.com',
                ],
            ],
            'members' => [
                [
                    'first_name' => 'John',
                    'last_name' => 'Johnson',
                    'email' => 'john@example.com',
                    'phone' => '+1234567890',
                    'address' => '123 Main St, City, State 12345',
                    'date_of_birth' => '1980-05-15',
                    'gender' => 'male',
                    'marital_status' => 'married',
                    'occupation' => 'Engineer',
                    'emergency_contact_name' => 'Jane Johnson',
                    'emergency_contact_phone' => '+1234567891',
                    'baptism_date' => '1995-06-20',
                    'membership_date' => '2010-01-15',
                    'family_name' => 'Johnson Family',
                    'is_family_head' => 'true',
                ],
                [
                    'first_name' => 'Jane',
                    'last_name' => 'Johnson',
                    'email' => 'jane@example.com',
                    'phone' => '+1234567891',
                    'address' => '123 Main St, City, State 12345',
                    'date_of_birth' => '1982-08-22',
                    'gender' => 'female',
                    'marital_status' => 'married',
                    'occupation' => 'Teacher',
                    'emergency_contact_name' => 'John Johnson',
                    'emergency_contact_phone' => '+1234567890',
                    'baptism_date' => '1997-03-10',
                    'membership_date' => '2010-01-15',
                    'family_name' => 'Johnson Family',
                    'is_family_head' => 'false',
                ],
            ],
            'event_categories' => [
                [
                    'name' => 'Sunday Service',
                    'description' => 'Weekly Sunday worship service with full congregation',
                    'color' => '#3B82F6',
                    'attendance_type' => 'general',
                    'recurrence_pattern' => 'weekly',
                    'weekdays' => '0',
                    'is_recurring' => 'true',
                ],
                [
                    'name' => 'Bible Study',
                    'description' => 'Weekly Bible study sessions for small groups',
                    'color' => '#10B981',
                    'attendance_type' => 'individual',
                    'recurrence_pattern' => 'weekly',
                    'weekdays' => '3',
                    'is_recurring' => 'true',
                ],
                [
                    'name' => 'Prayer Meeting',
                    'description' => 'Daily prayer sessions for intercessory prayer',
                    'color' => '#8B5CF6',
                    'attendance_type' => 'individual',
                    'recurrence_pattern' => 'daily',
                    'weekdays' => '0,1,2,3,4,5,6',
                    'is_recurring' => 'true',
                ],
                [
                    'name' => 'Youth Ministry',
                    'description' => 'Monthly youth ministry events and activities',
                    'color' => '#F59E0B',
                    'attendance_type' => 'general',
                    'recurrence_pattern' => 'monthly',
                    'weekdays' => '0',
                    'is_recurring' => 'true',
                ],
            ],
            'partnership_categories' => [
                [
                    'name' => 'Monthly Partner',
                    'description' => 'Monthly financial partnership',
                ],
                [
                    'name' => 'Annual Partner',
                    'description' => 'Annual financial partnership',
                ],
                [
                    'name' => 'Special Partner',
                    'description' => 'Special event partnerships',
                ],
            ],
            'income_categories' => [
                [
                    'name' => 'Tithes',
                    'description' => 'Member tithes and offerings',
                ],
                [
                    'name' => 'Donations',
                    'description' => 'General donations and gifts',
                ],
            ],
            'expense_categories' => [
                [
                    'name' => 'Utilities',
                    'description' => 'Electricity, water, and other utilities',
                ],
                [
                    'name' => 'Maintenance',
                    'description' => 'Building and equipment maintenance',
                ],
            ],
        ];

        return $samples[$type] ?? null;
    }

    /**
     * Read file and return data array
     */
    protected function readFile($file): array
    {
        $extension = $file->getClientOriginalExtension();
        
        if ($extension === 'csv') {
            return $this->readCsvFile($file);
        } else {
            return $this->readExcelFile($file);
        }
    }

    /**
     * Read CSV file
     */
    protected function readCsvFile($file): array
    {
        $data = [];
        $handle = fopen($file->getPathname(), 'r');
        
        // Read header row
        $headers = fgetcsv($handle);
        
        // Read data rows
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) === count($headers)) {
                $data[] = array_combine($headers, $row);
            }
        }
        
        fclose($handle);
        return $data;
    }

    /**
     * Read Excel file
     */
    protected function readExcelFile($file): array
    {
        try {
            $spreadsheet = IOFactory::load($file->getPathname());
            $worksheet = $spreadsheet->getActiveSheet();
            $rows = $worksheet->toArray();
            
            if (empty($rows)) {
                return [];
            }
            
            // Get headers from first row
            $headers = array_map('trim', $rows[0]);
            
            // Get data rows (skip header)
            $data = [];
            for ($i = 1; $i < count($rows); $i++) {
                $row = array_map('trim', $rows[$i]);
                if (count($row) === count($headers) && !empty(array_filter($row))) {
                    $data[] = array_combine($headers, $row);
                }
            }
            
            return $data;
        } catch (\Exception $e) {
            \Log::error('Excel file reading error: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Process data based on import type
     */
    protected function processData(string $type, array $data): array
    {
        $importService = new ImportService(request());

        switch ($type) {
            case 'families':
                return $importService->importFamilies($data);
            case 'groups':
                return $importService->importGroups($data);
            case 'members':
                return $importService->importMembers($data);
            case 'event_categories':
                return $importService->importEventCategories($data);
            case 'partnership_categories':
                return $importService->importPartnershipCategories($data);
            case 'income_categories':
                return $importService->importIncomeCategories($data);
            case 'expense_categories':
                return $importService->importExpenseCategories($data);
            default:
                throw new \InvalidArgumentException("Invalid import type: {$type}");
        }
    }
} 