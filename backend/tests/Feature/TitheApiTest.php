<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Member;
use App\Models\Tithe;
use App\Models\Family;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class TitheApiTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $admin;
    protected $familyHead;
    protected $regularMember;
    protected $member;
    protected $family;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
        
        // Create family head user
        $this->familyHead = User::factory()->create();
        $this->familyHead->assignRole('family_head');
        
        // Create regular member user
        $this->regularMember = User::factory()->create();
        $this->regularMember->assignRole('member');
        
        // Create member records
        $this->member = Member::factory()->create([
            'user_id' => $this->regularMember->id,
        ]);
        
        $this->familyHeadMember = Member::factory()->create([
            'user_id' => $this->familyHead->id,
        ]);
        
        // Create family
        $this->family = Family::factory()->create([
            'family_head_id' => $this->familyHeadMember->id,
        ]);
        
        // Add member to family
        $this->family->members()->attach($this->member->id, [
            'role' => 'member',
            'joined_at' => now(),
            'is_active' => true,
        ]);
    }

    /** @test */
    public function admin_can_create_tithe()
    {
        $titheData = [
            'member_id' => $this->member->id,
            'amount' => 100.00,
            'frequency' => 'monthly',
            'start_date' => now()->format('Y-m-d'),
            'notes' => 'Test tithe',
        ];

        $response = $this->actingAs($this->admin)
            ->postJson('/api/v1/tithes', $titheData);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'id',
                    'member_id',
                    'amount',
                    'frequency',
                    'start_date',
                    'next_due_date',
                    'is_active',
                    'is_paid',
                ],
                'message',
            ]);

        $this->assertDatabaseHas('tithes', [
            'member_id' => $this->member->id,
            'amount' => 100.00,
            'frequency' => 'monthly',
        ]);
    }

    /** @test */
    public function non_admin_cannot_create_tithe()
    {
        $titheData = [
            'member_id' => $this->member->id,
            'amount' => 100.00,
            'frequency' => 'monthly',
            'start_date' => now()->format('Y-m-d'),
        ];

        $response = $this->actingAs($this->regularMember)
            ->postJson('/api/v1/tithes', $titheData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_view_all_tithes()
    {
        Tithe::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/tithes');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id',
                            'member_id',
                            'amount',
                            'frequency',
                            'start_date',
                            'next_due_date',
                            'is_active',
                            'is_paid',
                        ],
                    ],
                ],
                'message',
            ]);
    }

    /** @test */
    public function family_head_can_view_family_tithes()
    {
        // Create tithes for family members
        Tithe::factory()->count(3)->create([
            'member_id' => $this->member->id,
        ]);
        
        // Create tithes for other members (should not be visible)
        Tithe::factory()->count(2)->create();

        $response = $this->actingAs($this->familyHead)
            ->getJson('/api/v1/tithes');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertCount(3, $data);
        
        // All visible tithes should belong to family members
        foreach ($data as $tithe) {
            $this->assertContains($tithe['member_id'], [$this->member->id, $this->familyHeadMember->id]);
        }
    }

    /** @test */
    public function regular_member_can_only_view_own_tithes()
    {
        // Create tithe for this member
        Tithe::factory()->create([
            'member_id' => $this->member->id,
        ]);
        
        // Create tithes for other members (should not be visible)
        Tithe::factory()->count(3)->create();

        $response = $this->actingAs($this->regularMember)
            ->getJson('/api/v1/tithes');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals($this->member->id, $data[0]['member_id']);
    }

    /** @test */
    public function admin_can_update_tithe()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
        ]);

        $updateData = [
            'amount' => 150.00,
            'notes' => 'Updated notes',
        ];

        $response = $this->actingAs($this->admin)
            ->putJson("/api/v1/tithes/{$tithe->id}", $updateData);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('tithes', [
            'id' => $tithe->id,
            'amount' => 150.00,
            'notes' => 'Updated notes',
        ]);
    }

    /** @test */
    public function non_admin_cannot_update_tithe()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
        ]);

        $updateData = [
            'amount' => 150.00,
        ];

        $response = $this->actingAs($this->regularMember)
            ->putJson("/api/v1/tithes/{$tithe->id}", $updateData);

        $response->assertStatus(403);
    }

    /** @test */
    public function member_can_mark_own_tithe_as_paid()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
            'is_paid' => false,
        ]);

        $paymentData = [
            'paid_amount' => 110.00,
            'notes' => 'Payment received',
        ];

        $response = $this->actingAs($this->regularMember)
            ->postJson("/api/v1/tithes/{$tithe->id}/mark-paid", $paymentData);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('tithes', [
            'id' => $tithe->id,
            'is_paid' => true,
            'paid_amount' => 110.00,
            'paid_date' => now()->format('Y-m-d'),
        ]);
    }

    /** @test */
    public function family_head_can_mark_family_tithe_as_paid()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
            'is_paid' => false,
        ]);

        $paymentData = [
            'paid_amount' => 100.00,
        ];

        $response = $this->actingAs($this->familyHead)
            ->postJson("/api/v1/tithes/{$tithe->id}/mark-paid", $paymentData);

        $response->assertStatus(200);
        
        $this->assertDatabaseHas('tithes', [
            'id' => $tithe->id,
            'is_paid' => true,
        ]);
    }

    /** @test */
    public function member_cannot_mark_other_member_tithe_as_paid()
    {
        $otherMember = Member::factory()->create();
        $tithe = Tithe::factory()->create([
            'member_id' => $otherMember->id,
            'is_paid' => false,
        ]);

        $paymentData = [
            'paid_amount' => 100.00,
        ];

        $response = $this->actingAs($this->regularMember)
            ->postJson("/api/v1/tithes/{$tithe->id}/mark-paid", $paymentData);

        $response->assertStatus(403);
    }

    /** @test */
    public function admin_can_delete_tithe()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->deleteJson("/api/v1/tithes/{$tithe->id}");

        $response->assertStatus(200);
        
        $this->assertDatabaseMissing('tithes', [
            'id' => $tithe->id,
        ]);
    }

    /** @test */
    public function non_admin_cannot_delete_tithe()
    {
        $tithe = Tithe::factory()->create([
            'member_id' => $this->member->id,
        ]);

        $response = $this->actingAs($this->regularMember)
            ->deleteJson("/api/v1/tithes/{$tithe->id}");

        $response->assertStatus(403);
    }

    /** @test */
    public function can_filter_tithes_by_status()
    {
        Tithe::factory()->count(3)->create(['is_paid' => true]);
        Tithe::factory()->count(2)->create(['is_paid' => false]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/tithes?status=paid');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertCount(3, $data);
        
        foreach ($data as $tithe) {
            $this->assertTrue($tithe['is_paid']);
        }
    }

    /** @test */
    public function can_filter_tithes_by_frequency()
    {
        Tithe::factory()->count(3)->create(['frequency' => 'weekly']);
        Tithe::factory()->count(2)->create(['frequency' => 'monthly']);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/tithes?frequency=weekly');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertCount(3, $data);
        
        foreach ($data as $tithe) {
            $this->assertEquals('weekly', $tithe['frequency']);
        }
    }

    /** @test */
    public function can_get_tithe_statistics()
    {
        Tithe::factory()->count(5)->create(['is_paid' => true]);
        Tithe::factory()->count(3)->create(['is_paid' => false]);

        $response = $this->actingAs($this->admin)
            ->getJson('/api/v1/tithes/statistics');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_tithes',
                    'paid_tithes',
                    'unpaid_tithes',
                    'total_amount',
                    'total_paid_amount',
                    'total_outstanding',
                ],
                'message',
            ]);

        $data = $response->json('data.data');
        $this->assertEquals(8, $data['total_tithes']);
        $this->assertEquals(5, $data['paid_tithes']);
        $this->assertEquals(3, $data['unpaid_tithes']);
    }

    /** @test */
    public function family_head_can_get_family_tithe_statistics()
    {
        // Create tithes for family members
        Tithe::factory()->count(3)->create([
            'member_id' => $this->member->id,
            'is_paid' => true,
        ]);
        Tithe::factory()->count(2)->create([
            'member_id' => $this->member->id,
            'is_paid' => false,
        ]);

        $response = $this->actingAs($this->familyHead)
            ->getJson('/api/v1/tithes/statistics');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertEquals(5, $data['total_tithes']);
        $this->assertEquals(3, $data['paid_tithes']);
        $this->assertEquals(2, $data['unpaid_tithes']);
    }

    /** @test */
    public function regular_member_can_get_own_tithe_statistics()
    {
        Tithe::factory()->count(2)->create([
            'member_id' => $this->member->id,
            'is_paid' => true,
        ]);
        Tithe::factory()->count(1)->create([
            'member_id' => $this->member->id,
            'is_paid' => false,
        ]);

        $response = $this->actingAs($this->regularMember)
            ->getJson('/api/v1/tithes/statistics');

        $response->assertStatus(200);
        
        $data = $response->json('data.data');
        $this->assertEquals(3, $data['total_tithes']);
        $this->assertEquals(2, $data['paid_tithes']);
        $this->assertEquals(1, $data['unpaid_tithes']);
    }
} 