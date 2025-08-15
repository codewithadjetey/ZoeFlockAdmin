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
        Schema::table('general_attendances', function (Blueprint $table) {
            // Add foreign key constraint for family_id that allows null values
            $table->foreign('family_id')->references('id')->on('families')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('general_attendances', function (Blueprint $table) {
            // Drop the foreign key constraint
            $table->dropForeign(['family_id']);
        });
    }
};
