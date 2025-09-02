<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'description',
        'amount',
        'received_date',
        'due_date',
        'is_received',
    ];

    protected $casts = [
        'received_date' => 'datetime',
        'due_date' => 'datetime',
        'is_received' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(IncomeCategory::class, 'category_id');
    }
}