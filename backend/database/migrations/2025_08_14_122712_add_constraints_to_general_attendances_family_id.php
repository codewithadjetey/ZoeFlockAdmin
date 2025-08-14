<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // First, ensure all existing records have a family_id
        $defaultFamilyId = DB::table('families')->first()->id ?? 1;
        DB::table('general_attendances')->whereNull('family_id')->update(['family_id' => $defaultFamilyId]);

        Schema::table('general_attendances', function (Blueprint $table) {
            // Add foreign key constraint for family_id
            $table->foreign('family_id')->references('id')->on('families')->onDelete('cascade');
            
            // Create unique constraint on event_id and family_id combination
            // This allows one general attendance record per family per event
            $table->unique(['event_id', 'family_id']);
            
            // Add index for family_id (if it doesn't exist)
            if (!Schema::hasIndex('general_attendances', 'general_attendances_family_id_index')) {
                $table->index(['family_id']);
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('general_attendances', function (Blueprint $table) {
            // Drop the unique constraint
            $table->dropUnique(['event_id', 'family_id']);
            
            // Drop family_id foreign key
            $table->dropForeign(['family_id']);
            
            // Drop family_id index if it exists
            if (Schema::hasIndex('general_attendances', 'general_attendances_family_id_index')) {
                $table->dropIndex(['family_id']);
            }
        });
    }
};
