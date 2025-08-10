<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'date_of_birth',
        'gender',
        'marital_status',
        'occupation',
        'emergency_contact_name',
        'emergency_contact_phone',
        'baptism_date',
        'membership_date',
        'is_active',
        'notes',
        'profile_image_path',
        'user_id',
        'created_by',
        'updated_by',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'date_of_birth' => 'date',
        'baptism_date' => 'date',
        'membership_date' => 'date',
        'is_active' => 'boolean',
    ];

    /**
     * Get the member's full name
     */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    /**
     * Get the member's display name (first name + last initial)
     */
    public function getDisplayNameAttribute(): string
    {
        $lastInitial = $this->last_name ? substr($this->last_name, 0, 1) . '.' : '';
        return trim($this->first_name . ' ' . $lastInitial);
    }

    /**
     * Get the user who created this member
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this member
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the user account associated with this member
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Check if member has a user account
     */
    public function hasUserAccount(): bool
    {
        return !is_null($this->user_id);
    }

    /**
     * Get the groups this member belongs to
     */
    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'group_members')
            ->withPivot('joined_at', 'role', 'is_active', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the file uploads associated with this member
     */
    public function files(): HasMany
    {
        return $this->morphMany(FileUpload::class, 'model');
    }

    /**
     * Get the member's profile image URL
     */
    public function getProfileImageUrlAttribute(): ?string
    {
        if (!$this->profile_image_path) {
            return null;
        }
        
        // Check if it's already a full URL
        if (filter_var($this->profile_image_path, FILTER_VALIDATE_URL)) {
            return $this->profile_image_path;
        }
        
        // Return relative path for frontend to handle
        return $this->profile_image_path;
    }

    /**
     * Scope to get only active members
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get only inactive members
     */
    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    /**
     * Scope to search members by name or email
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('first_name', 'like', "%{$search}%")
              ->orWhere('last_name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%")
              ->orWhere('phone', 'like', "%{$search}%");
        });
    }

    /**
     * Scope to get members by group
     */
    public function scopeByGroup($query, $groupId, $includeInactive = false)
    {
        return $query->whereHas('groups', function ($q) use ($groupId, $includeInactive) {
            $q->where('group_id', $groupId);
            if (!$includeInactive) {
                $q->where('is_active', true);
            }
        });
    }

    /**
     * Scope to get members by group category
     */
    public function scopeByGroupCategory($query, $category)
    {
        return $query->whereHas('groups', function ($q) use ($category) {
            $q->whereHas('group', function ($groupQuery) use ($category) {
                $groupQuery->where('category', $category);
            })->where('is_active', true);
        });
    }

    /**
     * Scope to get members with specific group role
     */
    public function scopeByGroupRole($query, $role)
    {
        return $query->whereHas('groups', function ($q) use ($role) {
            $q->where('role', $role)->where('is_active', true);
        });
    }

    /**
     * Check if member is in a specific group
     */
    public function isInGroup($groupId): bool
    {
        return $this->groups()->where('group_id', $groupId)->where('is_active', true)->exists();
    }

    /**
     * Get member's role in a specific group
     */
    public function getRoleInGroup($groupId): ?string
    {
        $groupMembership = $this->groups()->where('group_id', $groupId)->first();
        return $groupMembership ? $groupMembership->pivot->role : null;
    }

    /**
     * Get member's active groups count
     */
    public function getActiveGroupsCountAttribute(): int
    {
        return $this->groups()->where('is_active', true)->count();
    }

    /**
     * Get member's total groups count (including inactive)
     */
    public function getGroupsCountAttribute(): int
    {
        return $this->groups()->count();
    }

    /**
     * Get member's primary group (first active group)
     */
    public function getPrimaryGroupAttribute()
    {
        return $this->groups()->where('is_active', true)->first();
    }
} 