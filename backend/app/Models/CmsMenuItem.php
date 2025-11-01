<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CmsMenuItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'menu_id',
        'parent_id',
        'label',
        'type',
        'target_id',
        'url',
        'icon',
        'order',
        'is_visible',
        'target_window',
    ];

    protected $casts = [
        'is_visible' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Get the menu this item belongs to
     */
    public function menu(): BelongsTo
    {
        return $this->belongsTo(CmsMenu::class, 'menu_id');
    }

    /**
     * Get the parent menu item
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(CmsMenuItem::class, 'parent_id');
    }

    /**
     * Get child menu items
     */
    public function children(): HasMany
    {
        return $this->hasMany(CmsMenuItem::class, 'parent_id')->orderBy('order');
    }

    /**
     * Scope for visible items
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Get the full URL for this item
     */
    public function getFullUrlAttribute(): string
    {
        if ($this->type === 'link' && $this->url) {
            return $this->url;
        }
        
        if ($this->type === 'page' && $this->target_id) {
            $page = CmsPage::find($this->target_id);
            return $page ? '/pages/' . $page->slug : '#';
        }
        
        return '#';
    }
}
