<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GeneralAttendance extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id',
        'family_id',
        'total_attendance',
        'first_timers_count',
        'notes',
        'recorded_by',
    ];

    /**
     * Get the event that this general attendance belongs to.
     */
    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the family that this general attendance belongs to.
     */
    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    /**
     * Get the user who recorded this general attendance.
     */
    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
} 