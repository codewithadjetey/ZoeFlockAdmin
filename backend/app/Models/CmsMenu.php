<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmsMenu extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'location',
        'created_by',
        'updated_by',
    ];

    /**
     * Get the user who created the menu
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated the menu
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get the menu items
     */
    public function items(): HasMany
    {
        return $this->hasMany(CmsMenuItem::class, 'menu_id')->orderBy('order');
    }

    /**
     * Get root menu items (no parent)
     */
    public function rootItems(): HasMany
    {
        return $this->hasMany(CmsMenuItem::class, 'menu_id')
                    ->whereNull('parent_id')
                    ->orderBy('order');
    }

    /**
     * Scope for menus by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('location', $location);
    }
}
