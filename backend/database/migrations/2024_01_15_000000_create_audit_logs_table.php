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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // e.g., 'import', 'export', 'create', 'update', 'delete'
            $table->string('model_type')->nullable(); // e.g., 'App\Models\Member'
            $table->unsignedBigInteger('model_id')->nullable(); // ID of the affected model
            $table->text('description');
            $table->json('details')->nullable(); // Additional details about the action
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->enum('status', ['success', 'error', 'warning'])->default('success');
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['action', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index(['user_id', 'created_at']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
}; 