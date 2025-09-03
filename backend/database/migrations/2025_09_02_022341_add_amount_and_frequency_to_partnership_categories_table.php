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
        Schema::table('partnership_categories', function (Blueprint $table) {
            $table->decimal('amount', 10, 2)->nullable()->after('description');
            $table->string('frequency')->nullable()->after('amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('partnership_categories', function (Blueprint $table) {
            $table->dropColumn(['amount', 'frequency']);
        });
    }
};
