<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Carbon\Carbon;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'location',
        'type',
        'category_id',
        'status',
        'is_recurring',
        'recurrence_pattern',
        'recurrence_settings',
        'recurrence_end_date',
        'cancelled_at',
        'cancellation_reason',
        'img_path',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'recurrence_end_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'is_recurring' => 'boolean',
        'recurrence_settings' => 'array',
        'deleted' => 'boolean',
    ];

    /**
     * Get the user who created the event
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the event
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the event category
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    /**
     * Get the groups associated with this event
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'event_groups')
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the families associated with this event
     */
    public function families(): BelongsToMany
    {
        return $this->belongsToMany(Family::class, 'event_families')
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the event's image
     */
    public function image(): HasOne
    {
        return $this->hasOne(FileUpload::class, 'model_id', 'id')
            ->where('model_type', Event::class)
            ->orderBy('id', 'desc');
    }

    /**
     * Get the individual attendance records for this event
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the general attendance record for this event
     */
    public function generalAttendance(): HasOne
    {
        return $this->hasOne(GeneralAttendance::class);
    }

    /**
     * Scope for active events (not cancelled or deleted)
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'cancelled')
                    ->where('deleted', false);
    }

    /**
     * Scope for published events
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    /**
     * Scope for upcoming events
     */
    public function scopeUpcoming($query)
    {
        return $query->whereNotNull('start_date')
                    ->where('start_date', '>', now())
                    ->where('status', '!=', 'cancelled')
                    ->where('deleted', false);
    }

    /**
     * Scope for past events
     */
    public function scopePast($query)
    {
        return $query->whereNotNull('start_date')
                    ->where('start_date', '<', now())
                    ->where('deleted', false);
    }

    /**
     * Scope for recurring events
     */
    public function scopeRecurring($query)
    {
        return $query->where('is_recurring', true);
    }

    /**
     * Scope for non-recurring events
     */
    public function scopeNonRecurring($query)
    {
        return $query->where('is_recurring', false);
    }

    /**
     * Scope for events by type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for events by group
     */
    public function scopeByGroup($query, $groupId)
    {
        return $query->whereHas('groups', function ($q) use ($groupId) {
            $q->where('group_id', $groupId);
        });
    }

    /**
     * Scope for events by family
     */
    public function scopeByFamily($query, $familyId)
    {
        return $query->whereHas('families', function ($q) use ($familyId) {
            $q->where('family_id', $familyId);
        });
    }

    /**
     * Scope for events created by a specific user
     */
    public function scopeByCreator($query, $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Check if the event is cancelled
     */
    public function getIsCancelledAttribute(): bool
    {
        return $this->status === 'cancelled' || $this->cancelled_at !== null;
    }

    /**
     * Check if the event is recurring
     */
    public function getIsRecurringAttribute(): bool
    {
        return $this->attributes['is_recurring'] ?? false;
    }

    /**
     * Check if the event is upcoming
     */
    public function getIsUpcomingAttribute(): bool
    {
        return $this->start_date && $this->start_date > now() && !$this->is_cancelled;
    }

    /**
     * Check if the event is ongoing
     */
    public function getIsOngoingAttribute(): bool
    {
        if (!$this->start_date) {
            return false;
        }
        
        $now = now();
        return $this->start_date <= $now && 
               ($this->end_date === null || $this->end_date >= $now) && 
               !$this->is_cancelled;
    }

    /**
     * Check if the event is past
     */
    public function getIsPastAttribute(): bool
    {
        if (!$this->start_date) {
            return false;
        }
        
        return $this->end_date !== null && $this->end_date < now();
    }

    /**
     * Get the duration of the event in minutes
     */
    public function getDurationAttribute(): int
    {
        if ($this->start_date === null || $this->end_date === null) {
            return 0;
        }
        return $this->start_date->diffInMinutes($this->end_date);
    }

    /**
     * Cancel the event
     */
    public function cancel($reason = null): bool
    {
        $this->status = 'cancelled';
        $this->cancelled_at = now();
        $this->cancellation_reason = $reason;
        
        return $this->save();
    }

    /**
     * Uncancel the event
     */
    public function uncancel(): bool
    {
        $this->status = 'published';
        $this->cancelled_at = null;
        $this->cancellation_reason = null;
        
        return $this->save();
    }

    /**
     * Check if a member can attend this event
     */
    public function canMemberAttend($memberId): bool
    {
        // Check if event is active and not cancelled
        if ($this->is_cancelled || $this->deleted) {
            return false;
        }

        // Check if member belongs to any associated groups
        if ($this->groups()->exists()) {
            $memberGroups = Group::whereHas('members', function ($q) use ($memberId) {
                $q->where('member_id', $memberId)->where('is_active', true);
            })->pluck('id');
            
            if ($this->groups()->whereIn('group_id', $memberGroups)->exists()) {
                return true;
            }
        }

        // Check if member belongs to any associated families
        if ($this->families()->exists()) {
            $memberFamilies = Family::whereHas('members', function ($q) use ($memberId) {
                $q->where('member_id', $memberId)->where('is_active', true);
            })->pluck('id');
            
            if ($this->families()->whereIn('family_id', $memberFamilies)->exists()) {
                return true;
            }
        }

        // If no specific groups or families, it's a general event
        return $this->type === 'general';
    }

    /**
     * Get all members who can attend this event
     */
    public function getEligibleMembers()
    {
        $memberIds = collect();

        // Get members from associated groups
        if ($this->groups()->exists()) {
            $groupMemberIds = Member::whereHas('groups', function ($q) {
                $q->whereIn('group_id', $this->groups()->pluck('group_id'))
                  ->where('is_active', true);
            })->pluck('id');
            
            $memberIds = $memberIds->merge($groupMemberIds);
        }

        // Get members from associated families
        if ($this->families()->exists()) {
            $familyMemberIds = Family::whereHas('members', function ($q) {
                $q->whereIn('family_id', $this->families()->pluck('family_id'))
                  ->where('is_active', true);
            })->pluck('id');
            
            $memberIds = $memberIds->merge($familyMemberIds);
        }

        // Remove duplicates and return unique members
        return Member::whereIn('id', $memberIds->unique())->get();
    }
} 