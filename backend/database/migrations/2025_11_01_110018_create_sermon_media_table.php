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
        Schema::create('sermon_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sermon_id')->constrained('sermons')->onDelete('cascade');
            $table->enum('media_type', ['audio', 'video', 'youtube', 'document'])->default('audio');
            $table->string('file_path')->nullable();
            $table->string('youtube_url')->nullable();
            $table->string('external_url')->nullable();
            $table->integer('duration')->nullable(); // in seconds
            $table->integer('file_size')->nullable(); // in bytes
            $table->integer('order')->default(0);
            $table->timestamps();

            $table->index(['sermon_id', 'media_type']);
            $table->index(['sermon_id', 'order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sermon_media');
    }
};
