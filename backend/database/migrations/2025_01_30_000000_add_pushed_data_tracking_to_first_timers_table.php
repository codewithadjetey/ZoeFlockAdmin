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
        Schema::table('first_timers', function (Blueprint $table) {
            // Add columns to track pushed data
            $table->boolean('is_pushed_to_server')->default(false)->after('last_submission_date');
            $table->timestamp('pushed_at')->nullable()->after('is_pushed_to_server');
            $table->string('push_error')->nullable()->after('pushed_at');
            $table->integer('push_attempts')->default(0)->after('push_error');
            $table->timestamp('last_push_attempt')->nullable()->after('push_attempts');
            
            // Add indexes for performance
            $table->index('is_pushed_to_server');
            $table->index('pushed_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('first_timers', function (Blueprint $table) {
            $table->dropIndex(['is_pushed_to_server']);
            $table->dropIndex(['pushed_at']);
            
            $table->dropColumn([
                'is_pushed_to_server',
                'pushed_at',
                'push_error',
                'push_attempts',
                'last_push_attempt'
            ]);
        });
    }
};
