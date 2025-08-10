<?php

namespace App\Services;

use App\Models\Event;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class RecurringEventService
{
    /**
     * Create recurring event instances based on the parent event
     */
    public function createRecurringInstances(Event $parentEvent): Collection
    {
        if (!$parentEvent->is_recurring || !$parentEvent->recurrence_pattern) {
            return collect();
        }

        // For recurring events without a start_date, we need to calculate based on recurrence settings
        if (!$parentEvent->start_date) {
            return $this->createRecurringInstancesWithoutStartDate($parentEvent);
        }

        $instances = collect();
        $currentDate = Carbon::parse($parentEvent->start_date);
        $endDate = $parentEvent->recurrence_end_date ? Carbon::parse($parentEvent->recurrence_end_date) : null;
        $maxInstances = 100; // Prevent infinite loops
        $instanceCount = 0;

        while ($instanceCount < $maxInstances) {
            if ($endDate && $currentDate->gt($endDate)) {
                break;
            }

            // Create the recurring instance
            $instance = $this->createEventInstance($parentEvent, $currentDate);
            $instances->push($instance);

            // Calculate next occurrence
            $currentDate = $this->getNextOccurrence($currentDate, $parentEvent->recurrence_pattern, $parentEvent->recurrence_settings);
            
            if (!$currentDate) {
                break;
            }

            $instanceCount++;
        }

        return $instances;
    }

    /**
     * Create recurring event instances when parent event has no start_date
     */
    protected function createRecurringInstancesWithoutStartDate(Event $parentEvent): Collection
    {
        $instances = collect();
        $maxInstances = 100; // Prevent infinite loops
        $instanceCount = 0;

        // Start from today or a default date
        $currentDate = now();
        $endDate = $parentEvent->recurrence_end_date ? Carbon::parse($parentEvent->recurrence_end_date) : null;

        while ($instanceCount < $maxInstances) {
            if ($endDate && $currentDate->gt($endDate)) {
                break;
            }

            // Create the recurring instance
            $instance = $this->createEventInstance($parentEvent, $currentDate);
            $instances->push($instance);

            // Calculate next occurrence
            $currentDate = $this->getNextOccurrence($currentDate, $parentEvent->recurrence_pattern, $parentEvent->recurrence_settings);
            
            if (!$currentDate) {
                break;
            }

            $instanceCount++;
        }

        return $instances;
    }

    /**
     * Create a single event instance
     */
    protected function createEventInstance(Event $parentEvent, Carbon $startDate): Event
    {
        $duration = $parentEvent->end_date ? $parentEvent->start_date->diffInMinutes($parentEvent->end_date) : 0;
        $endDate = $duration > 0 ? $startDate->copy()->addMinutes($duration) : null;

        return Event::create([
            'title' => $parentEvent->title,
            'description' => $parentEvent->description,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'location' => $parentEvent->location,
            'type' => $parentEvent->type,
            'status' => 'published',
            'is_recurring' => false, // This is an instance, not the parent
            'parent_event_id' => $parentEvent->id,
            'img_path' => $parentEvent->img_path,
            'created_by' => $parentEvent->created_by,
        ]);
    }

    /**
     * Calculate the next occurrence date based on recurrence pattern
     */
    protected function getNextOccurrence(Carbon $currentDate, string $pattern, ?array $settings): ?Carbon
    {
        $nextDate = $currentDate->copy();

        switch ($pattern) {
            case 'daily':
                $interval = $settings['interval'] ?? 1;
                $nextDate->addDays($interval);
                break;

            case 'weekly':
                $interval = $settings['interval'] ?? 1;
                $weekdays = $settings['weekdays'] ?? [$currentDate->dayOfWeek];
                
                // Find next weekday in the list
                $nextWeekday = $this->findNextWeekday($currentDate, $weekdays);
                if ($nextWeekday) {
                    $nextDate = $nextWeekday;
                } else {
                    $nextDate->addWeeks($interval);
                    $nextDate = $this->findNextWeekday($nextDate, $weekdays);
                }
                break;

            case 'monthly':
                $interval = $settings['interval'] ?? 1;
                $dayOfMonth = $settings['day_of_month'] ?? $currentDate->day;
                $nextDate->addMonths($interval);
                
                // Adjust day if it exceeds month length
                $daysInMonth = $nextDate->daysInMonth;
                $nextDate->day = min($dayOfMonth, $daysInMonth);
                break;

            case 'yearly':
                $interval = $settings['interval'] ?? 1;
                $nextDate->addYears($interval);
                break;

            default:
                return null;
        }

        return $nextDate;
    }

    /**
     * Find the next weekday from a list of weekdays
     */
    protected function findNextWeekday(Carbon $date, array $weekdays): ?Carbon
    {
        $currentDayOfWeek = $date->dayOfWeek;
        $sortedWeekdays = collect($weekdays)->sort()->values();
        
        // Find next weekday in current week
        foreach ($sortedWeekdays as $weekday) {
            if ($weekday > $currentDayOfWeek) {
                $nextDate = $date->copy();
                $nextDate->addDays($weekday - $currentDayOfWeek);
                return $nextDate;
            }
        }
        
        // If no weekday found in current week, go to first weekday of next week
        $nextDate = $date->copy()->addWeek();
        $nextDate->startOfWeek();
        $nextDate->addDays($sortedWeekdays->first());
        
        return $nextDate;
    }

    /**
     * Cancel all future instances of a recurring event
     */
    public function cancelFutureInstances(Event $parentEvent, ?string $reason = null): int
    {
        $futureInstances = $parentEvent->recurringInstances()
            ->where('start_date', '>', now())
            ->where('status', '!=', 'cancelled')
            ->get();

        $cancelledCount = 0;
        foreach ($futureInstances as $instance) {
            if ($instance->cancel($reason)) {
                $cancelledCount++;
            }
        }

        return $cancelledCount;
    }

    /**
     * Update all future instances of a recurring event
     */
    public function updateFutureInstances(Event $parentEvent, array $data): int
    {
        $futureInstances = $parentEvent->recurringInstances()
            ->where('start_date', '>', now())
            ->where('status', '!=', 'cancelled')
            ->get();

        $updatedCount = 0;
        foreach ($futureInstances as $instance) {
            if ($instance->update($data)) {
                $updatedCount++;
            }
        }

        return $updatedCount;
    }

    /**
     * Regenerate recurring instances from a specific date
     */
    public function regenerateInstancesFromDate(Event $parentEvent, Carbon $fromDate): Collection
    {
        // Cancel existing instances from the specified date
        $this->cancelFutureInstances($parentEvent, 'Regenerated from ' . $fromDate->format('Y-m-d'));
        
        // Update the parent event's recurrence end date if needed
        if ($parentEvent->recurrence_end_date && $parentEvent->recurrence_end_date->lt($fromDate)) {
            $parentEvent->update(['recurrence_end_date' => $fromDate]);
        }
        
        // Create new instances from the specified date
        return $this->createRecurringInstances($parentEvent);
    }
} 