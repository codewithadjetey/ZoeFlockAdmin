<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partnership extends Model
{
    protected $fillable = [
        'member_id',
        'category_id',
        'pledge_amount',
        'frequency',
        'start_date',
        'end_date',
        'notes',
    ];

    protected $casts = [
        'pledge_amount' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PartnershipCategory::class, 'category_id');
    }
}
