<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'description',
        'amount',
        'paid_date',
        'due_date',
        'is_paid',
    ];

    protected $casts = [
        'paid_date' => 'datetime',
        'due_date' => 'datetime',
        'is_paid' => 'boolean',
        'amount' => 'decimal:2',
    ];

    public function category()
    {
        return $this->belongsTo(ExpenseCategory::class, 'category_id');
    }
}