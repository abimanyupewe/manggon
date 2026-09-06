<?php

namespace Tests\Feature;

use App\Enums\PaymentStatus;
use App\Enums\SecurityLogType;
use App\Models\Payment;
use App\Models\Property;
use App\Models\SecurityLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RbacAndDataScopingPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_owner_can_create_payment_bills(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $owner = User::factory()->owner()->create(['username' => 'owner1']);
        $staff = User::factory()->staff($property->id)->create(['username' => 'staff1']);

        $this->assertTrue($owner->can('create', Payment::class));
        $this->assertFalse($staff->can('create', Payment::class));
    }

    public function test_staff_can_only_verify_payment_for_their_assigned_property(): void
    {
        $propertyA = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $propertyB = Property::create([
            'name' => 'Cabang Anggrek',
            'slug' => 'cabang-anggrek',
            'address' => 'Jl. Gubeng',
        ]);

        $staffMelati = User::factory()->staff($propertyA->id)->create(['username' => 'siti_melati']);
        $tenantMelati = User::factory()->tenant($propertyA->id)->create(['username' => 'tenant_melati']);
        $tenantAnggrek = User::factory()->tenant($propertyB->id)->create(['username' => 'tenant_anggrek']);

        $paymentMelati = Payment::create([
            'invoice_number' => 'INV-001',
            'tenant_id' => $tenantMelati->id,
            'property_id' => $propertyA->id,
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::PENDING_VERIFICATION,
        ]);

        $paymentAnggrek = Payment::create([
            'invoice_number' => 'INV-002',
            'tenant_id' => $tenantAnggrek->id,
            'property_id' => $propertyB->id,
            'billing_period' => 'September 2026',
            'amount' => 1800000,
            'status' => PaymentStatus::PENDING_VERIFICATION,
        ]);

        // Staf Melati BISA memvalidasi pembayaran di Cabang Melati
        $this->assertTrue($staffMelati->can('verify', $paymentMelati));

        // Staf Melati DILARANG memvalidasi pembayaran di Cabang Anggrek (Data Scoping)
        $this->assertFalse($staffMelati->can('verify', $paymentAnggrek));
    }

    public function test_staff_cannot_create_users_or_tenants(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $owner = User::factory()->owner()->create(['username' => 'owner_user']);
        $staff = User::factory()->staff($property->id)->create(['username' => 'staff_user']);

        $this->assertTrue($owner->can('create', User::class));
        $this->assertFalse($staff->can('create', User::class));
    }

    public function test_staff_security_log_approval_data_scoping(): void
    {
        $propertyA = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $propertyB = Property::create([
            'name' => 'Cabang Anggrek',
            'slug' => 'cabang-anggrek',
            'address' => 'Jl. Gubeng',
        ]);

        $staffMelati = User::factory()->staff($propertyA->id)->create(['username' => 'siti_sec']);
        $tenantMelati = User::factory()->tenant($propertyA->id)->create(['username' => 'tenant_sec_a']);
        $tenantAnggrek = User::factory()->tenant($propertyB->id)->create(['username' => 'tenant_sec_b']);

        $logMelati = SecurityLog::create([
            'property_id' => $propertyA->id,
            'tenant_id' => $tenantMelati->id,
            'type' => SecurityLogType::LATE_RETURN,
            'date' => '2026-09-06',
            'planned_time' => '23:30',
            'notes' => 'Tugas',
        ]);

        $logAnggrek = SecurityLog::create([
            'property_id' => $propertyB->id,
            'tenant_id' => $tenantAnggrek->id,
            'type' => SecurityLogType::LATE_RETURN,
            'date' => '2026-09-06',
            'planned_time' => '23:30',
            'notes' => 'Tugas',
        ]);

        $this->assertTrue($staffMelati->can('approve', $logMelati));
        $this->assertFalse($staffMelati->can('approve', $logAnggrek));
    }
}
