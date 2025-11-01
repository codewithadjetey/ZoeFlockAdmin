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
        Schema::create('cms_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('cms_menus')->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('cms_menu_items')->onDelete('cascade');
            $table->string('label');
            $table->enum('type', ['page', 'link', 'feature'])->default('link');
            $table->unsignedBigInteger('target_id')->nullable(); // ID of page, sermon, announcement etc.
            $table->string('url')->nullable(); // External URL or custom link
            $table->string('icon')->nullable();
            $table->integer('order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->enum('target_window', ['_self', '_blank'])->default('_self');
            $table->timestamps();

            $table->index(['menu_id', 'order']);
            $table->index(['parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cms_menu_items');
    }
};
