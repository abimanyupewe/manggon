<?php

namespace Tests\Feature;

use App\Enums\ComplaintStatus;
use App\Enums\PaymentStatus;
use App\Enums\RoomStatus;
use App\Enums\SecurityLogStatus;
use App\Enums\SecurityLogType;
use App\Enums\UserRole;
use App\Models\ActivityLog;
use App\Models\ComplaintTicket;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Models\SecurityLog;
use App\Models\TenantProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ManggonFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_property_and_rooms_relationship(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
            'phone_number' => '08123456789',
            'facilities' => ['AC', 'WiFi'],
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'room_number' => 'A01',
            'floor' => 1,
            'price' => 1500000,
            'status' => RoomStatus::EMPTY,
        ]);

        $this->assertCount(1, $property->rooms);
        $this->assertEquals($property->id, $room->property->id);
        $this->assertEquals(RoomStatus::EMPTY, $room->status);
    }

    public function test_user_roles_and_helpers(): void
    {
        $owner = User::factory()->owner()->create(['username' => 'owner1']);
        $staff = User::factory()->staff()->create(['username' => 'staff1']);
        $tenant = User::factory()->tenant()->create(['username' => 'tenant1']);

        $this->assertTrue($owner->isOwner());
        $this->assertFalse($owner->isStaff());

        $this->assertTrue($staff->isStaff());
        $this->assertFalse($staff->isTenant());

        $this->assertTrue($tenant->isTenant());
        $this->assertEquals(UserRole::TENANT, $tenant->role);
    }

    public function test_tenant_profile_and_room_relation(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'room_number' => 'A01',
            'floor' => 1,
            'price' => 1500000,
            'status' => RoomStatus::OCCUPIED,
        ]);

        $tenant = User::factory()->tenant($property->id)->create(['username' => 'panda_a01']);

        $profile = TenantProfile::create([
            'user_id' => $tenant->id,
            'room_id' => $room->id,
            'emergency_contact_name' => 'Bambang',
            'emergency_contact_phone' => '0812345678',
            'entry_date' => '2026-09-01',
        ]);

        $this->assertEquals($room->id, $tenant->tenantProfile->room->id);
        $this->assertEquals($tenant->id, $profile->user->id);
    }

    public function test_payment_and_verifier_relation(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $staff = User::factory()->staff($property->id)->create(['username' => 'siti1234']);
        $tenant = User::factory()->tenant($property->id)->create(['username' => 'ceri_a02']);

        $payment = Payment::create([
            'invoice_number' => 'INV-TEST-001',
            'tenant_id' => $tenant->id,
            'property_id' => $property->id,
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::PAID,
            'verified_by' => $staff->id,
            'verified_at' => now(),
        ]);

        $this->assertEquals(PaymentStatus::PAID, $payment->status);
        $this->assertEquals($staff->id, $payment->verifier->id);
        $this->assertEquals($tenant->id, $payment->tenant->id);
    }

    public function test_security_log_and_complaint_ticket(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $room = Room::create([
            'property_id' => $property->id,
            'room_number' => 'A01',
            'floor' => 1,
            'price' => 1500000,
            'status' => RoomStatus::OCCUPIED,
        ]);

        $tenant = User::factory()->tenant($property->id)->create(['username' => 'zahra01']);
        $staff = User::factory()->staff($property->id)->create(['username' => 'staff_siti']);

        $securityLog = SecurityLog::create([
            'property_id' => $property->id,
            'tenant_id' => $tenant->id,
            'type' => SecurityLogType::LATE_RETURN,
            'date' => '2026-09-06',
            'planned_time' => '23:30',
            'notes' => 'Belajar kelompok',
            'status' => SecurityLogStatus::APPROVED,
            'approved_by' => $staff->id,
            'approved_at' => now(),
        ]);

        $this->assertEquals(SecurityLogStatus::APPROVED, $securityLog->status);
        $this->assertEquals($staff->id, $securityLog->approver->id);

        $complaint = ComplaintTicket::create([
            'ticket_number' => 'TKT-TEST-001',
            'property_id' => $property->id,
            'room_id' => $room->id,
            'tenant_id' => $tenant->id,
            'title' => 'AC Rusak',
            'description' => 'Tidak dingin',
            'status' => ComplaintStatus::PENDING,
        ]);

        $this->assertEquals(ComplaintStatus::PENDING, $complaint->status);
        $this->assertEquals($room->id, $complaint->room->id);
    }

    public function test_activity_log_polymorphic(): void
    {
        $property = Property::create([
            'name' => 'Cabang Melati',
            'slug' => 'cabang-melati',
            'address' => 'Jl. Dukuh Kupang',
        ]);

        $staff = User::factory()->staff($property->id)->create(['username' => 'staff_audit']);

        $log = ActivityLog::create([
            'user_id' => $staff->id,
            'property_id' => $property->id,
            'action' => 'test_action',
            'description' => 'Testing polymorphic audit log',
            'subject_type' => Property::class,
            'subject_id' => $property->id,
            'properties' => ['foo' => 'bar'],
        ]);

        $this->assertInstanceOf(Property::class, $log->subject);
        $this->assertEquals($property->id, $log->subject->id);
        $this->assertEquals(['foo' => 'bar'], $log->properties);
    }
}
