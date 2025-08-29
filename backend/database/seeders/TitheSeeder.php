<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Tithe;
use App\Models\Member;
use App\Models\User;
use Carbon\Carbon;

class TitheSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing members and users
        $members = Member::all();
        $users = User::all();

        if ($members->isEmpty() || $users->isEmpty()) {
            $this->command->warn('No members or users found. Please run MemberSeeder and AdminSeeder first.');
            return;
        }

        $this->command->info('Seeding tithes...');

        // Create sample tithes for each member
        foreach ($members as $member) {
            // Create 2-5 tithes per member
            $titheCount = rand(2, 5);
            
            for ($i = 0; $i < $titheCount; $i++) {
                $frequency = rand(0, 1) === 0 ? 'weekly' : 'monthly';
                $startDate = Carbon::now()->subMonths(rand(1, 12));
                $nextDueDate = $frequency === 'weekly' 
                    ? $startDate->copy()->addWeek() 
                    : $startDate->copy()->addMonth();
                
                $isPaid = rand(0, 1) === 0;
                $paidAmount = $isPaid ? rand(1000, 10000) / 100 : null;
                $paidDate = $isPaid ? $startDate->copy()->addDays(rand(0, 30)) : null;
                $amount = rand(1000, 10000) / 100; // $10.00 to $100.00
                $remainingAmount = $isPaid ? 0 : $amount;

                Tithe::create([
                    'member_id' => $member->id,
                    'amount' => $amount,
                    'frequency' => $frequency,
                    'start_date' => $startDate,
                    'next_due_date' => $nextDueDate,
                    'is_active' => rand(0, 10) < 8, // 80% chance of being active
                    'is_paid' => $isPaid,
                    'paid_amount' => $paidAmount ?? 0.00,
                    'remaining_amount' => $remainingAmount,
                    'paid_date' => $paidDate,
                    'notes' => rand(0, 1) === 0 ? 'Sample tithe for testing purposes' : null,
                    'created_by' => $users->random()->id,
                    'updated_by' => null,
                ]);
            }
        }

        $this->command->info('Tithes seeded successfully!');
        $this->command->info('Created ' . Tithe::count() . ' tithes.');
    }
} 