<?php

namespace Tests\Feature;

use App\Models\Family;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FamilyTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected User $user;
    protected Member $member;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->user = User::factory()->create();
        $this->member = Member::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_can_create_family()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/families', [
                'name' => 'Test Family',
                'slogan' => 'Test Slogan',
                'description' => 'Test Description',
                'family_head_id' => $this->member->id,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Family created successfully',
            ]);

        $this->assertDatabaseHas('families', [
            'name' => 'Test Family',
            'slogan' => 'Test Slogan',
            'description' => 'Test Description',
            'family_head_id' => $this->member->id,
        ]);

        // Check that the family head is added as a member
        $this->assertDatabaseHas('family_members', [
            'family_id' => 1,
            'member_id' => $this->member->id,
            'role' => 'head',
            'is_active' => true,
        ]);
    }

    public function test_cannot_create_family_with_existing_family_head()
    {
        // Create a family first
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        // Try to create another family with the same member as head
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/families', [
                'name' => 'Another Family',
                'family_head_id' => $this->member->id,
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Family head is already a member of another family',
            ]);
    }

    public function test_can_add_member_to_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $newMember = Member::factory()->create();

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/families/{$family->id}/members", [
                'member_id' => $newMember->id,
                'role' => 'member',
                'notes' => 'New family member',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Member added to family successfully',
            ]);

        $this->assertDatabaseHas('family_members', [
            'family_id' => $family->id,
            'member_id' => $newMember->id,
            'role' => 'member',
            'is_active' => true,
        ]);
    }

    public function test_cannot_add_member_already_in_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/families/{$family->id}/members", [
                'member_id' => $this->member->id,
                'role' => 'member',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Member is already in this family',
            ]);
    }

    public function test_cannot_add_member_already_in_another_family()
    {
        // Create first family
        $family1 = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family1->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        // Create second family
        $member2 = Member::factory()->create();
        $family2 = Family::factory()->create(['family_head_id' => $member2->id]);
        $member2->families()->attach($family2->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        // Try to add member2 to family1
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/families/{$family1->id}/members", [
                'member_id' => $member2->id,
                'role' => 'member',
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Member is already a member of another family',
            ]);
    }

    public function test_can_remove_member_from_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $memberToRemove = Member::factory()->create();
        $family->members()->attach($memberToRemove->id, [
            'role' => 'member',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/families/{$family->id}/members/{$memberToRemove->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Member removed from family successfully',
            ]);

        $this->assertDatabaseMissing('family_members', [
            'family_id' => $family->id,
            'member_id' => $memberToRemove->id,
        ]);
    }

    public function test_cannot_remove_family_head()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/families/{$family->id}/members/{$this->member->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot remove the family head',
            ]);
    }

    public function test_can_get_family_members()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/families/{$family->id}/members");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Family members retrieved successfully',
            ]);
    }

    public function test_can_get_my_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/families/my-family');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Your family retrieved successfully',
            ]);
    }

    public function test_can_update_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/families/{$family->id}", [
                'name' => 'Updated Family Name',
                'slogan' => 'Updated Slogan',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Family updated successfully',
            ]);

        $this->assertDatabaseHas('families', [
            'id' => $family->id,
            'name' => 'Updated Family Name',
            'slogan' => 'Updated Slogan',
        ]);
    }

    public function test_can_delete_family()
    {
        $family = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/families/{$family->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Family deleted successfully',
            ]);

        $this->assertDatabaseHas('families', [
            'id' => $family->id,
            'deleted' => true,
        ]);
    }

    public function test_member_can_only_belong_to_one_family()
    {
        // Create first family
        $family1 = Family::factory()->create(['family_head_id' => $this->member->id]);
        $this->member->families()->attach($family1->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        // Try to create second family with same member
        $member2 = Member::factory()->create();
        $family2 = Family::factory()->create(['family_head_id' => $member2->id]);
        $member2->families()->attach($family2->id, [
            'role' => 'head',
            'is_active' => true,
        ]);

        // Verify member is only in one family
        $this->assertEquals(1, $this->member->family_count);
        $this->assertEquals(1, $member2->family_count);

        // Verify the constraint is enforced at database level
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        // This should fail due to unique constraint
        $family1->members()->attach($member2->id, [
            'role' => 'member',
            'is_active' => true,
        ]);
    }
} 