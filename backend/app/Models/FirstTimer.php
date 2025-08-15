<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FirstTimer extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'primary_mobile_number',
        'secondary_mobile_number',
        'how_was_service',
        'is_first_time',
        'has_permanent_place_of_worship',
        'invited_by',
        'invited_by_member_id',
        'would_like_to_stay',
        'visit_count',
        'status',
        'self_registered',
        'assigned_member_id',
        'device_fingerprint',
        'last_submission_date',
    ];

    /**
     * Get the assigned member (if any)
     */
    public function assignedMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'assigned_member_id');
    }

    /**
     * Get the member who invited (if assigned by admin/family head)
     */
    public function invitedByMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'invited_by_member_id');
    }
}