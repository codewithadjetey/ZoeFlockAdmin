<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventFamily extends Pivot
{
    protected $table = 'event_families';

    protected $fillable = [
        'event_id',
        'family_id',
        'is_required',
        'notes',
    ];

    protected $casts = [
        'is_required' => 'boolean',
    ];

    /**
     * Get the event
     */
    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    /**
     * Get the family
     */
    public function family()
    {
        return $this->belongsTo(Family::class);
    }
} 