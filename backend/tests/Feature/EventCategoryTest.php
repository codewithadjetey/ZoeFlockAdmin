<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\EventCategory;
use App\Models\Event;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;

class EventCategoryTest extends TestCase
{
    use RefreshDatabase, WithFaker;

    protected $user;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create a user with admin permissions
        $this->user = User::factory()->create();
        $this->user->assignRole('admin');
    }

    /** @test */
    public function it_can_list_event_categories()
    {
        EventCategory::factory()->count(3)->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/event-categories');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'data' => [
                        '*' => [
                            'id', 'name', 'description', 'color', 'icon',
                            'attendance_type', 'is_active', 'is_recurring'
                        ]
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_create_event_category()
    {
        $categoryData = [
            'name' => 'Test Category',
            'description' => 'Test Description',
            'color' => '#FF0000',
            'icon' => 'fas fa-test',
            'attendance_type' => 'individual',
            'is_active' => true,
            'is_recurring' => false
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/event-categories', $categoryData);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Event category created successfully'
            ]);

        $this->assertDatabaseHas('event_categories', [
            'name' => 'Test Category',
            'attendance_type' => 'individual'
        ]);
    }

    /** @test */
    public function it_can_create_recurring_event_category()
    {
        $categoryData = [
            'name' => 'Recurring Category',
            'description' => 'Weekly recurring event',
            'color' => '#00FF00',
            'icon' => 'fas fa-calendar',
            'attendance_type' => 'general',
            'is_active' => true,
            'is_recurring' => true,
            'recurrence_pattern' => 'weekly',
            'recurrence_settings' => [
                'interval' => 1,
                'weekdays' => [1, 3, 5] // Monday, Wednesday, Friday
            ],
            'default_start_time' => '18:00:00',
            'default_duration' => 60,
            'default_location' => 'Main Hall',
            'default_description' => 'Weekly recurring event'
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/event-categories', $categoryData);

        $response->assertStatus(201);

        $this->assertDatabaseHas('event_categories', [
            'name' => 'Recurring Category',
            'is_recurring' => true,
            'recurrence_pattern' => 'weekly'
        ]);
    }

    /** @test */
    public function it_validates_required_fields()
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/event-categories', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'attendance_type']);
    }

    /** @test */
    public function it_validates_recurrence_settings_for_recurring_categories()
    {
        $categoryData = [
            'name' => 'Invalid Recurring',
            'attendance_type' => 'individual',
            'is_recurring' => true
            // Missing recurrence_pattern and recurrence_settings
        ];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/event-categories', $categoryData);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['recurrence_pattern', 'recurrence_settings']);
    }

    /** @test */
    public function it_can_show_event_category()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/event-categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $category->id,
                    'name' => $category->name
                ]
            ]);
    }

    /** @test */
    public function it_can_update_event_category()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);

        $updateData = [
            'name' => 'Updated Category',
            'description' => 'Updated description',
            'color' => '#0000FF'
        ];

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/event-categories/{$category->id}", $updateData);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Event category updated successfully'
            ]);

        $this->assertDatabaseHas('event_categories', [
            'id' => $category->id,
            'name' => 'Updated Category'
        ]);
    }

    /** @test */
    public function it_can_delete_event_category()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/event-categories/{$category->id}");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Event category deleted successfully'
            ]);

        $this->assertDatabaseHas('event_categories', [
            'id' => $category->id,
            'deleted' => true
        ]);
    }

    /** @test */
    public function it_cannot_delete_category_with_events()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);
        Event::factory()->create(['category_id' => $category->id, 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/event-categories/{$category->id}");

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Cannot delete category with existing events. Please delete or reassign events first.'
            ]);
    }

    /** @test */
    public function it_can_get_category_events()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);
        Event::factory()->count(3)->create(['category_id' => $category->id, 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/event-categories/{$category->id}/events");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'category' => [
                        'id' => $category->id
                    ],
                    'events' => [
                        'data' => []
                    ]
                ]
            ]);
    }

    /** @test */
    public function it_can_generate_events_for_recurring_category()
    {
        $category = EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'is_recurring' => true,
            'recurrence_pattern' => 'weekly',
            'recurrence_settings' => [
                'interval' => 1,
                'weekdays' => [1]
            ]
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/event-categories/{$category->id}/generate-events", [
                'count' => 5,
                'auto_publish' => false
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => '5 events generated successfully'
            ]);

        // Check that events were created
        $this->assertDatabaseCount('events', 5);
        $this->assertDatabaseHas('events', [
            'category_id' => $category->id,
            'status' => 'draft'
        ]);
    }

    /** @test */
    public function it_cannot_generate_events_for_non_recurring_category()
    {
        $category = EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'is_recurring' => false
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/event-categories/{$category->id}/generate-events", [
                'count' => 5
            ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'This category is not configured for recurring events'
            ]);
    }

    /** @test */
    public function it_can_toggle_category_status()
    {
        $category = EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'is_active' => true
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/event-categories/{$category->id}/toggle-status");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Category status updated successfully'
            ]);

        $this->assertDatabaseHas('event_categories', [
            'id' => $category->id,
            'is_active' => false
        ]);
    }

    /** @test */
    public function it_can_get_category_statistics()
    {
        $category = EventCategory::factory()->create(['created_by' => $this->user->id]);
        Event::factory()->count(3)->create(['category_id' => $category->id, 'created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->getJson("/api/v1/event-categories/{$category->id}/statistics");

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'total_events' => 3,
                    'attendance_type' => $category->attendance_type
                ]
            ]);
    }

    /** @test */
    public function it_filters_categories_by_attendance_type()
    {
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'attendance_type' => 'individual'
        ]);
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'attendance_type' => 'general'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/event-categories?attendance_type=individual');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('individual', $data[0]['attendance_type']);
    }

    /** @test */
    public function it_filters_categories_by_recurring_status()
    {
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'is_recurring' => true
        ]);
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'is_recurring' => false
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/event-categories?is_recurring=true');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertTrue($data[0]['is_recurring']);
    }

    /** @test */
    public function it_searches_categories_by_name_and_description()
    {
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'name' => 'Sunday Service',
            'description' => 'Weekly worship'
        ]);
        EventCategory::factory()->create([
            'created_by' => $this->user->id,
            'name' => 'Bible Study',
            'description' => 'Scripture discussion'
        ]);

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/event-categories?search=worship');

        $response->assertStatus(200);
        $data = $response->json('data.data');
        $this->assertCount(1, $data);
        $this->assertEquals('Sunday Service', $data[0]['name']);
    }
}
