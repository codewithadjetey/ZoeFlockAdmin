<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Update existing tithes to set remaining_amount
        DB::statement('UPDATE tithes SET remaining_amount = amount - COALESCE(paid_amount, 0) WHERE remaining_amount IS NULL');
        
        // Set remaining_amount to 0 for fully paid tithes
        DB::statement('UPDATE tithes SET remaining_amount = 0 WHERE is_paid = 1 AND remaining_amount IS NULL');
    }

    public function down(): void
    {
        // No rollback needed for this data update
    }
}; 