<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PartnershipCategory extends Model
{
    protected $fillable = [
        'name',
        'description',
        'amount',
        'frequency',
    ];

    public function partnerships(): HasMany
    {
        return $this->hasMany(Partnership::class, 'category_id');
    }
}
