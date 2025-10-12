<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class EventInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'member_id',
        'unique_token',
        'expires_at',
        'is_active',
        'click_count',
        'response_count',
        'notes',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'click_count' => 'integer',
        'response_count' => 'integer',
    ];

    protected $appends = ['invitation_url'];

    /**
     * Boot method to auto-generate unique token
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invitation) {
            if (empty($invitation->unique_token)) {
                $invitation->unique_token = static::generateUniqueToken();
            }
        });
    }

    /**
     * Generate a unique token for the invitation
     */
    public static function generateUniqueToken(): string
    {
        do {
            $token = Str::random(32);
            $exists = static::where('unique_token', $token)->exists();
        } while ($exists);

        return $token;
    }

    /**
     * Get the event this invitation belongs to
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the member this invitation belongs to
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the responses to this invitation
     */
    public function responses(): HasMany
    {
        return $this->hasMany(InvitationResponse::class);
    }

    /**
     * Get confirmed responses
     */
    public function confirmedResponses(): HasMany
    {
        return $this->hasMany(InvitationResponse::class)->where('status', 'confirmed');
    }

    /**
     * Get declined responses
     */
    public function declinedResponses(): HasMany
    {
        return $this->hasMany(InvitationResponse::class)->where('status', 'declined');
    }

    /**
     * Get pending responses
     */
    public function pendingResponses(): HasMany
    {
        return $this->hasMany(InvitationResponse::class)->where('status', 'pending');
    }

    /**
     * Get attended responses
     */
    public function attendedResponses(): HasMany
    {
        return $this->hasMany(InvitationResponse::class)->where('status', 'attended');
    }

    /**
     * Get the full invitation URL
     */
    public function getInvitationUrlAttribute(): string
    {
        $frontendUrl = config('app.frontend_url', 'http://localhost:3000');
        return "{$frontendUrl}/invite/{$this->unique_token}";
    }

    /**
     * Check if the invitation is expired
     */
    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    /**
     * Check if the invitation is valid (active and not expired)
     */
    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }

    /**
     * Increment click count
     */
    public function incrementClickCount(): void
    {
        $this->increment('click_count');
    }

    /**
     * Increment response count
     */
    public function incrementResponseCount(): void
    {
        $this->increment('response_count');
    }

    /**
     * Get total number of guests (sum of number_of_guests in responses)
     */
    public function getTotalGuestsAttribute(): int
    {
        return $this->responses()->sum('number_of_guests');
    }

    /**
     * Get confirmed guests count
     */
    public function getConfirmedGuestsAttribute(): int
    {
        return $this->confirmedResponses()->sum('number_of_guests');
    }

    /**
     * Get declined guests count
     */
    public function getDeclinedGuestsAttribute(): int
    {
        return $this->declinedResponses()->sum('number_of_guests');
    }

    /**
     * Scope for active invitations
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for valid invitations (active and not expired)
     */
    public function scopeValid($query)
    {
        return $query->where('is_active', true)
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                          ->orWhere('expires_at', '>', now());
                    });
    }

    /**
     * Scope for expired invitations
     */
    public function scopeExpired($query)
    {
        return $query->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now());
    }

    /**
     * Scope for invitations by event
     */
    public function scopeByEvent($query, $eventId)
    {
        return $query->where('event_id', $eventId);
    }

    /**
     * Scope for invitations by member
     */
    public function scopeByMember($query, $memberId)
    {
        return $query->where('member_id', $memberId);
    }
}

