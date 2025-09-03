<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\ImportService;
use App\Models\User;
use App\Models\Member;
use App\Models\Family;
use App\Models\Group;
use App\Models\EventCategory;
use App\Models\PartnershipCategory;
use App\Models\IncomeCategory;
use App\Models\ExpenseCategory;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ImportServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $importService;
    protected $request;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user for the import service
        $user = \App\Models\User::factory()->create();
        
        $this->request = Request::create('/test', 'POST');
        $this->request->setUserResolver(function () use ($user) {
            return $user;
        });
        
        $this->importService = new ImportService($this->request);
    }

    /** @test */
    public function it_can_import_families_successfully()
    {
        $data = [
            [
                'name' => 'Johnson Family',
                'slogan' => 'Faith, Family, Future',
                'description' => 'A family dedicated to serving God',
                'family_head_phone' => '+1234567890',
                'family_head_email' => 'johnson@example.com',
            ],
            [
                'name' => 'Smith Family',
                'slogan' => 'Together in Christ',
                'description' => 'Building a legacy of faith',
                'family_head_phone' => '',
                'family_head_email' => '',
            ],
        ];

        $result = $this->importService->importFamilies($data);

        $this->assertEquals(2, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);
        $this->assertEquals('families', $result['type']);

        // Check that families were created
        $this->assertDatabaseHas('families', [
            'name' => 'Johnson Family',
            'slogan' => 'Faith, Family, Future',
        ]);

        $this->assertDatabaseHas('families', [
            'name' => 'Smith Family',
            'slogan' => 'Together in Christ',
        ]);

        // Check audit logs
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'import',
            'model_type' => 'Family',
        ]);
    }

    /** @test */
    public function it_skips_duplicate_family_names()
    {
        // Create existing family
        Family::create([
            'name' => 'Johnson Family',
            'slogan' => 'Existing Family',
            'active' => true,
            'deleted' => false,
        ]);

        $data = [
            [
                'name' => 'Johnson Family',
                'slogan' => 'New Slogan',
                'description' => 'This should be skipped',
                'family_head_phone' => '',
                'family_head_email' => '',
            ],
        ];

        $result = $this->importService->importFamilies($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(1, $result['skipped_count']);

        // Check that the original family wasn't modified
        $this->assertDatabaseHas('families', [
            'name' => 'Johnson Family',
            'slogan' => 'Existing Family',
        ]);
    }

    /** @test */
    public function it_can_import_groups_successfully()
    {
        $data = [
            [
                'name' => 'Youth Ministry',
                'description' => 'Engaging young people in faith',
                'meeting_day' => 'Sunday',
                'meeting_time' => '10:00 AM',
                'meeting_location' => 'Youth Hall',
                'leader_phone' => '+1234567890',
                'leader_email' => 'youth@example.com',
            ],
        ];

        $result = $this->importService->importGroups($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('groups', [
            'name' => 'Youth Ministry',
            'description' => 'Engaging young people in faith',
            'meeting_day' => 'Sunday',
            'meeting_time' => '10:00 AM',
            'location' => 'Youth Hall',
        ]);
    }

    /** @test */
    public function it_can_import_members_successfully()
    {
        // Create a family first
        $family = Family::create([
            'name' => 'Johnson Family',
            'slogan' => 'Faith, Family, Future',
            'active' => true,
            'deleted' => false,
        ]);

        $data = [
            [
                'first_name' => 'John',
                'last_name' => 'Johnson',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'address' => '123 Main St',
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
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('members', [
            'first_name' => 'John',
            'last_name' => 'Johnson',
            'email' => 'john@example.com',
            'phone' => '+1234567890',
        ]);

        // Check family relationship
        $member = Member::where('email', 'john@example.com')->first();
        $this->assertNotNull($member);
        $this->assertTrue($member->families()->where('family_id', $family->id)->exists());
    }

    /** @test */
    public function it_skips_members_with_duplicate_phone_numbers()
    {
        // Create existing member
        Member::create([
            'first_name' => 'John',
            'last_name' => 'Existing',
            'email' => 'existing@example.com',
            'phone' => '+1234567890',
            'is_active' => true,
            'created_by' => $this->request->user()->id,
        ]);

        $data = [
            [
                'first_name' => 'Jane',
                'last_name' => 'New',
                'email' => 'new@example.com',
                'phone' => '+1234567890', // Same phone number
                'address' => '456 Oak St',
                'date_of_birth' => '1985-03-10',
                'gender' => 'female',
                'marital_status' => 'single',
                'occupation' => 'Teacher',
                'emergency_contact_name' => 'John New',
                'emergency_contact_phone' => '+1234567891',
                'baptism_date' => '1997-03-10',
                'membership_date' => '2015-01-15',
                'family_name' => '',
                'is_family_head' => 'false',
            ],
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(1, $result['skipped_count']);

        // Check that the new member wasn't created
        $this->assertDatabaseMissing('members', [
            'email' => 'new@example.com',
        ]);
    }

    /** @test */
    public function it_skips_members_with_duplicate_emails()
    {
        // Create existing member
        Member::create([
            'first_name' => 'John',
            'last_name' => 'Existing',
            'email' => 'existing@example.com',
            'phone' => '+1234567890',
            'is_active' => true,
            'created_by' => $this->request->user()->id,
        ]);

        $data = [
            [
                'first_name' => 'Jane',
                'last_name' => 'New',
                'email' => 'existing@example.com', // Same email
                'phone' => '+1234567891',
                'address' => '456 Oak St',
                'date_of_birth' => '1985-03-10',
                'gender' => 'female',
                'marital_status' => 'single',
                'occupation' => 'Teacher',
                'emergency_contact_name' => 'John New',
                'emergency_contact_phone' => '+1234567892',
                'baptism_date' => '1997-03-10',
                'membership_date' => '2015-01-15',
                'family_name' => '',
                'is_family_head' => 'false',
            ],
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(1, $result['skipped_count']);
    }

    /** @test */
    public function it_can_import_event_categories_successfully()
    {
        $data = [
            [
                'name' => 'Sunday Service',
                'description' => 'Weekly Sunday worship service',
                'color' => '#3B82F6',
                'is_recurring' => 'true',
                'recurrence_pattern' => 'weekly',
            ],
        ];

        $result = $this->importService->importEventCategories($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('event_categories', [
            'name' => 'Sunday Service',
            'description' => 'Weekly Sunday worship service',
            'color' => '#3B82F6',
            'is_recurring' => true,
            'recurrence_pattern' => 'weekly',
        ]);
    }

    /** @test */
    public function it_can_import_partnership_categories_successfully()
    {
        $data = [
            [
                'name' => 'Monthly Partner',
                'description' => 'Monthly financial partnership',
                'amount' => '100.00',
                'frequency' => 'monthly',
            ],
        ];

        $result = $this->importService->importPartnershipCategories($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('partnership_categories', [
            'name' => 'Monthly Partner',
            'description' => 'Monthly financial partnership',
            'amount' => 100.00,
            'frequency' => 'monthly',
        ]);
    }

    /** @test */
    public function it_can_import_income_categories_successfully()
    {
        $data = [
            [
                'name' => 'Tithes',
                'description' => 'Member tithes and offerings',
            ],
        ];

        $result = $this->importService->importIncomeCategories($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('income_categories', [
            'name' => 'Tithes',
            'description' => 'Member tithes and offerings',
        ]);
    }

    /** @test */
    public function it_can_import_expense_categories_successfully()
    {
        $data = [
            [
                'name' => 'Utilities',
                'description' => 'Electricity, water, and other utilities',
            ],
        ];

        $result = $this->importService->importExpenseCategories($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(0, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertDatabaseHas('expense_categories', [
            'name' => 'Utilities',
            'description' => 'Electricity, water, and other utilities',
        ]);
    }

    /** @test */
    public function it_validates_required_fields_for_families()
    {
        $data = [
            [
                'slogan' => 'Faith, Family, Future',
                'description' => 'A family dedicated to serving God',
                // Missing required 'name' field
            ],
        ];

        $result = $this->importService->importFamilies($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(1, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertStringContainsString('name', $result['errors'][0]['details']['name'][0]);
    }

    /** @test */
    public function it_validates_required_fields_for_members()
    {
        $data = [
            [
                'first_name' => 'John',
                'email' => 'john@example.com',
                // Missing required 'last_name' and 'phone' fields
            ],
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(1, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertStringContainsString('last name', $result['errors'][0]['details']['last_name'][0]);
        $this->assertStringContainsString('phone', $result['errors'][0]['details']['phone'][0]);
    }

    /** @test */
    public function it_validates_email_format()
    {
        $data = [
            [
                'first_name' => 'John',
                'last_name' => 'Johnson',
                'email' => 'invalid-email',
                'phone' => '+1234567890',
                'address' => '123 Main St',
                'date_of_birth' => '1980-05-15',
                'gender' => 'male',
                'marital_status' => 'married',
                'occupation' => 'Engineer',
                'emergency_contact_name' => 'Jane Johnson',
                'emergency_contact_phone' => '+1234567891',
                'baptism_date' => '1995-06-20',
                'membership_date' => '2010-01-15',
                'family_name' => '',
                'is_family_head' => 'false',
            ],
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(0, $result['success_count']);
        $this->assertEquals(1, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        $this->assertStringContainsString('email', $result['errors'][0]['details']['email'][0]);
    }

    /** @test */
    public function it_handles_family_head_assignment_correctly()
    {
        // Create a family first
        $family = Family::create([
            'name' => 'Johnson Family',
            'slogan' => 'Faith, Family, Future',
            'active' => true,
            'deleted' => false,
        ]);

        $data = [
            [
                'first_name' => 'John',
                'last_name' => 'Johnson',
                'email' => 'john@example.com',
                'phone' => '+1234567890',
                'address' => '123 Main St',
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
        ];

        $result = $this->importService->importMembers($data);

        $this->assertEquals(1, $result['success_count']);

        $member = Member::where('email', 'john@example.com')->first();
        $this->assertNotNull($member);

        // Check family relationship with head role
        $familyMember = $member->families()->where('family_id', $family->id)->first();
        $this->assertNotNull($familyMember);
        $this->assertEquals('head', $familyMember->pivot->role);

        // Check that family head was updated
        $family->refresh();
        $this->assertEquals($member->id, $family->family_head_id);
    }

    /** @test */
    public function it_creates_audit_logs_for_successful_imports()
    {
        $data = [
            [
                'name' => 'Johnson Family',
                'slogan' => 'Faith, Family, Future',
                'description' => 'A family dedicated to serving God',
                'family_head_phone' => '',
                'family_head_email' => '',
            ],
        ];

        $result = $this->importService->importFamilies($data);

        $this->assertEquals(1, $result['success_count']);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'import',
            'model_type' => 'Family',
            'status' => 'success',
        ]);

        $auditLog = AuditLog::where('model_type', 'Family')->first();
        $this->assertNotNull($auditLog);
        $this->assertEquals('Imported family: Johnson Family', $auditLog->description);
    }

    /** @test */
    public function it_handles_mixed_success_and_error_results()
    {
        $data = [
            [
                'name' => 'Valid Family',
                'slogan' => 'Valid Slogan',
                'description' => 'Valid description',
                'family_head_phone' => '',
                'family_head_email' => '',
            ],
            [
                'slogan' => 'Invalid Family - Missing Name',
                'description' => 'This should fail validation',
                'family_head_phone' => '',
                'family_head_email' => '',
            ],
        ];

        $result = $this->importService->importFamilies($data);

        $this->assertEquals(1, $result['success_count']);
        $this->assertEquals(1, $result['error_count']);
        $this->assertEquals(0, $result['skipped_count']);

        // Check that valid family was created
        $this->assertDatabaseHas('families', [
            'name' => 'Valid Family',
        ]);

        // Check that invalid family was not created
        $this->assertDatabaseMissing('families', [
            'slogan' => 'Invalid Family - Missing Name',
        ]);
    }
} 