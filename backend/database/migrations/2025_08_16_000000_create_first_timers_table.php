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
        Schema::create('first_timers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->string('primary_mobile_number');
            $table->string('secondary_mobile_number')->nullable();
            $table->text('how_was_service')->nullable();
            $table->boolean('is_first_time')->default(true);
            $table->boolean('has_permanent_place_of_worship')->nullable();
            $table->string('invited_by')->nullable(); // Name entered by QR code users
            $table->foreignId('invited_by_member_id')->nullable()->constrained('members')->onDelete('set null'); // For admin/family head assignment
            $table->boolean('would_like_to_stay')->nullable();
            $table->integer('visit_count')->default(1);
            $table->enum('status', ['first_timer', 'visitor', 'potential_member'])->default('first_timer');
            $table->boolean('self_registered')->default(false);
            $table->foreignId('assigned_member_id')->nullable()->constrained('members')->onDelete('set null');
            $table->string('device_fingerprint')->nullable();
            $table->date('last_submission_date')->nullable();
            $table->timestamps();
            // Indexes for performance
            $table->index('primary_mobile_number');
            $table->index('status');
            $table->index('device_fingerprint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('first_timers');
    }
};