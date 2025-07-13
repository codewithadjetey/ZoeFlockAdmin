<?php

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Laravel\Sanctum\Sanctum;

test('api login returns token and user information', function () {
    // Create a role and permission
    $role = Role::create([
        'name' => 'admin',
        'display_name' => 'Administrator',
        'description' => 'Full system access'
    ]);

    $permission = Permission::create([
        'name' => 'manage_users',
        'display_name' => 'Manage Users',
        'description' => 'Can manage all users'
    ]);

    $role->permissions()->attach($permission);

    // Create a user with the role
    $user = User::factory()->create([
        'name' => 'John Doe',
        'email' => 'john@example.com',
        'phone' => '+1234567890',
        'address' => '123 Church St',
        'date_of_birth' => '1990-01-01',
        'gender' => 'male',
        'is_active' => true
    ]);

    $user->assignRole($role);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'john@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'message',
            'data' => [
                'user' => [
                    'id',
                    'name',
                    'email',
                    'phone',
                    'address',
                    'date_of_birth',
                    'gender',
                    'profile_picture',
                    'is_active',
                    'email_verified_at',
                    'created_at',
                    'updated_at',
                    'roles' => [
                        '*' => [
                            'id',
                            'name',
                            'display_name',
                            'description',
                            'permissions' => [
                                '*' => [
                                    'id',
                                    'name',
                                    'display_name',
                                    'description'
                                ]
                            ]
                        ]
                    ],
                    'permissions' => [
                        '*' => [
                            'id',
                            'name',
                            'display_name',
                            'description'
                        ]
                    ],
                    'role_display_name',
                    'is_admin',
                    'is_pastor',
                    'is_member'
                ],
                'token',
                'token_type',
                'expires_in',
                'refresh_token'
            ]
        ]);

    $responseData = $response->json();
    
    expect($responseData['success'])->toBe(true);
    expect($responseData['message'])->toBe('Login successful');
    expect($responseData['data']['user']['name'])->toBe('John Doe');
    expect($responseData['data']['user']['email'])->toBe('john@example.com');
    expect($responseData['data']['user']['is_admin'])->toBe(true);
    expect($responseData['data']['token'])->toBeString();
    expect($responseData['data']['token_type'])->toBe('Bearer');
});

test('api login fails with invalid credentials', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'invalid@example.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'message' => 'Invalid credentials'
        ]);
});

test('api login fails with validation errors', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'invalid-email',
        'password' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonStructure([
            'success',
            'message',
            'errors'
        ]);
});

test('api login fails for deactivated account', function () {
    $user = User::factory()->create([
        'email' => 'deactivated@example.com',
        'is_active' => false
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'deactivated@example.com',
        'password' => 'password',
    ]);

    $response->assertStatus(401)
        ->assertJson([
            'success' => false,
            'message' => 'Account is deactivated'
        ]);
});

test('api logout revokes token', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/v1/auth/logout');

    $response->assertStatus(200)
        ->assertJson([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
});

test('api profile returns user information', function () {
    $user = User::factory()->create();
    Sanctum::actingAs($user);

    $response = $this->getJson('/api/v1/auth/profile');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'success',
            'data' => [
                'user'
            ]
        ]);
}); 