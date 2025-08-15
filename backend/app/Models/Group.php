<?php
/**
 * @OA\Schema(
 *   schema="Group",
 *   type="object",
 *   title="Group",
 *   required={"name"},
 *   @OA\Property(property="id", type="integer", example=1),
 *   @OA\Property(property="name", type="string", example="Youth Group"),
 *   @OA\Property(property="description", type="string", example="A group for young people"),
 *   @OA\Property(property="max_members", type="integer", example=20),
 *   @OA\Property(property="meeting_day", type="string", example="Sunday"),
 *   @OA\Property(property="meeting_time", type="string", example="10:00 AM"),
 *   @OA\Property(property="location", type="string", example="Main Hall"),
 *   @OA\Property(property="img_path", type="string", example="/images/groups/youth.png"),
 *   @OA\Property(property="status", type="string", example="Active"),
 *   @OA\Property(property="deleted", type="boolean", example=false),
 *   @OA\Property(property="created_by", type="integer", example=1),
 *   @OA\Property(property="updated_by", type="integer", example=2),
 *   @OA\Property(property="created_at", type="string", format="date-time"),
 *   @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'max_members',
        'meeting_day',
        'meeting_time',
        'location',
        'img_path',
        'status',
        'deleted',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'max_members' => 'integer',
        'deleted' => 'boolean',
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
     * Get the events associated with this group
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_groups')
            ->using(EventGroup::class)
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
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


} 