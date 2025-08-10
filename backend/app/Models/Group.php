<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'category',
        'max_members',
        'meeting_day',
        'meeting_time',
        'location',
        'img_path',
        'status',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'max_members' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the user who created the group
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the group
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the members of this group
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'group_members')
            ->withPivot('role', 'joined_at', 'is_active', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the active members of this group
     */
    public function activeMembers(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'group_members')
            ->withPivot('role', 'joined_at', 'is_active', 'notes')
            ->wherePivot('is_active', true)
            ->withTimestamps();
    }

    /**
     * Get the member count for this group
     */
    public function getMemberCountAttribute(): int
    {
        return $this->activeMembers()->count();
    }

    /**
     * Check if the group is full
     */
    public function getIsFullAttribute(): bool
    {
        return $this->member_count >= $this->max_members;
    }

    /**
     * Scope for active groups
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'Active');
    }

    /**
     * Scope for inactive groups
     */
    public function scopeInactive($query)
    {
        return $query->where('status', 'Inactive');
    }

    /**
     * Scope for full groups
     */
    public function scopeFull($query)
    {
        return $query->where('status', 'Full');
    }

    /**
     * Scope by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    public function image(): HasOne
    {
        return $this->hasOne(FileUpload::class, 'model_id', 'id')
            ->where('model_type', Group::class)
            ->orderBy('id', 'desc');
    }

    /**
     * Scope to get groups by member
     */
    public function scopeByMember($query, $memberId)
    {
        return $query->whereHas('members', function ($q) use ($memberId) {
            $q->where('member_id', $memberId)->where('is_active', true);
        });
    }

    /**
     * Scope to get groups with available spots
     */
    public function scopeWithAvailableSpots($query)
    {
        return $query->whereRaw('(SELECT COUNT(*) FROM group_members WHERE group_members.group_id = groups.id AND group_members.is_active = 1) < max_members');
    }

    /**
     * Get available spots count
     */
    public function getAvailableSpotsAttribute(): int
    {
        return max(0, $this->max_members - $this->member_count);
    }

    /**
     * Check if a specific member can join this group
     */
    public function canMemberJoin($memberId): bool
    {
        // Check if member is already in the group
        if ($this->members()->where('member_id', $memberId)->exists()) {
            return false;
        }

        // Check if group is full
        return !$this->is_full;
    }

    /**
     * Get members by role
     */
    public function getMembersByRole($role)
    {
        return $this->members()->wherePivot('role', $role)->wherePivot('is_active', true)->get();
    }

    /**
     * Get group leaders
     */
    public function getLeadersAttribute()
    {
        return $this->getMembersByRole('leader');
    }

    /**
     * Get group coordinators
     */
    public function getCoordinatorsAttribute()
    {
        return $this->getMembersByRole('coordinator');
    }

    /**
     * Get group mentors
     */
    public function getMentorsAttribute()
    {
        return $this->getMembersByRole('mentor');
    }
} 