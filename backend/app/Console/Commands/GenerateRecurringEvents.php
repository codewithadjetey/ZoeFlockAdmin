<?php

namespace App\Console\Commands;

use App\Models\EventCategory;
use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GenerateRecurringEvents extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'events:generate-recurring 
                            {--category= : Generate events for specific category ID}
                            {--count=10 : Number of events to generate}
                            {--from-date= : Start date for generation (Y-m-d format)}
                            {--auto-publish : Automatically publish generated events}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate recurring events from event categories based on their recurrence settings';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting recurring event generation...');

        try {
            $categoryId = $this->option('category');
            $count = (int) $this->option('count');
            $fromDate = $this->option('from-date') ? Carbon::parse($this->option('from-date')) : now();
            $autoPublish = $this->option('auto-publish');

            // Get categories to process
            if ($categoryId) {
                $categories = EventCategory::where('id', $categoryId)
                    ->where('is_recurring', true)
                    ->where('is_active', true)
                    ->get();
            } else {
                $categories = EventCategory::where('is_recurring', true)
                    ->where('is_active', true)
                    ->get();
            }

            if ($categories->isEmpty()) {
                $this->warn('No active recurring categories found.');
                return 0;
            }

            $this->info("Found {$categories->count()} recurring categories to process.");

            $totalGenerated = 0;
            $totalErrors = 0;

            foreach ($categories as $category) {
                $this->info("Processing category: {$category->name}");

                try {
                    DB::beginTransaction();

                    // Check if we need to generate events
                    $lastEvent = $category->events()
                        ->whereNotNull('start_date')
                        ->orderBy('start_date', 'desc')
                        ->first();

                    $startDate = $fromDate;
                    if ($lastEvent && $lastEvent->start_date > $fromDate) {
                        $startDate = $lastEvent->start_date;
                    }

                    // Generate events
                    $eventsData = $category->generateEvents($startDate, $count);

                    if (empty($eventsData)) {
                        $this->warn("  No events could be generated for category: {$category->name}");
                        continue;
                    }

                    $generatedCount = 0;
                    foreach ($eventsData as $eventData) {
                        // Check if event already exists
                        $existingEvent = Event::where('category_id', $category->id)
                            ->where('title', $eventData['title'])
                            ->where('start_date', $eventData['start_date'])
                            ->first();

                        if ($existingEvent) {
                            $this->line("  Event already exists: {$eventData['title']} on {$eventData['start_date']}");
                            continue;
                        }

                        // Set status based on auto-publish option
                        if ($autoPublish) {
                            $eventData['status'] = 'published';
                        }

                        $event = Event::create($eventData);
                        $generatedCount++;

                        $this->line("  Generated: {$event->title} on {$event->start_date}");
                    }

                    DB::commit();

                    $totalGenerated += $generatedCount;
                    $this->info("  Successfully generated {$generatedCount} events for category: {$category->name}");

                } catch (\Exception $e) {
                    DB::rollBack();
                    $totalErrors++;
                    $this->error("  Error processing category {$category->name}: {$e->getMessage()}");
                    Log::error("Failed to generate events for category {$category->id}: " . $e->getMessage());
                }
            }

            $this->info("Event generation completed!");
            $this->info("Total events generated: {$totalGenerated}");
            $this->info("Total errors: {$totalErrors}");

            return 0;

        } catch (\Exception $e) {
            $this->error("Fatal error: {$e->getMessage()}");
            Log::error("Fatal error in GenerateRecurringEvents command: " . $e->getMessage());
            return 1;
        }
    }
}
