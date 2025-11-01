<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SermonSeries extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'image',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Get the sermons in this series
     */
    public function sermons(): HasMany
    {
        return $this->hasMany(Sermon::class, 'series_id')->orderBy('sermon_date');
    }

    /**
     * Scope for active series
     */
    public function scopeActive($query)
    {
        return $query->where(function($q) {
            $q->whereNull('end_date')
              ->orWhere('end_date', '>=', now());
        })->where(function($q) {
            $q->whereNull('start_date')
              ->orWhere('start_date', '<=', now());
        });
    }
}
