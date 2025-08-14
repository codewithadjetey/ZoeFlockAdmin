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
        Schema::table('event_categories', function (Blueprint $table) {
            // For recurring events: when the recurring series should start
            $table->date('recurrence_start_date')->nullable()->after('recurrence_settings');
            
            // For recurring events: when the recurring series should end (optional)
            $table->date('recurrence_end_date')->nullable()->after('recurrence_start_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_categories', function (Blueprint $table) {
            $table->dropColumn([
                'default_event_date',
                'recurrence_start_date', 
                'recurrence_end_date'
            ]);
        });
    }
};
