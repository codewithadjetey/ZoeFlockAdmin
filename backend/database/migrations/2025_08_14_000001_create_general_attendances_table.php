<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('general_attendances', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('event_id');
            $table->integer('total_attendance');
            $table->integer('first_timers_count')->default(0);
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('recorded_by');
            $table->unsignedBigInteger('family_id')->nullable();
            $table->timestamps();

            $table->foreign('event_id')->references('id')->on('events')->onDelete('cascade');
            $table->foreign('recorded_by')->references('id')->on('users')->onDelete('cascade');
            
            $table->unique(['event_id']);
            $table->index(['event_id', 'created_at']);
            $table->index(['recorded_by', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('general_attendances');
    }
}; 