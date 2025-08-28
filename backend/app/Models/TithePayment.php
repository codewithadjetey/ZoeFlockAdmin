<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TithePayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tithe_id',
        'member_id',
        'amount',
        'payment_date',
        'payment_method',
        'reference_number',
        'notes',
        'recorded_by',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount' => 'decimal:2',
    ];

    // Payment methods
    const PAYMENT_METHOD_CASH = 'cash';
    const PAYMENT_METHOD_CHECK = 'check';
    const PAYMENT_METHOD_BANK_TRANSFER = 'bank_transfer';
    const PAYMENT_METHOD_MOBILE_MONEY = 'mobile_money';
    const PAYMENT_METHOD_OTHER = 'other';

    public static function getPaymentMethods(): array
    {
        return [
            self::PAYMENT_METHOD_CASH => 'Cash',
            self::PAYMENT_METHOD_CHECK => 'Check',
            self::PAYMENT_METHOD_BANK_TRANSFER => 'Bank Transfer',
            self::PAYMENT_METHOD_MOBILE_MONEY => 'Mobile Money',
            self::PAYMENT_METHOD_OTHER => 'Other',
        ];
    }

    /**
     * Get the tithe this payment belongs to
     */
    public function tithe(): BelongsTo
    {
        return $this->belongsTo(Tithe::class);
    }

    /**
     * Get the member who made this payment
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the user who recorded this payment
     */
    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
} 