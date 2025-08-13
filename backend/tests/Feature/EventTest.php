<?php

use App\Models\Event;
use App\Models\Family;
use App\Models\Group;
use App\Models\User;
use App\Models\Member;
use App\Observers\MemberObserver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Disable the MemberObserver temporarily to avoid role assignment issues
    Event::getEventDispatcher()->forget('eloquent.created: ' . Member::class);
    
    // Create a test user and authenticate
    $user = User::factory()->create();
    Sanctum::actingAs($user);
    
    // Create a test member for the user
    $member = Member::factory()->create(['user_id' => $user->id]);
});

afterEach(function () {
    // Re-enable the MemberObserver
    Member::observe(MemberObserver::class);
});

describe('Event Management', function () {
    describe('Event CRUD Operations', function () {
        it('can create a basic event', function () {
            $eventData = [
                'title' => 'Test Event',
                'description' => 'Test Description',
                'start_date' => now()->addDays(7)->toISOString(),
                'end_date' => now()->addDays(7)->addHours(2)->toISOString(),
                'location' => 'Test Location',
                'type' => 'general'
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(201)
                    ->assertJsonStructure([
                        'success',
                        'message',
                        'data' => [
                            'id',
                            'title'
                        ]
                    ]);
            
            $this->assertDatabaseHas('events', ['title' => 'Test Event']);
        });

        it('can create an event with families', function () {
            $families = Family::factory()->count(2)->create();
            $familyIds = $families->pluck('id')->toArray();
            
            $eventData = [
                'title' => 'Test Event',
                'description' => 'Test Description',
                'start_date' => now()->addDays(7)->toISOString(),
                'end_date' => now()->addDays(7)->addHours(2)->toISOString(),
                'location' => 'Test Location',
                'type' => 'family',
                'family_ids' => $familyIds
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(201)
                    ->assertJsonStructure([
                        'success',
                        'message',
                        'data' => [
                            'id',
                            'title',
                            'families'
                        ]
                    ]);
            
            $this->assertDatabaseHas('events', ['title' => 'Test Event']);
            $this->assertDatabaseHas('event_families', [
                'event_id' => $response->json('data.id'),
                'family_id' => $familyIds[0]
            ]);
        });

        it('can create an event with groups', function () {
            $groups = Group::factory()->count(2)->create();
            $groupIds = $groups->pluck('id')->toArray();
            
            $eventData = [
                'title' => 'Test Group Event',
                'description' => 'Test Description',
                'start_date' => now()->addDays(7)->toISOString(),
                'end_date' => now()->addDays(7)->addHours(2)->toISOString(),
                'location' => 'Test Location',
                'type' => 'group',
                'group_ids' => $groupIds
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(201);
            $this->assertDatabaseHas('event_groups', [
                'event_id' => $response->json('data.id'),
                'group_id' => $groupIds[0]
            ]);
        });

        it('can create a recurring event', function () {
            $eventData = [
                'title' => 'Recurring Event',
                'description' => 'Test Description',
                'start_date' => now()->addDays(7)->toISOString(),
                'end_date' => now()->addDays(7)->addHours(2)->toISOString(),
                'location' => 'Test Location',
                'type' => 'general',
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => ['interval' => 1, 'weekdays' => [1, 3, 5]],
                'recurrence_end_date' => now()->addMonths(3)->toISOString()
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(201);
            $this->assertDatabaseHas('events', [
                'title' => 'Recurring Event',
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly'
            ]);
        });

        it('creates only one event record for recurring events', function () {
            $eventData = [
                'title' => 'Weekly Meeting',
                'description' => 'A weekly recurring meeting',
                'start_date' => now()->addDays(7)->toISOString(),
                'type' => 'general',
                'is_recurring' => true,
                'recurrence_pattern' => 'weekly',
                'recurrence_settings' => ['interval' => 1, 'weekdays' => [1]],
                'recurrence_end_date' => now()->addMonths(6)->toISOString()
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(201);
            
            // Verify only one event was created
            $this->assertDatabaseCount('events', 1);
            
            // Verify the event has recurring properties
            $event = Event::where('title', 'Weekly Meeting')->first();
            $this->assertTrue($event->is_recurring);
            $this->assertEquals('weekly', $event->recurrence_pattern);
        });

        it('can retrieve events without start dates using show_all filter', function () {
            // Create an event without a start date
            $event = Event::factory()->create([
                'title' => 'Event Without Date',
                'start_date' => null,
                'status' => 'published'
            ]);
            
            $response = $this->getJson('/api/v1/events?show_all=true');
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
            $response->assertJsonPath('data.data.0.title', 'Event Without Date');
        });

        it('defaults to upcoming events when no filters are applied', function () {
            // Create a past event
            $pastEvent = Event::factory()->create([
                'title' => 'Past Event',
                'start_date' => now()->subDays(1),
                'status' => 'published'
            ]);
            
            // Create an upcoming event
            $upcomingEvent = Event::factory()->create([
                'title' => 'Upcoming Event',
                'start_date' => now()->addDays(1),
                'status' => 'published'
            ]);
            
            $response = $this->getJson('/api/v1/events');
            
            $response->assertStatus(200);
            // Should only show upcoming events by default
            $response->assertJsonCount(1, 'data.data');
            $response->assertJsonPath('data.data.0.title', 'Upcoming Event');
        });

        it('validates required fields when creating event', function () {
            $response = $this->postJson('/api/v1/events', []);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['title', 'start_date', 'type']);
        });

        it('validates start date is in the future', function () {
            $eventData = [
                'title' => 'Test Event',
                'start_date' => now()->subDays(1)->toISOString(),
                'type' => 'general'
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['start_date']);
        });

        it('validates end date is after start date', function () {
            $eventData = [
                'title' => 'Test Event',
                'start_date' => now()->addDays(7)->toISOString(),
                'end_date' => now()->addDays(6)->toISOString(),
                'type' => 'general'
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['end_date']);
        });

        it('can retrieve a list of events', function () {
            Event::factory()->published()->upcoming()->count(5)->create();
            
            $response = $this->getJson('/api/v1/events');
            
            $response->assertStatus(200)
                    ->assertJsonStructure([
                        'success',
                        'data' => [
                            'data' => [
                                '*' => [
                                    'id',
                                    'title',
                                    'start_date',
                                    'type'
                                ]
                            ]
                        ]
                    ]);
            
            $response->assertJsonCount(5, 'data.data');
        });

        it('can retrieve a specific event', function () {
            $event = Event::factory()->create();
            
            $response = $this->getJson("/api/v1/events/{$event->id}");
            
            $response->assertStatus(200)
                    ->assertJsonStructure([
                        'success',
                        'data' => [
                            'id',
                            'title',
                            'description',
                            'start_date',
                            'type'
                        ]
                    ]);
        });

        it('can update an event', function () {
            $event = Event::factory()->create();
            
            $updateData = [
                'title' => 'Updated Event Title',
                'description' => 'Updated description',
                'location' => 'New Location'
            ];
            
            $response = $this->putJson("/api/v1/events/{$event->id}", $updateData);
            
            $response->assertStatus(200);
            $this->assertDatabaseHas('events', [
                'id' => $event->id,
                'title' => 'Updated Event Title',
                'description' => 'Updated description',
                'location' => 'New Location'
            ]);
        });

        it('can delete an event', function () {
            $event = Event::factory()->create();
            
            $response = $this->deleteJson("/api/v1/events/{$event->id}");
            
            $response->assertStatus(200);
            $this->assertSoftDeleted('events', ['id' => $event->id]);
        });
    });

    describe('Event Filtering and Scoping', function () {
        it('can filter events by type', function () {
            Event::factory()->forGroups()->create();
            Event::factory()->forFamilies()->create();
            Event::factory()->general()->create();
            
            $response = $this->getJson('/api/v1/events?type=group');
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
            $response->assertJsonPath('data.data.0.type', 'group');
        });

        it('can filter events by status', function () {
            Event::factory()->published()->create();
            Event::factory()->cancelled()->create();
            Event::factory()->create(['status' => 'draft']);
            
            $response = $this->getJson('/api/v1/events?status=published');
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
            $response->assertJsonPath('data.data.0.status', 'published');
        });

        it('can filter events by date range', function () {
            $pastEvent = Event::factory()->past()->create();
            $upcomingEvent = Event::factory()->upcoming()->create();
            
            $response = $this->getJson('/api/v1/events?date_from=' . now()->toISOString());
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
            $response->assertJsonPath('data.data.0.id', $upcomingEvent->id);
        });

        it('can filter events by group', function () {
            $group = Group::factory()->create();
            $event = Event::factory()->published()->create();
            $event->groups()->attach($group->id);
            
            $response = $this->getJson("/api/v1/events?group_id={$group->id}");
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
        });

        it('can filter events by family', function () {
            $family = Family::factory()->create();
            $event = Event::factory()->published()->create();
            $event->families()->attach($family->id);
            
            $response = $this->getJson("/api/v1/events?family_id={$family->id}");
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
        });

        it('can filter events by creator', function () {
            $user = User::factory()->create();
            Event::factory()->published()->create(['created_by' => $user->id]);
            Event::factory()->published()->create(['created_by' => auth()->id()]);
            
            $response = $this->getJson("/api/v1/events?creator_id=" . auth()->id());
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data.data');
        });

        it('defaults to upcoming events when no filters applied', function () {
            Event::factory()->past()->create();
            Event::factory()->upcoming()->create();
            Event::factory()->upcoming()->create();
            
            $response = $this->getJson('/api/v1/events');
            
            $response->assertStatus(200);
            $response->assertJsonCount(2, 'data.data');
        });
    });

    describe('Event Status Management', function () {
        it('can cancel an event', function () {
            $event = Event::factory()->create();
            
            $response = $this->postJson("/api/v1/events/{$event->id}/cancel", [
                'cancellation_reason' => 'Event cancelled due to weather'
            ]);
            
            $response->assertStatus(200);
            $this->assertDatabaseHas('events', [
                'id' => $event->id,
                'status' => 'cancelled',
                'cancelled_at' => now()
            ]);
        });

        it('can publish an event', function () {
            $event = Event::factory()->create(['status' => 'draft']);
            
            $response = $this->postJson("/api/v1/events/{$event->id}/publish");
            
            $response->assertStatus(200);
            $this->assertDatabaseHas('events', [
                'id' => $event->id,
                'status' => 'published'
            ]);
        });
    });

    describe('Event-Family Relationships', function () {
        it('can get families associated with an event', function () {
            $event = Event::factory()->create();
            $families = Family::factory()->count(3)->create();
            $event->families()->attach($families->pluck('id')->toArray());
            
            $response = $this->getJson("/api/v1/events/{$event->id}/families");
            
            $response->assertStatus(200);
            $response->assertJsonCount(3, 'data');
        });

        it('can add families to an event', function () {
            $event = Event::factory()->create();
            $families = Family::factory()->count(2)->create();
            $familyIds = $families->pluck('id')->toArray();
            
            $response = $this->postJson("/api/v1/events/{$event->id}/families", [
                'family_ids' => $familyIds,
                'is_required' => true,
                'notes' => 'All families must attend'
            ]);
            
            $response->assertStatus(201);
            $this->assertDatabaseHas('event_families', [
                'event_id' => $event->id,
                'family_id' => $familyIds[0],
                'is_required' => true
            ]);
        });

        it('can update family event relationship', function () {
            $event = Event::factory()->create();
            $family = Family::factory()->create();
            $event->families()->attach($family->id);
            
            $response = $this->putJson("/api/v1/events/{$event->id}/families/{$family->id}", [
                'is_required' => false,
                'notes' => 'Updated notes'
            ]);
            
            $response->assertStatus(200);
            $this->assertDatabaseHas('event_families', [
                'event_id' => $event->id,
                'family_id' => $family->id,
                'is_required' => false,
                'notes' => 'Updated notes'
            ]);
        });

        it('can remove family from event', function () {
            $event = Event::factory()->create();
            $family = Family::factory()->create();
            $event->families()->attach($family->id);
            
            $response = $this->deleteJson("/api/v1/events/{$event->id}/families/{$family->id}");
            
            $response->assertStatus(200);
            $this->assertDatabaseMissing('event_families', [
                'event_id' => $event->id,
                'family_id' => $family->id
            ]);
        });
    });

    describe('Event-Group Relationships', function () {
        it('can get groups associated with an event', function () {
            $event = Event::factory()->create();
            $groups = Group::factory()->count(3)->create();
            $event->groups()->attach($groups->pluck('id')->toArray());
            
            $response = $this->getJson("/api/v1/events/{$event->id}/groups");
            
            $response->assertStatus(200);
            $response->assertJsonCount(3, 'data');
        });

        it('can add groups to an event', function () {
            $event = Event::factory()->create();
            $groups = Group::factory()->count(2)->create();
            
            $response = $this->postJson("/api/v1/events/{$event->id}/groups", [
                'group_ids' => $groups->pluck('id')->toArray(),
                'is_required' => true,
                'notes' => 'All groups must attend'
            ]);
            
            $response->assertStatus(201);
            $this->assertDatabaseHas('event_groups', [
                'event_id' => $event->id,
                'group_id' => $groups->first()->id,
                'is_required' => true
            ]);
        });

        it('can update group event relationship', function () {
            $event = Event::factory()->create();
            $group = Group::factory()->create();
            $event->groups()->attach($group->id);
            
            $response = $this->putJson("/api/v1/events/{$event->id}/groups/{$group->id}", [
                'is_required' => false,
                'notes' => 'Updated group notes'
            ]);
            
            $response->assertStatus(200);
            $this->assertDatabaseHas('event_groups', [
                'event_id' => $event->id,
                'group_id' => $group->id,
                'is_required' => false,
                'notes' => 'Updated group notes'
            ]);
        });

        it('can remove group from event', function () {
            $event = Event::factory()->create();
            $group = Group::factory()->create();
            $event->groups()->attach($group->id);
            
            $response = $this->deleteJson("/api/v1/events/{$event->id}/groups/{$group->id}");
            
            $response->assertStatus(200);
            $this->assertDatabaseMissing('event_groups', [
                'event_id' => $event->id,
                'group_id' => $group->id
            ]);
        });
    });

    describe('Member-Specific Events', function () {
        it('can get events for a specific member', function () {
            $member = Member::factory()->create();
            $event = Event::factory()->published()->create(['type' => 'general']);
            
            $response = $this->getJson("/api/v1/events/member/{$member->id}");
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data');
        });

        it('can filter member events by date range', function () {
            $member = Member::factory()->create();
            $family = Family::factory()->create();
            $member->families()->attach($family->id, ['is_active' => true, 'role' => 'member']);
            
            $pastEvent = Event::factory()->past()->published()->create();
            $upcomingEvent = Event::factory()->upcoming()->published()->create();
            
            $pastEvent->families()->attach($family->id);
            $upcomingEvent->families()->attach($family->id);
            
            $response = $this->getJson("/api/v1/events/member/{$member->id}?date_from=" . now()->toISOString());
            
            $response->assertStatus(200);
            $response->assertJsonCount(1, 'data');
            $response->assertJsonPath('data.0.id', $upcomingEvent->id);
        });
    });

    describe('Event Validation and Error Handling', function () {
        it('validates event type is valid', function () {
            $eventData = [
                'title' => 'Test Event',
                'start_date' => now()->addDays(7)->toISOString(),
                'type' => 'invalid_type'
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['type']);
        });

        it('validates recurrence pattern when event is recurring', function () {
            $eventData = [
                'title' => 'Test Event',
                'start_date' => now()->addDays(7)->toISOString(),
                'type' => 'general',
                'is_recurring' => true,
                'recurrence_pattern' => 'invalid_pattern'
            ];
            
            $response = $this->postJson('/api/v1/events', $eventData);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['recurrence_pattern']);
        });

        it('validates family exists when adding to event', function () {
            $event = Event::factory()->create();
            
            $response = $this->postJson("/api/v1/events/{$event->id}/families", [
                'family_ids' => [99999]
            ]);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['family_ids.0']);
        });

        it('validates group exists when adding to event', function () {
            $event = Event::factory()->create();
            
            $response = $this->postJson("/api/v1/events/{$event->id}/groups", [
                'group_ids' => [99999]
            ]);
            
            $response->assertStatus(422)
                    ->assertJsonValidationErrors(['group_ids.0']);
        });
    });

    describe('Event Scopes and Access Control', function () {
        it('can access upcoming events scope', function () {
            Event::factory()->upcoming()->count(3)->create();
            Event::factory()->past()->count(2)->create();
            
            $upcomingEvents = Event::upcoming()->get();
            
            $this->assertCount(3, $upcomingEvents);
            foreach ($upcomingEvents as $event) {
                $this->assertTrue($event->start_date > now());
            }
        });

        it('can access past events scope', function () {
            Event::factory()->past()->count(3)->create();
            Event::factory()->upcoming()->count(2)->create();
            
            $pastEvents = Event::past()->get();
            
            $this->assertCount(3, $pastEvents);
            foreach ($pastEvents as $event) {
                $this->assertTrue($event->start_date < now());
            }
        });

        it('can access published events scope', function () {
            Event::factory()->published()->count(3)->create();
            Event::factory()->create(['status' => 'draft']);
            
            $publishedEvents = Event::published()->get();
            
            $this->assertCount(3, $publishedEvents);
            foreach ($publishedEvents as $event) {
                $this->assertEquals('published', $event->status);
            }
        });

        it('can access recurring events scope', function () {
            Event::factory()->recurring()->count(3)->create();
            Event::factory()->count(2)->create(['is_recurring' => false]);
            
            $recurringEvents = Event::recurring()->get();
            
            $this->assertCount(3, $recurringEvents);
            foreach ($recurringEvents as $event) {
                $this->assertTrue($event->is_recurring);
            }
        });
    });
}); 