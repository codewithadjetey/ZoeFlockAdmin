<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use App\Services\AttendanceService;
use Carbon\Carbon;

class CreateEventAttendance extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'attendance:create-event-records {--date= : Specific date to create records for (Y-m-d format)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create attendance records for events scheduled for a specific date';

    /**
     * Execute the console command.
     */
    public function handle(AttendanceService $attendanceService)
    {
        $date = $this->option('date') ? Carbon::parse($this->option('date')) : Carbon::today();
        
        $this->info("Creating attendance records for events on: " . $date->format('Y-m-d'));

        // Get events scheduled for the specified date
        $events = Event::whereDate('start_date', $date)
            ->where('status', 'published')
            ->where('deleted', false)
            ->get();

        if ($events->isEmpty()) {
            $this->info("No events found for " . $date->format('Y-m-d'));
            return 0;
        }

        $this->info("Found " . $events->count() . " events for " . $date->format('Y-m-d'));

        $totalCreated = 0;
        $errors = [];

        foreach ($events as $event) {
            $this->info("Processing event: {$event->title}");
            
            try {
                $result = $attendanceService->createEventAttendance($event);
                
                if ($result['success']) {
                    $this->info("✓ Created {$result['created_records']} attendance records for {$result['total_eligible_members']} eligible members");
                    $totalCreated += $result['created_records'];
                } else {
                    $this->error("✗ Failed to create attendance for {$event->title}: {$result['error']}");
                    $errors[] = "Event {$event->title}: {$result['error']}";
                }
            } catch (\Exception $e) {
                $this->error("✗ Exception occurred for {$event->title}: {$e->getMessage()}");
                $errors[] = "Event {$event->title}: {$e->getMessage()}";
            }
        }

        $this->newLine();
        $this->info("Summary:");
        $this->info("- Total events processed: " . $events->count());
        $this->info("- Total attendance records created: " . $totalCreated);
        
        if (!empty($errors)) {
            $this->error("- Errors encountered: " . count($errors));
            foreach ($errors as $error) {
                $this->error("  • {$error}");
            }
        }

        return 0;
    }
} 