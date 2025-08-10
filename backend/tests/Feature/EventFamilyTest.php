<?php

use App\Models\Event;
use App\Models\Family;
use App\Models\EventFamily;
use App\Models\User;
use App\Models\Member;
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
    Member::observe(Member::class);
});

describe('EventFamily Pivot Model', function () {
    it('can create an event-family relationship with pivot data', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $eventFamily = EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true,
            'notes' => 'This family is required for the event'
        ]);
        
        $this->assertDatabaseHas('event_families', [
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true,
            'notes' => 'This family is required for the event'
        ]);
        
        $this->assertInstanceOf(EventFamily::class, $eventFamily);
    });
    
    it('can access event through relationship', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $eventFamily = EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => false
        ]);
        
        $this->assertInstanceOf(Event::class, $eventFamily->event);
        $this->assertEquals($event->id, $eventFamily->event->id);
    });
    
    it('can access family through relationship', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $eventFamily = EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => false
        ]);
        
        $this->assertInstanceOf(Family::class, $eventFamily->family);
        $this->assertEquals($family->id, $eventFamily->family->id);
    });
    
    it('casts is_required to boolean', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $eventFamily = EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => 1
        ]);
        
        $this->assertTrue($eventFamily->is_required);
        $this->assertIsBool($eventFamily->is_required);
    });
    
    it('can update pivot data', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $eventFamily = EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => false,
            'notes' => 'Initial notes'
        ]);
        
        EventFamily::where('event_id', $event->id)
            ->where('family_id', $family->id)
            ->update([
                'is_required' => true,
                'notes' => 'Updated notes'
            ]);
        
        $this->assertDatabaseHas('event_families', [
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true,
            'notes' => 'Updated notes'
        ]);
    });
    
    it('enforces unique constraint on event_id and family_id', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        // Create first relationship
        EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => false
        ]);
        
        // Attempt to create duplicate relationship
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        EventFamily::create([
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true
        ]);
    });
    
    it('can be created through event-families relationship', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $event->families()->attach($family->id, [
            'is_required' => true,
            'notes' => 'Created through relationship'
        ]);
        
        $this->assertDatabaseHas('event_families', [
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true,
            'notes' => 'Created through relationship'
        ]);
        
        $this->assertTrue($event->families->contains($family));
    });
    
    it('can be updated through event-families relationship', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $event->families()->attach($family->id, [
            'is_required' => false,
            'notes' => 'Initial notes'
        ]);
        
        $event->families()->updateExistingPivot($family->id, [
            'is_required' => true,
            'notes' => 'Updated notes'
        ]);
        
        $this->assertDatabaseHas('event_families', [
            'event_id' => $event->id,
            'family_id' => $family->id,
            'is_required' => true,
            'notes' => 'Updated notes'
        ]);
    });
    
    it('can be detached through event-families relationship', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $event->families()->attach($family->id, [
            'is_required' => false
        ]);
        
        $this->assertTrue($event->families->contains($family));
        
        $event->families()->detach($family->id);
        
        $this->assertFalse($event->fresh()->families->contains($family));
        $this->assertDatabaseMissing('event_families', [
            'event_id' => $event->id,
            'family_id' => $family->id
        ]);
    });
    
    it('can sync multiple families with pivot data', function () {
        $event = Event::factory()->create();
        $families = Family::factory()->count(3)->create();
        
        $familyData = $families->mapWithKeys(function ($family, $index) {
            return [$family->id => [
                'is_required' => $index === 0, // First family is required
                'notes' => 'Family ' . ($index + 1) . ' notes'
            ]];
        })->toArray();
        
        $event->families()->sync($familyData);
        
        foreach ($families as $index => $family) {
            $this->assertDatabaseHas('event_families', [
                'event_id' => $event->id,
                'family_id' => $family->id,
                'is_required' => $index === 0,
                'notes' => 'Family ' . ($index + 1) . ' notes'
            ]);
        }
        
        $this->assertEquals(3, $event->families()->count());
    });
    
    it('can access pivot data through relationships', function () {
        $event = Event::factory()->create();
        $family = Family::factory()->create();
        
        $event->families()->attach($family->id, [
            'is_required' => true,
            'notes' => 'Important family'
        ]);
        
        $event->load('families');
        $familyWithPivot = $event->families->first();
        
        $this->assertEquals(true, $familyWithPivot->pivot->is_required);
        $this->assertEquals('Important family', $familyWithPivot->pivot->notes);
        $this->assertInstanceOf(\Illuminate\Database\Eloquent\Relations\Pivot::class, $familyWithPivot->pivot);
    });
}); 