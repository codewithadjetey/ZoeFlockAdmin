<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Generate member_identification_id for existing members
        $members = DB::table('members')->get();
        foreach ($members as $member) {
            $memberId = $this->generateMemberId();
            DB::table('members')
                ->where('id', $member->id)
                ->update(['member_identification_id' => $memberId]);
        }

        // Remove the old barcode field
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn('barcode');
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            // Add back the barcode field
            $table->string('barcode')->nullable()->after('profile_image_path');
        });
    }

    private function generateMemberId(): string
    {
        do {
            // Format: yyyymmdd + 6 random digits
            $date = now()->format('Ymd');
            $random = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
            $memberId = $date . $random;
            
            // Check if this ID already exists
            $exists = DB::table('members')->where('member_identification_id', $memberId)->exists();
        } while ($exists);

        return $memberId;
    }
}; 