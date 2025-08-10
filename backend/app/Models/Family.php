<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Family extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slogan',
        'img_url',
        'description',
        'active',
        'deleted',
        'family_head_id',
    ];

    protected $casts = [
        'active' => 'boolean',
        'deleted' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the family head (member)
     */
    public function familyHead(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'family_head_id');
    }

    /**
     * Get the members of this family
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'family_members')
            ->withPivot('role', 'joined_at', 'is_active', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the active members of this family
     */
    public function activeMembers(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'family_members')
            ->withPivot('role', 'joined_at', 'is_active', 'notes')
            ->wherePivot('is_active', true)
            ->withTimestamps();
    }

    /**
     * Get the member count for this family
     */
    public function getMemberCountAttribute(): int
    {
        return $this->activeMembers()->count();
    }

    /**
     * Scope for active families
     */
    public function scopeActive($query)
    {
        return $query->where('active', true)->where('deleted', false);
    }

    /**
     * Scope for inactive families
     */
    public function scopeInactive($query)
    {
        return $query->where('active', false)->where('deleted', false);
    }

    /**
     * Scope for deleted families
     */
    public function scopeDeleted($query)
    {
        return $query->where('deleted', true);
    }

    /**
     * Scope to get families by family head
     */
    public function scopeByFamilyHead($query, $memberId)
    {
        return $query->where('family_head_id', $memberId);
    }

    /**
     * Scope to get families by member
     */
    public function scopeByMember($query, $memberId)
    {
        return $query->whereHas('members', function ($q) use ($memberId) {
            $q->where('member_id', $memberId)->where('is_active', true);
        });
    }

    /**
     * Check if a specific member can join this family
     */
    public function canMemberJoin($memberId): bool
    {
        // Check if member is already in any family
        if (Member::where('id', $memberId)->whereHas('families', function ($q) {
            $q->where('is_active', true);
        })->exists()) {
            return false;
        }

        // Check if family is active and not deleted
        return $this->active && !$this->deleted;
    }

    /**
     * Get members by role
     */
    public function getMembersByRole($role)
    {
        return $this->members()->wherePivot('role', $role)->wherePivot('is_active', true)->get();
    }

    /**
     * Get family deputies
     */
    public function getDeputiesAttribute()
    {
        return $this->getMembersByRole('deputy');
    }

    /**
     * Get family regular members
     */
    public function getRegularMembersAttribute()
    {
        return $this->getMembersByRole('member');
    }

    /**
     * Check if a member is the family head
     */
    public function isFamilyHead($memberId): bool
    {
        return $this->family_head_id === $memberId;
    }

    /**
     * Check if a member is a deputy
     */
    public function isDeputy($memberId): bool
    {
        return $this->members()->where('member_id', $memberId)
            ->where('role', 'deputy')
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Check if a member can manage this family
     */
    public function canMemberManage($memberId): bool
    {
        return $this->isFamilyHead($memberId) || $this->isDeputy($memberId);
    }

    /**
     * Get the family's image
     */
    public function image(): HasOne
    {
        return $this->hasOne(FileUpload::class, 'model_id', 'id')
            ->where('model_type', Family::class)
            ->orderBy('id', 'desc');
    }

    /**
     * Get the family members pivot table data
     */
    public function familyMembers()
    {
        return $this->hasMany(\App\Models\FamilyMember::class);
    }

    /**
     * Get the events associated with this family
     */
    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_families')
            ->using(EventFamily::class)
            ->withPivot('is_required', 'notes')
            ->withTimestamps();
    }

    /**
     * Get the upcoming events for this family
     */
    public function upcomingEvents()
    {
        return $this->events()->upcoming();
    }

    /**
     * Get the past events for this family
     */
    public function pastEvents()
    {
        return $this->events()->past();
    }
} 