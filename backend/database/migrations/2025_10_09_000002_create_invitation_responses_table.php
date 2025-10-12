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
        Schema::create('invitation_responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_invitation_id')->constrained('event_invitations')->onDelete('cascade');
            $table->string('guest_name');
            $table->string('guest_email')->nullable();
            $table->string('guest_phone')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'declined', 'attended'])->default('pending');
            $table->integer('number_of_guests')->default(1);
            $table->text('notes')->nullable();
            $table->text('special_requirements')->nullable();
            $table->timestamp('responded_at')->useCurrent();
            $table->timestamps();

            // Index for faster querying
            $table->index(['event_invitation_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitation_responses');
    }
};
