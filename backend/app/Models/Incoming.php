<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Incoming extends Model
{
    use HasFactory;

    protected $fillable = [
        'model_type', // e.g. Pledge, Partnership, Tithe, etc.
        'model_id',   // ID of the related model
        'amount',     // Total amount expected
        'paid',       // Amount paid so far
        'paid_date',  // Date when payment was made
        'due_date',   // Due date for payment
        'notes',      // Optional notes
        // Add more fields as needed
    ];
}