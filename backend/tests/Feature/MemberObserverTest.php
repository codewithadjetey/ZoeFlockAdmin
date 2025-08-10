<?php

namespace Tests\Feature;

use App\Mail\WelcomeMemberMail;
use App\Models\Member;
use App\Models\User;
use App\Observers\MemberObserver;
use App\Services\MemberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class MemberObserverTest extends TestCase
{
    use RefreshDatabase;

    protected MemberService $memberService;
    protected User $adminUser;

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
        
        // Run the role seeder to create roles
        $this->artisan('db:seed', ['--class' => 'RolePermissionSeeder']);
        
        // Create an admin user for authentication
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');
        
        // Authenticate as admin user
        $this->actingAs($this->adminUser);
        
        $this->memberService = app(MemberService::class);
    }

    #[Test]
    public function it_creates_user_account_when_member_is_created()
    {
        $memberData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'is_active' => true
        ];

        $result = $this->memberService->createMember($memberData);

        $this->assertTrue($result['success']);
        $this->assertTrue($result['data']['user_account_created']);
        
        $member = $result['data']['member'];
        
        $this->assertDatabaseHas('users', [
            'email' => 'test@example.com',
            'name' => 'Test User'
        ]);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'user_id' => User::where('email', 'test@example.com')->first()->id
        ]);
    }

    #[Test]
    public function it_sends_welcome_email_when_member_is_created()
    {
        $memberData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'is_active' => true
        ];

        $result = $this->memberService->createMember($memberData);
        $member = $result['data']['member'];

        Mail::assertSent(WelcomeMemberMail::class, function ($mail) use ($member) {
            return $mail->hasTo($member->email);
        });
    }

    #[Test]
    public function it_links_existing_user_when_member_email_matches()
    {
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com'
        ]);

        $memberData = [
            'first_name' => 'New',
            'last_name' => 'Member',
            'email' => 'existing@example.com',
            'phone' => '+1234567890',
            'is_active' => true
        ];

        $result = $this->memberService->createMember($memberData);
        $member = $result['data']['member'];

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'user_id' => $existingUser->id
        ]);

        // Should not create a new user (only the existing one, plus the admin user for created_by/updated_by)
        $this->assertDatabaseCount('users', 2);
    }

    #[Test]
    public function it_deactivates_user_account_when_member_is_deactivated()
    {
        $memberData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'is_active' => true
        ];

        $result = $this->memberService->createMember($memberData);
        $member = $result['data']['member'];

        // Ensure member has a user account
        $this->assertNotNull($member->user_id);
        
        $user = User::find($member->user_id);
        $this->assertTrue($user->is_active);

        $member->update(['is_active' => false]);

        $user->refresh();
        $this->assertFalse($user->is_active);
    }

    #[Test]
    public function it_reactivates_user_account_when_member_is_reactivated()
    {
        $memberData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'is_active' => false
        ];

        $result = $this->memberService->createMember($memberData);
        $member = $result['data']['member'];

        // Ensure member has a user account
        $this->assertNotNull($member->user_id);
        
        $user = User::find($member->user_id);
        $user->update(['is_active' => false]);

        $member->update(['is_active' => true]);

        $user->refresh();
        $this->assertTrue($user->is_active);
    }

    #[Test]
    public function it_creates_user_account_when_member_is_updated_and_has_no_user()
    {
        $member = Member::factory()->create([
            'is_active' => false,
            'user_id' => null
        ]);

        $member->update(['is_active' => true]);

        $this->assertDatabaseHas('users', [
            'email' => $member->email
        ]);

        $this->assertDatabaseHas('members', [
            'id' => $member->id,
            'user_id' => User::where('email', $member->email)->first()->id
        ]);
    }

    #[Test]
    public function it_assigns_member_role_to_new_user()
    {
        $memberData = [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'phone' => '+1234567890',
            'is_active' => true
        ];

        $result = $this->memberService->createMember($memberData);
        $member = $result['data']['member'];

        // Ensure member has a user account
        $this->assertNotNull($member->user_id);
        
        $user = User::find($member->user_id);
        $this->assertTrue($user->hasRole('member'));
    }
} 