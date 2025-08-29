<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Member;
use App\Models\Tithe;
use App\Models\TithePayment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class TithePartialPaymentTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;
    protected $member;
    protected $tithe;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create admin user
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
        
        // Create member
        $this->member = Member::factory()->create();
        
        // Create tithe
        $this->tithe = Tithe::create([
            'member_id' => $this->member->id,
            'amount' => 100.00,
            'frequency' => 'monthly',
            'start_date' => now(),
            'next_due_date' => now()->addMonth(),
            'is_active' => true,
            'is_paid' => false,
            'paid_amount' => 0.00,
            'remaining_amount' => 100.00,
            'created_by' => $this->user->id,
        ]);
    }

    /** @test */
    public function it_can_add_partial_payment_to_tithe()
    {
        $paymentData = [
            'amount' => 50.00,
            'payment_method' => 'cash',
            'reference_number' => 'REF123',
            'notes' => 'Partial payment',
        ];

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", $paymentData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Payment added successfully'
            ]);

        // Check tithe was updated
        $this->tithe->refresh();
        $this->assertEquals(50.00, $this->tithe->paid_amount);
        $this->assertEquals(50.00, $this->tithe->remaining_amount);
        $this->assertFalse($this->tithe->is_paid);

        // Check payment was created
        $this->assertDatabaseHas('tithe_payments', [
            'tithe_id' => $this->tithe->id,
            'amount' => 50.00,
            'payment_method' => 'cash',
            'reference_number' => 'REF123',
        ]);
    }

    /** @test */
    public function it_can_add_multiple_partial_payments()
    {
        // First payment
        $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 30.00,
                'payment_method' => 'cash',
            ]);

        // Second payment
        $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 40.00,
                'payment_method' => 'check',
            ]);

        $this->tithe->refresh();
        $this->assertEquals(70.00, $this->tithe->paid_amount);
        $this->assertEquals(30.00, $this->tithe->remaining_amount);
        $this->assertFalse($this->tithe->is_paid);

        // Check both payments exist
        $this->assertDatabaseCount('tithe_payments', 2);
    }

    /** @test */
    public function it_marks_tithe_as_paid_when_full_amount_is_received()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 100.00,
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(201);

        $this->tithe->refresh();
        $this->assertEquals(100.00, $this->tithe->paid_amount);
        $this->assertEquals(0.00, $this->tithe->remaining_amount);
        $this->assertTrue($this->tithe->is_paid);
        $this->assertNotNull($this->tithe->paid_date);
    }

    /** @test */
    public function it_prevents_payment_exceeding_remaining_amount()
    {
        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 150.00,
                'payment_method' => 'cash',
            ]);

        $response->assertStatus(400)
            ->assertJson([
                'success' => false,
                'message' => 'Payment amount cannot exceed remaining amount of 100'
            ]);

        // Check tithe was not modified
        $this->tithe->refresh();
        $this->assertEquals(0.00, $this->tithe->paid_amount);
        $this->assertEquals(100.00, $this->tithe->remaining_amount);
    }

    /** @test */
    public function it_can_retrieve_payment_history()
    {
        // Add a payment first
        $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 50.00,
                'payment_method' => 'cash',
            ]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/tithes/{$this->tithe->id}/payments");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment history retrieved successfully'
            ]);

        $this->assertCount(1, $response->json('data'));
    }

    /** @test */
    public function it_can_update_payment()
    {
        // Add a payment first
        $paymentResponse = $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 50.00,
                'payment_method' => 'cash',
            ]);

        $payment = TithePayment::where('tithe_id', $this->tithe->id)->first();

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/tithes/{$this->tithe->id}/payments/{$payment->id}", [
                'amount' => 60.00,
                'notes' => 'Updated payment',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment updated successfully'
            ]);

        // Check tithe totals were recalculated
        $this->tithe->refresh();
        $this->assertEquals(60.00, $this->tithe->paid_amount);
        $this->assertEquals(40.00, $this->tithe->remaining_amount);

        // Check payment was updated
        $payment->refresh();
        $this->assertEquals(60.00, $payment->amount);
        $this->assertEquals('Updated payment', $payment->notes);
    }

    /** @test */
    public function it_can_delete_payment()
    {
        // Add a payment first
        $this->actingAs($this->user)
            ->postJson("/api/v1/tithes/{$this->tithe->id}/payments", [
                'amount' => 50.00,
                'payment_method' => 'cash',
            ]);

        $payment = TithePayment::where('tithe_id', $this->tithe->id)->first();

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/tithes/{$this->tithe->id}/payments/{$payment->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Payment deleted successfully'
            ]);

        // Check tithe totals were reset
        $this->tithe->refresh();
        $this->assertEquals(0.00, $this->tithe->paid_amount);
        $this->assertEquals(100.00, $this->tithe->remaining_amount);
        $this->assertFalse($this->tithe->is_paid);

        // Check payment was deleted
        $this->assertDatabaseMissing('tithe_payments', ['id' => $payment->id]);
    }
} 