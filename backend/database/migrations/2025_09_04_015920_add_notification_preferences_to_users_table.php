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
        Schema::table('users', function (Blueprint $table) {
            // Email notification preferences
            $table->boolean('email_notifications_enabled')->default(true)->after('is_active');
            $table->json('email_notification_types')->nullable()->after('email_notifications_enabled');
            
            // SMS notification preferences
            $table->boolean('sms_notifications_enabled')->default(false)->after('email_notification_types');
            $table->json('sms_notification_types')->nullable()->after('sms_notifications_enabled');
            
            // WhatsApp notification preferences
            $table->boolean('whatsapp_notifications_enabled')->default(false)->after('sms_notification_types');
            $table->json('whatsapp_notification_types')->nullable()->after('whatsapp_notifications_enabled');
            
            // WhatsApp number (separate from phone for SMS)
            $table->string('whatsapp_number')->nullable()->after('whatsapp_notification_types');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'email_notifications_enabled',
                'email_notification_types',
                'sms_notifications_enabled',
                'sms_notification_types',
                'whatsapp_notifications_enabled',
                'whatsapp_notification_types',
                'whatsapp_number'
            ]);
        });
    }
};
