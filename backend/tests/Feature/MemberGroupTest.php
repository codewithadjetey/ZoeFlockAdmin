<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Member;
use App\Models\Group;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use PHPUnit\Framework\Attributes\Test;

class MemberGroupTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Member $member;
    protected Group $group1;
    protected Group $group2;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user for authentication
        $this->user = User::factory()->create();
        
        // Create test members
        $this->member = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);
        
        // Create test groups
        $this->group1 = Group::factory()->create([
            'name' => 'Youth Ministry',
            'category' => 'Ministry',
            'max_members' => 20,
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);
        
        $this->group2 = Group::factory()->create([
            'name' => 'Bible Study',
            'category' => 'Education',
            'max_members' => 15,
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);
    }

    #[Test]
    public function member_can_belong_to_multiple_groups()
    {
        // Add member to first group
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Add member to second group
        $this->group2->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Refresh member to load relationships
        $this->member->refresh();

        // Assert member belongs to both groups
        $this->assertCount(2, $this->member->groups);
        $this->assertTrue($this->member->isInGroup($this->group1->id));
        $this->assertTrue($this->member->isInGroup($this->group2->id));
        
        // Check roles
        $this->assertEquals('member', $this->member->getRoleInGroup($this->group1->id));
        $this->assertEquals('leader', $this->member->getRoleInGroup($this->group2->id));
    }

    #[Test]
    public function member_groups_relationship_returns_correct_data()
    {
        // Add member to group with specific data
        $this->group1->members()->attach($this->member->id, [
            'role' => 'coordinator',
            'joined_at' => now(),
            'is_active' => true,
            'notes' => 'Test member',
        ]);

        $this->member->refresh();

        $group = $this->member->groups->first();
        
        $this->assertEquals($this->group1->id, $group->id);
        $this->assertEquals('coordinator', $group->pivot->role);
        $this->assertEquals('Test member', $group->pivot->notes);
        $this->assertEquals(1, $group->pivot->is_active);
    }

    #[Test]
    public function member_can_be_removed_from_groups()
    {
        // Add member to both groups
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);
        
        $this->group2->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->member->refresh();
        $this->assertCount(2, $this->member->groups);

        // Remove from first group
        $this->member->groups()->detach($this->group1->id);
        
        $this->member->refresh();
        $this->assertCount(1, $this->member->groups);
        $this->assertFalse($this->member->isInGroup($this->group1->id));
        $this->assertTrue($this->member->isInGroup($this->group2->id));
    }

    #[Test]
    public function member_group_count_attributes_work_correctly()
    {
        // Add member to groups
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);
        
        $this->group2->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => false, // Inactive membership
        ]);

        $this->member->refresh();
        
        // Should only count active memberships for active_groups_count
        $this->assertEquals(1, $this->member->active_groups_count);
        // groups_count should count all groups (active and inactive)
        $this->assertEquals(2, $this->member->groups_count);
    }

    #[Test]
    public function group_member_count_attributes_work_correctly()
    {
        // Add member to group
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group1->refresh();
        
        $this->assertEquals(1, $this->group1->member_count);
        $this->assertEquals(19, $this->group1->available_spots); // 20 - 1
        $this->assertFalse($this->group1->is_full);
    }

    #[Test]
    public function group_can_check_if_member_can_join()
    {
        // Group should allow member to join initially
        $this->assertTrue($this->group1->canMemberJoin($this->member->id));
        
        // Add member to group
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);
        
        // Group should not allow member to join again
        $this->assertFalse($this->group1->canMemberJoin($this->member->id));
    }

    #[Test]
    public function group_cannot_exceed_max_members()
    {
        // Create a small group with max_members = 2
        $smallGroup = Group::factory()->create([
            'name' => 'Small Group',
            'max_members' => 2,
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        // Create additional members
        $member2 = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        $member3 = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        // Add first member
        $smallGroup->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Add second member
        $smallGroup->members()->attach($member2->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $smallGroup->refresh();
        
        // Group should now be full
        $this->assertTrue($smallGroup->is_full);
        $this->assertEquals(0, $smallGroup->available_spots);
        
        // Third member should not be able to join
        $this->assertFalse($smallGroup->canMemberJoin($member3->id));
    }

    #[Test]
    public function member_can_have_different_roles_in_different_groups()
    {
        // Add member to first group as leader
        $this->group1->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Add member to second group as coordinator
        $this->group2->members()->attach($this->member->id, [
            'role' => 'coordinator',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->member->refresh();

        // Check roles are different in each group
        $this->assertEquals('leader', $this->member->getRoleInGroup($this->group1->id));
        $this->assertEquals('coordinator', $this->member->getRoleInGroup($this->group2->id));
    }

    #[Test]
    public function member_can_be_deactivated_in_group_without_removal()
    {
        // Add member to group
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->member->refresh();
        $this->assertCount(1, $this->member->groups);
        $this->assertEquals(1, $this->member->active_groups_count);

        // Deactivate membership (don't remove)
        $this->group1->members()->updateExistingPivot($this->member->id, [
            'is_active' => false,
            'left_at' => now(),
        ]);

        $this->member->refresh();
        
        // Member should still be in group but inactive
        $this->assertCount(1, $this->member->groups);
        $this->assertEquals(0, $this->member->active_groups_count);
        $this->assertFalse($this->member->groups->first()->pivot->is_active);
    }

    #[Test]
    public function group_can_get_members_by_role()
    {
        // Create additional members
        $member2 = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        $member3 = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        // Add members with different roles
        $this->group1->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group1->members()->attach($member2->id, [
            'role' => 'coordinator',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group1->members()->attach($member3->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group1->refresh();

        // Test getting members by role
        $leaders = $this->group1->getMembersByRole('leader');
        $coordinators = $this->group1->getMembersByRole('coordinator');
        $members = $this->group1->getMembersByRole('member');

        $this->assertCount(1, $leaders);
        $this->assertCount(1, $coordinators);
        $this->assertCount(1, $members);

        $this->assertEquals($this->member->id, $leaders->first()->id);
        $this->assertEquals($member2->id, $coordinators->first()->id);
        $this->assertEquals($member3->id, $members->first()->id);
    }

    #[Test]
    public function group_scope_methods_work_correctly()
    {
        // Create additional groups with different statuses
        $activeGroup = Group::factory()->create([
            'name' => 'Active Group',
            'status' => 'Active',
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        $inactiveGroup = Group::factory()->create([
            'name' => 'Inactive Group',
            'status' => 'Inactive',
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        // Test active scope
        $activeGroups = Group::active()->get();
        $this->assertTrue($activeGroups->contains($activeGroup));
        $this->assertFalse($activeGroups->contains($inactiveGroup));

        // Test inactive scope
        $inactiveGroups = Group::inactive()->get();
        $this->assertTrue($inactiveGroups->contains($inactiveGroup));
        $this->assertFalse($inactiveGroups->contains($activeGroup));

        // Test byCategory scope
        $ministryGroups = Group::byCategory('Ministry')->get();
        $this->assertTrue($ministryGroups->contains($this->group1));
        $this->assertFalse($ministryGroups->contains($this->group2));
    }

    #[Test]
    public function member_scope_methods_work_correctly()
    {
        // Create additional members
        $member2 = Member::factory()->create([
            'is_active' => false,
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        // Add members to groups
        $this->group1->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group1->members()->attach($member2->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => false,
        ]);

        // Test active scope
        $activeMembers = Member::active()->get();
        $this->assertTrue($activeMembers->contains($this->member));
        $this->assertFalse($activeMembers->contains($member2));

        // Test inactive scope
        $inactiveMembers = Member::inactive()->get();
        $this->assertTrue($inactiveMembers->contains($member2));
        $this->assertFalse($inactiveMembers->contains($this->member));

        // Test byGroup scope
        $groupMembers = Member::byGroup($this->group1->id)->get();
        $this->assertTrue($groupMembers->contains($this->member));
        $this->assertTrue($groupMembers->contains($member2));

        // Test byGroupRole scope
        $leaders = Member::byGroupRole('leader')->get();
        $this->assertTrue($leaders->contains($this->member));
        $this->assertFalse($leaders->contains($member2));
    }

    #[Test]
    public function group_membership_validation_prevents_duplicates()
    {
        // Add member to group
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        // Try to add the same member again - should fail due to unique constraint
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        $this->group1->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);
    }

    #[Test]
    public function member_primary_group_attribute_works_correctly()
    {
        // Add member to multiple groups
        $this->group1->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->group2->members()->attach($this->member->id, [
            'role' => 'leader',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $this->member->refresh();

        // Primary group should be the first one joined (group1)
        $primaryGroup = $this->member->primary_group;
        $this->assertEquals($this->group1->id, $primaryGroup->id);
        $this->assertEquals('member', $primaryGroup->pivot->role);
    }

    #[Test]
    public function group_available_spots_calculation_is_correct()
    {
        // Test with different max_members values
        $smallGroup = Group::factory()->create([
            'name' => 'Small Group',
            'max_members' => 5,
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        $this->assertEquals(5, $smallGroup->available_spots);

        // Add members
        $smallGroup->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);

        $smallGroup->refresh();
        $this->assertEquals(4, $smallGroup->available_spots);

        // Add inactive member (should not affect available spots)
        $member2 = Member::factory()->create([
            'created_by' => $this->user->id,
            'updated_by' => $this->user->id,
        ]);

        $smallGroup->members()->attach($member2->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => false,
        ]);

        $smallGroup->refresh();
        $this->assertEquals(4, $smallGroup->available_spots); // Still 4 because inactive member doesn't count
    }
} 