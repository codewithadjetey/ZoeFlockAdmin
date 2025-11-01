<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Sermon extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'title',
        'slug',
        'speaker',
        'sermon_date',
        'series_id',
        'scripture_reference',
        'description',
        'thumbnail',
        'status',
        'published_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'sermon_date' => 'date',
        'published_at' => 'datetime',
    ];

    /**
     * Get the user who created the sermon
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the sermon
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the sermon series
     */
    public function series(): BelongsTo
    {
        return $this->belongsTo(SermonSeries::class, 'series_id');
    }

    /**
     * Get the sermon media
     */
    public function media(): HasMany
    {
        return $this->hasMany(SermonMedia::class, 'sermon_id')->orderBy('order');
    }

    /**
     * Scope for published sermons
     */
    public function scopePublished($query)
    {
        return $query->where('status', 'published')
                    ->where('published_at', '<=', now());
    }

    /**
     * Scope for draft sermons
     */
    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    /**
     * Check if the sermon is published
     */
    public function getIsPublishedAttribute(): bool
    {
        return $this->status === 'published' && 
               ($this->published_at === null || $this->published_at <= now());
    }
}
