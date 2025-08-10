<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Member;
use App\Models\Attendance;
use App\Models\GeneralAttendance;
use App\Models\User;
use Carbon\Carbon;

class AttendanceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a system user for recording attendance
        $systemUser = User::firstOrCreate(
            ['email' => 'system@zoeflock.com'],
            [
                'name' => 'System User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Get some events and members for seeding
        $events = Event::where('status', 'published')
            ->where('start_date', '<=', now())
            ->take(5)
            ->get();

        $members = Member::where('is_active', true)->take(20)->get();

        if ($events->isEmpty() || $members->isEmpty()) {
            $this->command->info('No events or members found. Skipping attendance seeding.');
            return;
        }

        foreach ($events as $event) {
            $this->command->info("Seeding attendance for event: {$event->title}");

            // Create individual attendance records
            foreach ($members as $member) {
                // Check if member is eligible for this event
                if ($this->isMemberEligibleForEvent($member, $event)) {
                    $status = $this->faker->randomElement(['present', 'absent', 'first_timer']);
                    
                    $attendance = Attendance::create([
                        'event_id' => $event->id,
                        'member_id' => $member->id,
                        'status' => $status,
                        'check_in_time' => $status === 'present' ? $this->faker->dateTimeBetween('-2 hours', 'now') : null,
                        'check_out_time' => $status === 'present' ? $this->faker->optional(0.7)->dateTimeBetween('now', '+2 hours') : null,
                        'notes' => $this->faker->optional(0.3)->sentence(),
                        'recorded_by' => $systemUser->id,
                    ]);
                }
            }

            // Create general attendance record
            $presentCount = Attendance::where('event_id', $event->id)
                ->where('status', 'present')
                ->count();

            $firstTimersCount = Attendance::where('event_id', $event->id)
                ->where('status', 'first_timer')
                ->count();

            // Add some additional attendees that might not be in the system
            $additionalAttendees = $this->faker->numberBetween(0, 30);
            $totalAttendance = $presentCount + $firstTimersCount + $additionalAttendees;

            GeneralAttendance::create([
                'event_id' => $event->id,
                'total_attendance' => $totalAttendance,
                'first_timers_count' => $firstTimersCount,
                'notes' => $this->faker->optional(0.4)->sentence(),
                'recorded_by' => $systemUser->id,
            ]);

            $this->command->info("Created attendance records for event: {$event->title}");
        }

        $this->command->info('Attendance seeding completed successfully!');
    }

    /**
     * Check if a member is eligible for an event
     */
    private function isMemberEligibleForEvent($member, $event): bool
    {
        // For general events, all members are eligible
        if ($event->type === 'general') {
            return true;
        }

        // Check if member belongs to any associated groups
        if ($event->groups()->exists()) {
            $memberGroups = $member->groups()->pluck('group_id');
            if ($event->groups()->whereIn('group_id', $memberGroups)->exists()) {
                return true;
            }
        }

        // Check if member belongs to any associated families
        if ($event->families()->exists()) {
            $memberFamilies = $member->families()->pluck('family_id');
            if ($event->families()->whereIn('family_id', $memberFamilies)->exists()) {
                return true;
            }
        }

        return false;
    }
} 