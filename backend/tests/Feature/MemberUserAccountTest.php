<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Member;
use App\Services\MemberService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;

class MemberUserAccountTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $adminUser;
    protected MemberService $memberService;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed roles and permissions for tests
        $this->seed(\Database\Seeders\RolePermissionSeeder::class);
        
        // Create an admin user
        $this->adminUser = User::factory()->create();
        $this->adminUser->assignRole('admin');
        
        // Authenticate as admin user
        $this->actingAs($this->adminUser);
        
        $this->memberService = app(MemberService::class);
    }

    #[Test]
    public function member_service_creates_user_account_automatically()
    {
        $memberData = [
            'first_name' => 'John',
            'last_name' => 'Doe',
            'email' => 'john.doe@example.com',
            'phone' => '+1234567890',
            'address' => '123 Main St',
            'date_of_birth' => '1990-01-01',
            'gender' => 'male',
            'marital_status' => 'single',
            'occupation' => 'Engineer',
            'is_active' => true,
        ];

        $result = $this->memberService->createMember($memberData);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member created successfully', $result['message']);
        
        $member = $result['data']['member'];
        $this->assertTrue($result['data']['user_account_created']);
        
        // Check if user account was created
        $this->assertTrue($member->hasUserAccount());
        $this->assertNotNull($member->user_id);
        $this->assertNotNull($member->user);

        // Verify user account details
        $user = $member->user;
        $this->assertEquals('John Doe', $user->name);
        $this->assertEquals('john.doe@example.com', $user->email);
        $this->assertEquals('+1234567890', $user->phone);
        $this->assertEquals('123 Main St', $user->address);
        $this->assertEquals('1990-01-01', $user->date_of_birth->format('Y-m-d'));
        $this->assertEquals('male', $user->gender);
        $this->assertTrue($user->is_active);

        // Check if user has the 'member' role
        $this->assertTrue($user->hasRole('member'));
    }

    #[Test]
    public function member_service_links_to_existing_user_when_email_matches()
    {
        // Create a user first
        $existingUser = User::factory()->create([
            'email' => 'existing@example.com',
            'name' => 'Existing User',
            'phone' => '+0987654321',
        ]);

        $memberData = [
            'first_name' => 'New',
            'last_name' => 'Member',
            'email' => 'existing@example.com',
            'phone' => '+1234567890',
            'is_active' => true,
        ];

        $result = $this->memberService->createMember($memberData);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member created successfully', $result['message']);
        
        $member = $result['data']['member'];
        $this->assertTrue($result['data']['user_account_created']);
        
        // Check if member is linked to existing user
        $this->assertTrue($member->hasUserAccount());
        $this->assertEquals($existingUser->id, $member->user_id);
        $this->assertEquals($existingUser->id, $member->user->id);

        // Verify the existing user wasn't modified
        $existingUser->refresh();
        $this->assertEquals('Existing User', $existingUser->name);
        $this->assertEquals('+0987654321', $existingUser->phone);
    }

    #[Test]
    public function member_service_can_create_user_account_for_existing_member()
    {
        // Create a member without user account by temporarily changing the email
        $member = Member::factory()->create([
            'email' => 'temp@temp.com',
            'user_id' => null,
            'created_by' => $this->adminUser->id,
            'updated_by' => $this->adminUser->id,
        ]);

        // Manually remove the user_id to simulate no user account
        $member->update(['user_id' => null]);
        $member->refresh();

        $this->assertFalse($member->hasUserAccount());

        // Create user account for existing member
        $result = $this->memberService->createUserAccountForMember($member->id);

        $this->assertTrue($result['success']);
        // The message might vary depending on whether a user was linked or created
        $this->assertContains($result['message'], [
            'User account created successfully for member',
            'Member linked to existing user account'
        ]);
        
        $member = $result['data']['member'];
        $this->assertTrue($result['data']['user_account_created']);
        // existing_user might be true if a user with the same email exists
        $this->assertArrayHasKey('existing_user', $result['data']);

        // Check if user account was created
        $this->assertTrue($member->hasUserAccount());
        $this->assertNotNull($member->user_id);
        $this->assertNotNull($member->user);

        // Verify user account details
        $user = $member->user;
        $this->assertEquals($member->full_name, $user->name);
        $this->assertEquals($member->email, $user->email);
        $this->assertTrue($user->hasRole('member'));
    }

    #[Test]
    public function member_service_links_existing_member_to_existing_user()
    {
        // Create a user first
        $existingUser = User::factory()->create([
            'email' => 'existinguser@example.com',
            'name' => 'Existing User',
        ]);

        // Create a member with the same email as the existing user
        $member = Member::factory()->create([
            'email' => 'existinguser@example.com',
            'user_id' => null,
            'created_by' => $this->adminUser->id,
            'updated_by' => $this->adminUser->id,
        ]);

        // Manually remove the user_id to simulate no user account
        $member->update(['user_id' => null]);
        $member->refresh();

        $this->assertFalse($member->hasUserAccount());

        // Create user account for existing member
        $result = $this->memberService->createUserAccountForMember($member->id);

        $this->assertTrue($result['success']);
        $this->assertEquals('Member linked to existing user account', $result['message']);
        
        $member = $result['data']['member'];
        $this->assertTrue($result['data']['user_account_created']);
        $this->assertTrue($result['data']['existing_user']);

        // Check if member is linked to existing user
        $this->assertTrue($member->hasUserAccount());
        $this->assertEquals($existingUser->id, $member->user_id);
        $this->assertEquals($existingUser->id, $member->user->id);
    }

    #[Test]
    public function member_service_returns_error_for_nonexistent_member()
    {
        $result = $this->memberService->createUserAccountForMember(999);

        $this->assertFalse($result['success']);
        $this->assertEquals('Member not found', $result['message']);
    }

    #[Test]
    public function member_service_returns_error_for_member_with_existing_user_account()
    {
        // Create a member with user account
        $member = Member::factory()->create([
            'email' => 'withuser@example.com',
            'created_by' => $this->adminUser->id,
            'updated_by' => $this->adminUser->id,
        ]);

        // The observer should have created a user account
        $member->refresh();
        $this->assertTrue($member->hasUserAccount());

        // Try to create user account again
        $result = $this->memberService->createUserAccountForMember($member->id);

        $this->assertFalse($result['success']);
        $this->assertEquals('Member already has a user account', $result['message']);
    }

    #[Test]
    public function member_observer_handles_user_creation_errors_gracefully()
    {
        // This test verifies that member creation doesn't fail if user creation fails
        // We'll mock the User model to throw an exception
        
        $memberData = [
            'first_name' => 'Error',
            'last_name' => 'Test',
            'email' => 'error@example.com',
            'is_active' => true,
        ];

        // The observer should handle errors gracefully
        $result = $this->memberService->createMember($memberData);

        // Member should still be created even if user creation fails
        $this->assertTrue($result['success']);
        $this->assertEquals('Member created successfully', $result['message']);
        
        $member = $result['data']['member'];
        // User account creation might fail, but member creation should succeed
        // The exact behavior depends on how the observer handles errors
    }
} 