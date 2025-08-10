<?php

namespace App\Observers;

use App\Models\Member;
use App\Models\User;
use App\Mail\WelcomeMemberMail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class MemberObserver
{
    /**
     * Handle the Member "created" event.
     */
    public function created(Member $member): void
    {
        // Automatically create a user account for the member
        $this->createUserAccount($member);
    }

    /**
     * Handle the Member "updated" event.
     */
    public function updated(Member $member): void
    {
        // If member was updated and doesn't have a user account, create one
        if (!$member->hasUserAccount() && $member->is_active) {
            $this->createUserAccount($member);
        }
        
        // Handle member deactivation - deactivate associated user account
        if ($member->wasChanged('is_active') && !$member->is_active && $member->user_id) {
            $this->deactivateUserAccount($member);
        }
        
        // Handle member reactivation - reactivate associated user account
        if ($member->wasChanged('is_active') && $member->is_active && $member->user_id) {
            $this->reactivateUserAccount($member);
        }
    }

    /**
     * Handle the Member "deleted" event.
     */
    public function deleted(Member $member): void
    {
        // Clean up associated user account if it exists
        if ($member->user_id) {
            $this->cleanupUserAccount($member);
        }
    }
    
    /**
     * Create a user account for a member
     */
    protected function createUserAccount(Member $member): void
    {
        try {
            // Check if a user with this email already exists
            $existingUser = User::where('email', $member->email)->first();
            
            if ($existingUser) {
                // Link the existing user to the member
                $member->updateQuietly(['user_id' => $existingUser->id]);
                return;
            }

            // Generate a random password
            $password = Str::random(12);
            
            // Ensure is_active has a value
            $isActive = $member->is_active ?? true;
            
            // Create the user account
            $user = User::create([
                'name' => $member->full_name,
                'email' => $member->email,
                'password' => Hash::make($password),
                'phone' => $member->phone,
                'address' => $member->address,
                'date_of_birth' => $member->date_of_birth,
                'gender' => $member->gender,
                'profile_picture' => $member->profile_image_path,
                'is_active' => $isActive,
            ]);

            // Assign the 'member' role
            $user->assignRole('member');

            // Link the user to the member
            $member->updateQuietly(['user_id' => $user->id]);

            // Send welcome email with credentials
            try {
                Mail::to($member->email)->send(new WelcomeMemberMail($member, $password));
            } catch (\Exception $e) {
                \Log::warning('Failed to send welcome email to member: ' . $e->getMessage(), [
                    'member_id' => $member->id,
                    'email' => $member->email
                ]);
            }
            
        } catch (\Exception $e) {
            // Log the error but don't fail the member creation
            \Log::error('Failed to create user account for member: ' . $e->getMessage(), [
                'member_id' => $member->id,
                'email' => $member->email,
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
    
    /**
     * Deactivate the user account associated with a member
     */
    protected function deactivateUserAccount(Member $member): void
    {
        try {
            $user = User::find($member->user_id);
            if ($user) {
                $user->update(['is_active' => false]);
                \Log::info('User account deactivated for member', [
                    'member_id' => $member->id,
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to deactivate user account for member: ' . $e->getMessage(), [
                'member_id' => $member->id,
                'user_id' => $member->user_id
            ]);
        }
    }
    
    /**
     * Reactivate the user account associated with a member
     */
    protected function reactivateUserAccount(Member $member): void
    {
        try {
            $user = User::find($member->user_id);
            if ($user) {
                $user->update(['is_active' => true]);
                \Log::info('User account reactivated for member', [
                    'member_id' => $member->id,
                    'user_id' => $user->id,
                    'email' => $user->email
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Failed to reactivate user account for member: ' . $e->getMessage(), [
                'member_id' => $member->id,
                'user_id' => $member->user_id
            ]);
        }
    }
    
    /**
     * Clean up the user account when a member is deleted
     */
    protected function cleanupUserAccount(Member $member): void
    {
        try {
            $user = User::find($member->user_id);
            if ($user) {
                // Check if this user is only associated with this member
                $otherMembers = Member::where('user_id', $user->id)
                    ->where('id', '!=', $member->id)
                    ->exists();
                
                if (!$otherMembers) {
                    // If no other members are associated, delete the user account
                    $user->delete();
                    \Log::info('User account deleted after member cleanup', [
                        'member_id' => $member->id,
                        'user_id' => $user->id,
                        'email' => $user->email
                    ]);
                } else {
                    // If other members exist, just remove the user_id reference
                    $member->updateQuietly(['user_id' => null]);
                    \Log::info('User account reference removed from deleted member', [
                        'member_id' => $member->id,
                        'user_id' => $user->id
                    ]);
                }
            }
        } catch (\Exception $e) {
            \Log::error('Failed to cleanup user account for deleted member: ' . $e->getMessage(), [
                'member_id' => $member->id,
                'user_id' => $member->user_id
            ]);
        }
    }
} 