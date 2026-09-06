<?php

namespace Database\Factories;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'username' => fake()->unique()->userName(),
            'phone_number' => fake()->phoneNumber(),
            'role' => UserRole::TENANT,
            'is_active' => true,
            'must_change_password' => false,
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function owner(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::OWNER,
            'property_id' => null,
        ]);
    }

    public function staff(?int $propertyId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::STAFF,
            'property_id' => $propertyId,
        ]);
    }

    public function tenant(?int $propertyId = null): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::TENANT,
            'property_id' => $propertyId,
        ]);
    }
}
