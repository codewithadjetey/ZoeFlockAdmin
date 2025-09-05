<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class EventCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'icon',
        'attendance_type',
        'type',
        'is_active',
        'is_recurring',
        'recurrence_pattern',
        'recurrence_settings',
        'default_start_time',
        'start_date_time',
        'end_date_time',
        'recurrence_start_date',
        'recurrence_end_date',
        'default_duration',
        'default_location',
        'default_description',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_recurring' => 'boolean',
        'recurrence_settings' => 'array',
        'default_start_time' => 'datetime',
        'start_date_time' => 'datetime',
        'end_date_time' => 'datetime',
        'recurrence_start_date' => 'date',
        'recurrence_end_date' => 'date',
        'default_duration' => 'integer',
        'deleted' => 'boolean'
    ];

    /**
     * Get the user who created the category
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the category
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all events in this category
     */
    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id');
    }

    /**
     * Get the groups associated with this event category
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'event_category_groups')
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the families associated with this event category
     */
    public function families(): BelongsToMany
    {
        return $this->belongsToMany(Family::class, 'event_category_families')
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
    }

    /**
     * Get active events in this category
     */
    public function activeEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id')
                    ->where('status', '!=', 'cancelled')
                    ->where('deleted', false);
    }

    /**
     * Get upcoming events in this category
     */
    public function upcomingEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id')
                    ->where('status', '!=', 'cancelled')
                    ->where('deleted', false)
                    ->whereNotNull('start_date')
                    ->where('start_date', '>', now());
    }

    /**
     * Get past events in this category
     */
    public function pastEvents(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id')
                    ->where('status', '!=', 'cancelled')
                    ->where('deleted', false)
                    ->whereNotNull('start_date')
                    ->where('start_date', '<', now());
    }

    /**
     * Scope for active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('deleted', false);
    }

    /**
     * Scope for recurring categories
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope for categories by attendance type
     */
    public function scopeByAttendanceType($query, $type)
    {
        return $query->where('attendance_type', $type);
    }

    /**
     * Check if the category supports individual attendance
     */
    public function supportsIndividualAttendance(): bool
    {
        return $this->attendance_type === 'individual';
    }

    /**
     * Check if the category supports general attendance
     */
    public function supportsGeneralAttendance(): bool
    {
        return $this->attendance_type === 'general';
    }

    /**
     * Check if the category supports any attendance
     */
    public function supportsAttendance(): bool
    {
        return $this->attendance_type !== 'none';
    }

    /**
     * Get the next occurrence date based on recurrence settings
     */
    public function getNextOccurrenceDate(Carbon $fromDate = null): ?Carbon
    {
        if (!$this->is_recurring || !$this->recurrence_pattern) {
            return null;
        }

        $currentDate = $fromDate ?? now();
        $nextDate = $currentDate->copy();

        switch ($this->recurrence_pattern) {
            case 'daily':
                $interval = $this->recurrence_settings['interval'] ?? 1;
                $nextDate->addDays($interval);
                break;

            case 'weekly':
                $interval = $this->recurrence_settings['interval'] ?? 1;
                $weekdays = $this->recurrence_settings['weekdays'] ?? [$currentDate->dayOfWeek];
                
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
                $interval = $this->recurrence_settings['interval'] ?? 1;
                $dayOfMonth = $this->recurrence_settings['day_of_month'] ?? $currentDate->day;
                $nextDate->addMonths($interval);
                
                // Adjust day if it exceeds month length
                $daysInMonth = $nextDate->daysInMonth;
                $nextDate->day = min($dayOfMonth, $daysInMonth);
                break;

            case 'yearly':
                $interval = $this->recurrence_settings['interval'] ?? 1;
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
     * Generate events for this category based on recurrence settings
     */
    public function generateEvents(Carbon $fromDate = null, int $count = 10): array
    {
        if (!$this->is_recurring || !$this->recurrence_settings) {
            return [];
        }

        // Use the RecurringEventService for proper date calculations
        $recurringService = app(\App\Services\RecurringEventService::class);
        $events = $recurringService->generateEventsFromCategory($this, $count);
        
        return $events->toArray();
    }

    /**
     * Generate a single one-time event for this category
     */
    public function generateOneTimeEvent(): array
    {
        // Check if this is a one-time category
        if ($this->is_recurring) {
            return [];
        }

        // Check if an event already exists for this one-time category
        if ($this->events()->exists()) {
            return [];
        }

        // Check if start_date_time and end_date_time are set
        if (!$this->start_date_time || !$this->end_date_time) {
            return [];
        }

        $startDateTime = Carbon::parse($this->start_date_time);
        $endDateTime = Carbon::parse($this->end_date_time);
        
        $eventData = [
            'title' => $this->name,
            'description' => $this->default_description,
            'start_date' => $startDateTime,
            'end_date' => $endDateTime,
            'location' => $this->default_location,
            'type' => $this->type ?? 'general',
            'category_id' => $this->id,
            'status' => 'draft',
            'is_recurring' => false,
            'created_by' => $this->created_by,
        ];

        // Add group_ids and family_ids based on type
        if ($this->type === 'group' && $this->groups()->exists()) {
            $eventData['group_ids'] = $this->groups()->pluck('groups.id')->toArray();
        }

        if ($this->type === 'family' && $this->families()->exists()) {
            $eventData['family_ids'] = $this->families()->pluck('families.id')->toArray();
        }

        return $eventData;
    }

    /**
     * Soft delete the category
     */
    public function softDelete(): bool
    {
        $this->deleted = true;
        return $this->save();
    }

    /**
     * Restore the category
     */
    public function restore(): bool
    {
        $this->deleted = false;
        return $this->save();
    }
}
