<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\ImportService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use PhpOffice\PhpSpreadsheet\IOFactory;

/**
 * @OA\Tag(
 *     name="Import",
 *     description="API Endpoints for data import functionality"
 * )
 */
class ImportController extends Controller
{
    protected $importService;

    public function __construct(ImportService $importService)
    {
        $this->importService = $importService;
    }

    /**
     * Get import options and sample files
     * 
     * @OA\Get(
     *     path="/api/v1/import",
     *     summary="Get import options and sample files",
     *     tags={"Import"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Import options retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Import system available"),
     *             @OA\Property(property="available_imports", type="object",
     *                 @OA\Property(property="families", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Families"),
     *                     @OA\Property(property="description", type="string", example="Import family data with family heads"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/families"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/families"),
     *                     @OA\Property(property="type", type="string", example="families")
     *                 ),
     *                 @OA\Property(property="groups", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Groups"),
     *                     @OA\Property(property="description", type="string", example="Import group data with leaders"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/groups"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/groups"),
     *                     @OA\Property(property="type", type="string", example="groups")
     *                 ),
     *                 @OA\Property(property="members", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Members"),
     *                     @OA\Property(property="description", type="string", example="Import member data with family assignments"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/members"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/members"),
     *                     @OA\Property(property="type", type="string", example="members")
     *                 ),
     *                 @OA\Property(property="event_categories", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Event Categories"),
     *                     @OA\Property(property="description", type="string", example="Import event category data. Required fields: name, description, color, attendance_type, recurrence_pattern, weekdays"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/event_categories"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/event_categories"),
     *                     @OA\Property(property="type", type="string", example="event_categories")
     *                 ),
     *                 @OA\Property(property="partnership_categories", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Partnership Categories"),
     *                     @OA\Property(property="description", type="string", example="Import partnership category data. Required fields: name, description"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/partnership_categories"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/partnership_categories"),
     *                     @OA\Property(property="type", type="string", example="partnership_categories")
     *                 ),
     *                 @OA\Property(property="income_categories", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Income Categories"),
     *                     @OA\Property(property="description", type="string", example="Import income category data"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/income_categories"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/income_categories"),
     *                     @OA\Property(property="type", type="string", example="income_categories")
     *                 ),
     *                 @OA\Property(property="expense_categories", type="object",
     *                     @OA\Property(property="name", type="string", example="Import Expense Categories"),
     *                     @OA\Property(property="description", type="string", example="Import expense category data"),
     *                     @OA\Property(property="sample_file", type="string", example="http://example.com/api/v1/import/sample/expense_categories"),
     *                     @OA\Property(property="endpoint", type="string", example="http://example.com/api/v1/import/process/expense_categories"),
     *                     @OA\Property(property="type", type="string", example="expense_categories")
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
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
     * 
     * @OA\Get(
     *     path="/api/v1/import/sample/{type}",
     *     summary="Download sample file for specific import type",
     *     tags={"Import"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="path",
     *         description="Import type",
     *         required=true,
     *         @OA\Schema(type="string", enum={"families", "groups", "members", "event_categories", "partnership_categories", "income_categories", "expense_categories"})
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Sample file downloaded successfully",
     *         @OA\MediaType(
     *             mediaType="text/csv",
     *             @OA\Schema(type="string", format="binary")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Invalid import type",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Invalid import type"),
     *             @OA\Property(property="available_types", type="array", @OA\Items(type="string"))
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
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
     * 
     * @OA\Post(
     *     path="/api/v1/import/process/{type}",
     *     summary="Process import file",
     *     tags={"Import"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="type",
     *         in="path",
     *         description="Import type",
     *         required=true,
     *         @OA\Schema(type="string", enum={"families", "groups", "members", "event_categories", "partnership_categories", "income_categories", "expense_categories"})
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(
     *                     property="file",
     *                     type="string",
     *                     format="binary",
     *                     description="Import file (CSV, XLSX, XLS)"
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Import completed successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Import completed"),
     *             @OA\Property(property="result", type="object",
     *                 @OA\Property(property="total_rows", type="integer", example=100),
     *                 @OA\Property(property="success_count", type="integer", example=95),
     *                 @OA\Property(property="skipped_count", type="integer", example=3),
     *                 @OA\Property(property="error_count", type="integer", example=2),
     *                 @OA\Property(property="errors", type="array", @OA\Items(type="string"))
     *             ),
     *             @OA\Property(property="summary", type="object",
     *                 @OA\Property(property="total_rows", type="integer", example=100),
     *                 @OA\Property(property="successful", type="integer", example=95),
     *                 @OA\Property(property="skipped", type="integer", example=3),
     *                 @OA\Property(property="errors", type="integer", example=2)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Validation error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Validation failed"),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Server error",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Import failed"),
     *             @OA\Property(property="error", type="string", example="Error message")
     *         )
     *     )
     * )
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
     * 
     * @OA\Get(
     *     path="/api/v1/import/audit-logs",
     *     summary="Get audit logs for imports",
     *     tags={"Import"},
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="start_date",
     *         in="query",
     *         description="Start date for filtering logs (Y-m-d)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="end_date",
     *         in="query",
     *         description="End date for filtering logs (Y-m-d)",
     *         required=false,
     *         @OA\Schema(type="string", format="date")
     *     ),
     *     @OA\Parameter(
     *         name="model_type",
     *         in="query",
     *         description="Filter by model type",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filter by status",
     *         required=false,
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Number of logs per page",
     *         required=false,
     *         @OA\Schema(type="integer", default=15)
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Audit logs retrieved successfully",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Audit logs retrieved successfully"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="data", type="array", @OA\Items(
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="user_id", type="integer", example=1),
     *                     @OA\Property(property="action", type="string", example="import"),
     *                     @OA\Property(property="model_type", type="string", example="App\\Models\\Member"),
     *                     @OA\Property(property="model_id", type="integer", example=123),
     *                     @OA\Property(property="old_values", type="object"),
     *                     @OA\Property(property="new_values", type="object"),
     *                     @OA\Property(property="status", type="string", example="success"),
     *                     @OA\Property(property="created_at", type="string", format="date-time"),
     *                     @OA\Property(property="updated_at", type="string", format="date-time"),
     *                     @OA\Property(property="user", type="object")
     *                 )),
     *                 @OA\Property(property="meta", type="object")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Unauthenticated",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthenticated")
     *         )
     *     )
     * )
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