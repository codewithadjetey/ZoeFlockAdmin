<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class EventGroup extends Pivot
{
    protected $table = 'event_groups';

    protected $fillable = [
        'event_id',
        'group_id',
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
     * Get the group
     */
    public function group()
    {
        return $this->belongsTo(Group::class);
    }
} 