<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'date_of_birth',
        'gender',
        'profile_picture',
        'is_active',
        'email_verified_at',
        'email_verification_token',
        'email_verification_expires_at',
        'email_notifications_enabled',
        'email_notification_types',
        'sms_notifications_enabled',
        'sms_notification_types',
        'whatsapp_notifications_enabled',
        'whatsapp_notification_types',
        'whatsapp_number',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'email_verification_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'email_verification_expires_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'is_active' => 'boolean',
            'email_notifications_enabled' => 'boolean',
            'email_notification_types' => 'array',
            'sms_notifications_enabled' => 'boolean',
            'sms_notification_types' => 'array',
            'whatsapp_notifications_enabled' => 'boolean',
            'whatsapp_notification_types' => 'array',
        ];
    }

    /**
     * Get the user's full name
     */
    public function getFullNameAttribute()
    {
        return $this->name;
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin()
    {
        return $this->hasRole('admin');
    }

    /**
     * Check if user is a pastor
     */
    public function isPastor()
    {
        return $this->hasRole('pastor');
    }

    /**
     * Check if user is a member
     */
    public function isMember()
    {
        return $this->hasRole('member');
    }

    /**
     * Get user's role display name
     */
    public function getRoleDisplayNameAttribute()
    {
        $role = $this->roles()->first();
        return $role ? $role->display_name : 'No Role';
    }

    /**
     * Check if email is verified
     */
    public function isEmailVerified()
    {
        return !is_null($this->email_verified_at);
    }
}
