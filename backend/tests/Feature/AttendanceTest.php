<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Event;
use App\Models\Member;
use App\Models\Group;
use App\Models\Family;
use App\Models\Attendance;
use App\Models\GeneralAttendance;
use App\Services\AttendanceService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class AttendanceTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $event;
    protected $member;
    protected $attendanceService;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->attendanceService = app(AttendanceService::class);
        
        // Create a user
        $this->user = User::factory()->create();
        
        // Create an event
        $this->event = Event::factory()->create([
            'status' => 'published',
            'start_date' => now()->addDay(),
            'type' => 'general'
        ]);
        
        // Create a member
        $this->member = Member::factory()->create([
            'is_active' => true
        ]);
    }

    /** @test */
    public function it_can_create_attendance_records_for_an_event()
    {
        $result = $this->attendanceService->createEventAttendance($this->event);
        
        $this->assertTrue($result['success']);
        $this->assertGreaterThan(0, $result['created_records']);
        
        // Check if attendance record was created
        $attendance = Attendance::where('event_id', $this->event->id)
            ->where('member_id', $this->member->id)
            ->first();
            
        $this->assertNotNull($attendance);
        $this->assertEquals('absent', $attendance->status);
    }

    /** @test */
    public function it_can_update_attendance_status()
    {
        // First create attendance record
        $this->attendanceService->createEventAttendance($this->event);
        
        $result = $this->attendanceService->updateAttendanceStatus(
            $this->event->id,
            $this->member->id,
            'present',
            'Member attended the event'
        );
        
        $this->assertTrue($result['success']);
        
        $attendance = Attendance::where('event_id', $this->event->id)
            ->where('member_id', $this->member->id)
            ->first();
            
        $this->assertEquals('present', $attendance->status);
        $this->assertEquals('Member attended the event', $attendance->notes);
    }

    /** @test */
    public function it_can_mark_check_in_and_check_out()
    {
        // First create attendance record
        $this->attendanceService->createEventAttendance($this->event);
        
        // Mark check-in
        $checkInResult = $this->attendanceService->markCheckIn($this->event->id, $this->member->id);
        $this->assertTrue($checkInResult['success']);
        
        // Mark check-out
        $checkOutResult = $this->attendanceService->markCheckOut($this->event->id, $this->member->id);
        $this->assertTrue($checkOutResult['success']);
        
        $attendance = Attendance::where('event_id', $this->event->id)
            ->where('member_id', $this->member->id)
            ->first();
            
        $this->assertNotNull($attendance->check_in_time);
        $this->assertNotNull($attendance->check_out_time);
    }

    /** @test */
    public function it_can_create_general_attendance()
    {
        $result = $this->attendanceService->updateGeneralAttendance(
            $this->event->id,
            150,
            25,
            'Great turnout for the event'
        );
        
        $this->assertTrue($result['success']);
        
        $generalAttendance = GeneralAttendance::where('event_id', $this->event->id)->first();
        $this->assertNotNull($generalAttendance);
        $this->assertEquals(150, $generalAttendance->total_attendance);
        $this->assertEquals(25, $generalAttendance->first_timers_count);
    }

    /** @test */
    public function it_can_get_attendance_statistics()
    {
        // Create attendance records
        $this->attendanceService->createEventAttendance($this->event);
        
        // Update some attendance statuses
        $this->attendanceService->updateAttendanceStatus($this->event->id, $this->member->id, 'present');
        
        // Create general attendance
        $this->attendanceService->updateGeneralAttendance($this->event->id, 100, 15);
        
        $stats = $this->attendanceService->getEventAttendanceStats($this->event->id);
        
        $this->assertArrayHasKey('individual_attendance', $stats);
        $this->assertArrayHasKey('general_attendance', $stats);
        $this->assertEquals(1, $stats['individual_attendance']['present']);
        $this->assertEquals(100, $stats['general_attendance']['total_attendance']);
    }

    /** @test */
    public function it_handles_group_specific_events()
    {
        // Create a group event
        $groupEvent = Event::factory()->create([
            'status' => 'published',
            'start_date' => now()->addDay(),
            'type' => 'group'
        ]);
        
        // Create a group
        $group = Group::factory()->create();
        
        // Associate group with event
        $groupEvent->groups()->attach($group->id);
        
        // Associate member with group
        $this->member->groups()->attach($group->id);
        
        $eligibleMembers = $this->attendanceService->getEligibleMembersForEvent($groupEvent);
        
        $this->assertTrue($eligibleMembers->contains($this->member));
    }

    /** @test */
    public function it_handles_family_specific_events()
    {
        // Create a family event
        $familyEvent = Event::factory()->create([
            'status' => 'published',
            'start_date' => now()->addDay(),
            'type' => 'family'
        ]);
        
        // Create a family
        $family = Family::factory()->create();
        
        // Associate family with event
        $familyEvent->families()->attach($family->id);
        
        // Associate member with family
        $this->member->families()->attach($family->id);
        
        $eligibleMembers = $this->attendanceService->getEligibleMembersForEvent($familyEvent);
        
        $this->assertTrue($eligibleMembers->contains($this->member));
    }

    /** @test */
    public function it_prevents_duplicate_attendance_records()
    {
        // Create attendance records twice
        $result1 = $this->attendanceService->createEventAttendance($this->event);
        $result2 = $this->attendanceService->createEventAttendance($this->event);
        
        $this->assertTrue($result1['success']);
        $this->assertTrue($result2['success']);
        
        // Second call should not create new records (should return 0)
        $this->assertEquals(0, $result2['created_records']);
        
        // Total attendance records should equal the number of eligible members
        $totalRecords = Attendance::where('event_id', $this->event->id)->count();
        $this->assertEquals($result1['total_eligible_members'], $totalRecords);
        
        // Verify that no duplicate records were created
        $this->assertEquals($result1['created_records'], $totalRecords);
    }
} 