<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incomes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('income_categories')->onDelete('cascade');
            $table->string('description')->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('received_date');
            $table->date('due_date')->nullable();
            $table->boolean('is_received')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incomes');
    }
};