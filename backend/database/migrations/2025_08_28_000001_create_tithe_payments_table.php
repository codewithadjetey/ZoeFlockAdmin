<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tithe_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tithe_id')->constrained('tithes')->onDelete('cascade');
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->decimal('amount', 12, 2);
            $table->date('payment_date');
            $table->enum('payment_method', ['cash', 'check', 'bank_transfer', 'mobile_money', 'other'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['tithe_id']);
            $table->index(['member_id']);
            $table->index(['payment_date']);
            $table->index(['payment_method']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tithe_payments');
    }
}; 