<?php

use App\Models\Partnership;
use App\Models\Member;
use App\Models\PartnershipCategory;
use Illuminate\Foundation\Testing\RefreshDatabase;

test('example', function () {
    expect(true)->toBeTrue();
});

describe('Partnership API', function () {
    uses(RefreshDatabase::class);

    it('can create a partnership', function () {
        $member = Member::factory()->create();
        $category = PartnershipCategory::factory()->create();
        $data = [
            'member_id' => $member->id,
            'category_id' => $category->id,
            'pledge_amount' => 5000,
            'frequency' => 'monthly',
            'start_date' => now()->toDateString(),
            'end_date' => now()->addMonths(6)->toDateString(),
            'notes' => 'Test partnership',
        ];
        $response = $this->postJson('/api/v1/partnerships', $data);
        $response->assertStatus(201)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.member_id', $member->id)
            ->assertJsonPath('data.category_id', $category->id);
    });

    it('validates required fields on create', function () {
        $response = $this->postJson('/api/v1/partnerships', []);
        $response->assertStatus(422)
            ->assertJson(['success' => false]);
    });

    it('can list partnerships', function () {
        Partnership::factory()->count(3)->create();
        $response = $this->getJson('/api/v1/partnerships');
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['data' => ['data', 'links', 'meta']]);
    });

    it('can show a partnership', function () {
        $partnership = Partnership::factory()->create();
        $response = $this->getJson('/api/v1/partnerships/' . $partnership->id);
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.id', $partnership->id);
    });

    it('returns 404 for missing partnership', function () {
        $response = $this->getJson('/api/v1/partnerships/999999');
        $response->assertStatus(404)
            ->assertJson(['success' => false]);
    });

    it('can update a partnership', function () {
        $partnership = Partnership::factory()->create();
        $newAmount = 9999;
        $response = $this->putJson('/api/v1/partnerships/' . $partnership->id, [
            'pledge_amount' => $newAmount,
        ]);
        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonPath('data.pledge_amount', (string) $newAmount);
    });

    it('can delete a partnership', function () {
        $partnership = Partnership::factory()->create();
        $response = $this->deleteJson('/api/v1/partnerships/' . $partnership->id);
        $response->assertStatus(200)
            ->assertJson(['success' => true]);
        $this->assertDatabaseMissing('partnerships', ['id' => $partnership->id]);
    });
});
