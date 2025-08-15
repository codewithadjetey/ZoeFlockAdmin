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
            $table->unsignedBigInteger('family_id')->nullable()->after('event_id');
            $table->foreign('family_id')->references('id')->on('families')->onDelete('set null');
            $table->index(['family_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('general_attendances', function (Blueprint $table) {
            $table->dropForeign(['family_id']);
            $table->dropIndex(['family_id']);
            $table->dropColumn('family_id');
        });
    }
};
