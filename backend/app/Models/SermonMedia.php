<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SermonMedia extends Model
{
    use HasFactory;

    protected $fillable = [
        'sermon_id',
        'media_type',
        'file_path',
        'youtube_url',
        'external_url',
        'duration',
        'file_size',
        'order',
    ];

    protected $casts = [
        'duration' => 'integer',
        'file_size' => 'integer',
        'order' => 'integer',
    ];

    /**
     * Get the sermon this media belongs to
     */
    public function sermon(): BelongsTo
    {
        return $this->belongsTo(Sermon::class, 'sermon_id');
    }

    /**
     * Get the media URL
     */
    public function getUrlAttribute(): ?string
    {
        if ($this->media_type === 'youtube' && $this->youtube_url) {
            return $this->youtube_url;
        }
        
        if ($this->media_type === 'document' && $this->external_url) {
            return $this->external_url;
        }
        
        if ($this->file_path) {
            return asset('storage/' . $this->file_path);
        }
        
        return null;
    }
}
