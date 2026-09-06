<?php

namespace Tests\Feature;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ForcePasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_user_with_must_change_password_is_redirected(): void
    {
        $user = User::factory()->create([
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertRedirect(route('password.force-change'));
    }

    public function test_user_with_must_change_password_receives_403_json(): void
    {
        $user = User::factory()->create([
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->getJson('/dashboard');

        $response->assertStatus(403)
            ->assertJson([
                'code' => 'MUST_CHANGE_PASSWORD',
            ]);
    }

    public function test_user_can_view_force_change_password_screen(): void
    {
        $user = User::factory()->create([
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->get(route('password.force-change'));

        $response->assertOk();
    }

    public function test_user_can_update_password_and_unlock_access(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old_password123'),
            'must_change_password' => true,
        ]);

        $response = $this->actingAs($user)->post(route('password.force-change.update'), [
            'password' => 'NewSecurePassword123!',
            'password_confirmation' => 'NewSecurePassword123!',
        ]);

        $response->assertRedirect(route('dashboard'));

        $user->refresh();
        $this->assertFalse($user->must_change_password);
        $this->assertTrue(Hash::check('NewSecurePassword123!', $user->password));

        // Verifikasi activity log tercatat
        $this->assertDatabaseHas('activity_logs', [
            'user_id' => $user->id,
            'action' => 'force_password_change',
        ]);

        // Verifikasi setelah update, akses ke dashboard tidak dicegat
        $this->actingAs($user)->get('/dashboard')->assertOk();
    }
}
