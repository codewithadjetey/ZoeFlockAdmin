<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tithes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->enum('frequency', ['weekly', 'monthly']);
            $table->date('start_date');
            $table->date('next_due_date');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_paid')->default(false);
            $table->decimal('paid_amount', 12, 2)->default(0.00);
            $table->decimal('remaining_amount', 12, 2);
            $table->date('paid_date')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->foreignId('updated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['member_id', 'is_active']);
            $table->index(['next_due_date', 'is_paid']);
            $table->index(['is_active', 'is_paid']);
            $table->index(['remaining_amount']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tithes');
    }
}; 