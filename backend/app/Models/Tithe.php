<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Tithe extends Model
{
    use HasFactory;

    protected $fillable = [
        'member_id',
        'amount',
        'frequency',
        'start_date',
        'next_due_date',
        'is_active',
        'is_paid',
        'paid_amount',
        'remaining_amount',
        'paid_date',
        'notes',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'next_due_date' => 'date',
        'paid_date' => 'date',
        'is_active' => 'boolean',
        'is_paid' => 'boolean',
        'amount' => 'decimal:2',
        'paid_amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
    ];

    // Frequencies
    const FREQUENCY_WEEKLY = 'weekly';
    const FREQUENCY_MONTHLY = 'monthly';

    public static function getFrequencies(): array
    {
        return [
            self::FREQUENCY_WEEKLY => 'Weekly',
            self::FREQUENCY_MONTHLY => 'Monthly',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($tithe) {
            if (!isset($tithe->remaining_amount)) {
                $tithe->remaining_amount = $tithe->amount;
            }
        });
    }

    /**
     * Get the member who owns this tithe
     */
    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    /**
     * Get the user who created this tithe
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who last updated this tithe
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Get all payments for this tithe
     */
    public function payments(): HasMany
    {
        return $this->hasMany(TithePayment::class);
    }

    /**
     * Calculate the next due date based on frequency
     */
    public function calculateNextDueDate(): Carbon
    {
        $lastDate = $this->paid_date ?? $this->start_date;
        
        if ($this->frequency === self::FREQUENCY_WEEKLY) {
            return $lastDate->addWeek();
        } else {
            return $lastDate->addMonth();
        }
    }

    /**
     * Check if tithe is overdue
     */
    public function isOverdue(): bool
    {
        return $this->next_due_date && $this->next_due_date->isPast() && !$this->isFullyPaid();
    }

    /**
     * Get overdue days
     */
    public function getOverdueDays(): int
    {
        if (!$this->isOverdue()) {
            return 0;
        }
        
        return $this->next_due_date->diffInDays(now());
    }

    /**
     * Check if tithe is fully paid
     */
    public function isFullyPaid(): bool
    {
        return $this->remaining_amount <= 0;
    }

    /**
     * Get payment progress percentage
     */
    public function getPaymentProgress(): float
    {
        if ($this->amount <= 0) {
            return 0;
        }
        
        return round(($this->paid_amount / $this->amount) * 100, 2);
    }

    /**
     * Add a partial payment
     */
    public function addPayment(float $amount, string $paymentMethod = 'cash', string $referenceNumber = null, string $notes = null, int $recordedBy = null): TithePayment
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Payment amount must be greater than 0');
        }

        if ($amount > $this->remaining_amount) {
            throw new \InvalidArgumentException(
                'Payment amount ($' . number_format($amount, 2) . ') cannot exceed remaining amount ($' . number_format($this->remaining_amount, 2) . ')'
            );
        }

        // Create payment record
        $payment = TithePayment::create([
            'tithe_id' => $this->id,
            'member_id' => $this->member_id,
            'amount' => $amount,
            'payment_date' => now(),
            'payment_method' => $paymentMethod,
            'reference_number' => $referenceNumber,
            'notes' => $notes,
            'recorded_by' => $recordedBy ?? auth()->id(),
        ]);

        // Update tithe payment status
        $this->paid_amount += $amount;
        $this->remaining_amount -= $amount;
        
        // Check if fully paid
        if ($this->remaining_amount <= 0) {
            $this->is_paid = true;
            $this->paid_date = now();
            $this->next_due_date = $this->calculateNextDueDate();
        }
        
        $this->save();

        return $payment;
    }

    /**
     * Mark as fully paid (for backward compatibility)
     */
    public function markAsPaid(float $amount = null, string $notes = null): void
    {
        $remainingAmount = $amount ?? $this->remaining_amount;
        
        if ($remainingAmount > 0) {
            // Prevent overpayment
            if ($remainingAmount > $this->remaining_amount) {
                throw new \InvalidArgumentException(
                    'Payment amount ($' . number_format($remainingAmount, 2) . ') cannot exceed remaining amount ($' . number_format($this->remaining_amount, 2) . ')'
                );
            }
            
            // Always handle the payment directly to avoid validation issues
            $this->paid_amount += $remainingAmount;
            $this->remaining_amount -= $remainingAmount;
            
            // Check if fully paid
            if ($this->remaining_amount <= 0) {
                $this->is_paid = true;
                $this->paid_date = now();
                $this->next_due_date = $this->calculateNextDueDate();
            }
            
            if ($notes) {
                $this->notes = $notes;
            }
            
            $this->save();
        }
    }

    /**
     * Create next recurring tithe
     */
    public function createNextRecurring(): ?Tithe
    {
        if (!$this->isFullyPaid() || !$this->is_active) {
            return null;
        }

        return self::create([
            'member_id' => $this->member_id,
            'amount' => $this->amount,
            'frequency' => $this->frequency,
            'start_date' => $this->next_due_date,
            'next_due_date' => $this->calculateNextDueDate(),
            'is_active' => true,
            'is_paid' => false,
            'paid_amount' => 0.00,
            'remaining_amount' => $this->amount,
            'created_by' => $this->created_by,
        ]);
    }

    /**
     * Scope for active tithes
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for paid tithes
     */
    public function scopePaid($query)
    {
        return $query->where('is_paid', true);
    }

    /**
     * Scope for unpaid tithes
     */
    public function scopeUnpaid($query)
    {
        return $query->where('is_paid', false);
    }

    /**
     * Scope for overdue tithes
     */
    public function scopeOverdue($query)
    {
        return $query->where('next_due_date', '<', now())
                    ->where('is_paid', false)
                    ->where('is_active', true);
    }

    /**
     * Scope for partially paid tithes
     */
    public function scopePartiallyPaid($query)
    {
        return $query->where('paid_amount', '>', 0)
                    ->where('remaining_amount', '>', 0)
                    ->where('is_active', true);
    }
} 