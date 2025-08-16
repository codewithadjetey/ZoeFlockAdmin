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
        // No longer needed: foreign key is created in the table creation migration.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No longer needed: do not drop foreign key here.
    }
};
