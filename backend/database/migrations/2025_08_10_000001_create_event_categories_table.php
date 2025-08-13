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
        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->default('#3B82F6'); // Default blue color
            $table->string('icon')->nullable(); // FontAwesome icon class
            $table->enum('attendance_type', ['individual', 'general', 'none'])->default('individual');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_pattern')->nullable(); // daily, weekly, monthly, yearly
            $table->json('recurrence_settings')->nullable(); // specific settings for the pattern
            $table->time('default_start_time')->nullable(); // Default time for events in this category
            $table->integer('default_duration')->nullable(); // Default duration in minutes
            $table->string('default_location')->nullable();
            $table->text('default_description')->nullable();
            $table->unsignedBigInteger('created_by');
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->timestamps();
            $table->boolean('deleted')->default(false);

            $table->foreign('created_by')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            
            $table->index(['is_active', 'deleted']);
            $table->index(['is_recurring', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_categories');
    }
};
