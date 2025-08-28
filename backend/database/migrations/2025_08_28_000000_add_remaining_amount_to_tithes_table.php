<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // First, update any NULL paid_amount values to 0
        DB::statement('UPDATE tithes SET paid_amount = 0.00 WHERE paid_amount IS NULL');
        
        Schema::table('tithes', function (Blueprint $table) {
            // Add remaining_amount column if it doesn't exist
            if (!Schema::hasColumn('tithes', 'remaining_amount')) {
                $table->decimal('remaining_amount', 12, 2)->after('paid_amount');
            }
        });
        
        // Now update the paid_amount column to have default value
        Schema::table('tithes', function (Blueprint $table) {
            if (Schema::hasColumn('tithes', 'paid_amount')) {
                $table->decimal('paid_amount', 12, 2)->default(0.00)->change();
            }
        });
    }

    public function down(): void
    {
        Schema::table('tithes', function (Blueprint $table) {
            if (Schema::hasColumn('tithes', 'remaining_amount')) {
                $table->dropColumn('remaining_amount');
            }
        });
    }
}; 