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
            $table->enum('type', ['general', 'group', 'family'])->default('general')->after('attendance_type');
        });

        // Create pivot tables for many-to-many relationships
        Schema::create('event_category_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_category_id')->constrained()->onDelete('cascade');
            $table->foreignId('group_id')->constrained()->onDelete('cascade');
            $table->boolean('is_required')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['event_category_id', 'group_id']);
        });

        Schema::create('event_category_families', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_category_id')->constrained()->onDelete('cascade');
            $table->foreignId('family_id')->constrained()->onDelete('cascade');
            $table->boolean('is_required')->default(false);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            $table->unique(['event_category_id', 'family_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_category_families');
        Schema::dropIfExists('event_category_groups');
        
        Schema::table('event_categories', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};