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
        Schema::create('families', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slogan')->nullable();
            $table->string('img_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->boolean('deleted')->default(false);
            $table->foreignId('family_head_id')->constrained('members')->onDelete('cascade');
            $table->timestamps();

            // Indexes for better performance
            $table->index(['active', 'deleted']);
            $table->index('family_head_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('families');
    }
}; 