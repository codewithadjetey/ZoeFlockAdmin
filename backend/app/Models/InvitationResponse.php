<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvitationResponse extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_invitation_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'status',
        'number_of_guests',
        'notes',
        'special_requirements',
        'responded_at',
    ];

    protected $casts = [
        'responded_at' => 'datetime',
        'number_of_guests' => 'integer',
    ];

    /**
     * Get the invitation this response belongs to
     */
    public function invitation(): BelongsTo
    {
        return $this->belongsTo(EventInvitation::class, 'event_invitation_id');
    }

    /**
     * Get the event through the invitation
     */
    public function event()
    {
        return $this->hasOneThrough(
            Event::class,
            EventInvitation::class,
            'id',
            'id',
            'event_invitation_id',
            'event_id'
        );
    }

    /**
     * Get the member who sent the invitation
     */
    public function member()
    {
        return $this->hasOneThrough(
            Member::class,
            EventInvitation::class,
            'id',
            'id',
            'event_invitation_id',
            'member_id'
        );
    }

    /**
     * Scope for confirmed responses
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for declined responses
     */
    public function scopeDeclined($query)
    {
        return $query->where('status', 'declined');
    }

    /**
     * Scope for pending responses
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for attended responses
     */
    public function scopeAttended($query)
    {
        return $query->where('status', 'attended');
    }

    /**
     * Scope for responses by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Mark response as confirmed
     */
    public function markAsConfirmed(): bool
    {
        $this->status = 'confirmed';
        return $this->save();
    }

    /**
     * Mark response as declined
     */
    public function markAsDeclined(): bool
    {
        $this->status = 'declined';
        return $this->save();
    }

    /**
     * Mark response as attended
     */
    public function markAsAttended(): bool
    {
        $this->status = 'attended';
        return $this->save();
    }
}

