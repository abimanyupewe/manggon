<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\CredentialGeneratorService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CredentialGeneratorTest extends TestCase
{
    use RefreshDatabase;

    protected CredentialGeneratorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CredentialGeneratorService();
    }

    public function test_staff_username_format_and_lowercase(): void
    {
        $username = $this->service->generateStaffUsername('Budi Santoso', '081234567890');

        $this->assertEquals('budi7890', $username);
        $this->assertEquals(strtolower($username), $username);
    }

    public function test_staff_username_handles_duplicate_with_counter(): void
    {
        User::factory()->create(['username' => 'budi7890']);

        $username = $this->service->generateStaffUsername('Budi Prasetyo', '085799997890');

        $this->assertEquals('budi7890_2', $username);
    }

    public function test_tenant_username_format_and_lowercase(): void
    {
        $username = $this->service->generateTenantUsername('A-01');

        $this->assertStringContainsString('_a01', $username);
        $this->assertEquals(strtolower($username), $username);
    }

    public function test_temporary_password_length(): void
    {
        $password = $this->service->generateTemporaryPassword(10);

        $this->assertEquals(10, strlen($password));
    }
}
