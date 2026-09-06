<?php

namespace Tests\Feature;

use App\Enums\ComplaintStatus;
use App\Enums\PaymentStatus;
use App\Enums\RoomStatus;
use App\Enums\SecurityLogStatus;
use App\Enums\SecurityLogType;
use App\Models\ComplaintTicket;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Models\SecurityLog;
use App\Models\TenantProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationalEndpointsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_owner_can_create_and_list_properties(): void
    {
        $owner = User::factory()->owner()->create(['username' => 'owner_op']);

        $response = $this->actingAs($owner)->postJson(route('properties.store'), [
            'name' => 'Cabang Cempaka',
            'address' => 'Jl. Cempaka Putih No. 10',
            'phone_number' => '0811223344',
            'facilities' => ['AC', 'WiFi'],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.name', 'Cabang Cempaka');

        $this->assertDatabaseHas('properties', ['name' => 'Cabang Cempaka']);

        $listResponse = $this->actingAs($owner)->getJson(route('properties.index'));
        $listResponse->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_staff_is_scoped_to_their_property(): void
    {
        $propA = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $propB = Property::create(['name' => 'Anggrek', 'slug' => 'anggrek', 'address' => 'Jl. B']);

        $staffA = User::factory()->staff($propA->id)->create(['username' => 'staff_a']);

        $response = $this->actingAs($staffA)->getJson(route('properties.index'));
        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $propA->id);

        $this->actingAs($staffA)->getJson(route('properties.show', $propB))
            ->assertStatus(403);
    }

    public function test_room_status_update_by_staff_in_own_branch(): void
    {
        $propA = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $propB = Property::create(['name' => 'Anggrek', 'slug' => 'anggrek', 'address' => 'Jl. B']);

        $roomA = Room::create([
            'property_id' => $propA->id,
            'room_number' => 'A101',
            'floor' => 1,
            'price' => 1500000,
            'status' => RoomStatus::EMPTY,
        ]);

        $roomB = Room::create([
            'property_id' => $propB->id,
            'room_number' => 'B101',
            'floor' => 1,
            'price' => 1800000,
            'status' => RoomStatus::EMPTY,
        ]);

        $staffA = User::factory()->staff($propA->id)->create(['username' => 'staff_room_a']);

        // Staf A bisa update roomA
        $response = $this->actingAs($staffA)->patchJson(route('rooms.update-status', $roomA), [
            'status' => RoomStatus::MAINTENANCE->value,
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertEquals(RoomStatus::MAINTENANCE, $roomA->fresh()->status);

        // Staf A dilarang update roomB (Data Scoping)
        $this->actingAs($staffA)->patchJson(route('rooms.update-status', $roomB), [
            'status' => RoomStatus::MAINTENANCE->value,
        ])->assertStatus(403);
    }

    public function test_owner_can_generate_staff_and_tenant_accounts(): void
    {
        $prop = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $room = Room::create([
            'property_id' => $prop->id,
            'room_number' => 'A201',
            'floor' => 2,
            'price' => 1600000,
            'status' => RoomStatus::EMPTY,
        ]);

        $owner = User::factory()->owner()->create(['username' => 'owner_gen']);

        // 1. Generate Staff
        $staffResponse = $this->actingAs($owner)->postJson(route('users.generate-staff'), [
            'name' => 'Ahmad Dahlan',
            'phone_number' => '081234569999',
            'property_id' => $prop->id,
        ]);

        $staffResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.username', 'ahmad9999');

        $this->assertDatabaseHas('users', ['username' => 'ahmad9999', 'role' => 'staff']);

        // 2. Generate Tenant
        $tenantResponse = $this->actingAs($owner)->postJson(route('users.generate-tenant'), [
            'name' => 'Siska Nirmala',
            'room_id' => $room->id,
            'phone_number' => '085711223344',
            'entry_date' => '2026-09-01',
            'emergency_contact_name' => 'Ibu Rahma',
            'emergency_contact_phone' => '0812998877',
        ]);

        $tenantResponse->assertStatus(201)
            ->assertJsonPath('status', 'success');

        $this->assertEquals(RoomStatus::OCCUPIED, $room->fresh()->status);
    }

    public function test_staff_cannot_create_bills_or_tenants(): void
    {
        $prop = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $staff = User::factory()->staff($prop->id)->create(['username' => 'staff_forbidden']);

        // Staff coba buat tagihan sewa (dilarang - hanya owner)
        $this->actingAs($staff)->postJson(route('payments.store'), [
            'tenant_id' => 1,
            'billing_period' => 'Oktober 2026',
            'amount' => 1500000,
        ])->assertStatus(403);

        // Staff coba generate tenant (dilarang - hanya owner)
        $this->actingAs($staff)->postJson(route('users.generate-tenant'), [
            'name' => 'Hacker Tenant',
            'room_id' => 1,
            'entry_date' => '2026-09-01',
        ])->assertStatus(403);
    }

    public function test_payment_verification_data_scoping(): void
    {
        $propA = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $propB = Property::create(['name' => 'Anggrek', 'slug' => 'anggrek', 'address' => 'Jl. B']);

        $staffA = User::factory()->staff($propA->id)->create(['username' => 'staff_pay_a']);
        $tenantA = User::factory()->tenant($propA->id)->create(['username' => 'tenant_pay_a']);
        $tenantB = User::factory()->tenant($propB->id)->create(['username' => 'tenant_pay_b']);

        $paymentA = Payment::create([
            'invoice_number' => 'INV-A01',
            'tenant_id' => $tenantA->id,
            'property_id' => $propA->id,
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::PENDING_VERIFICATION,
        ]);

        $paymentB = Payment::create([
            'invoice_number' => 'INV-B01',
            'tenant_id' => $tenantB->id,
            'property_id' => $propB->id,
            'billing_period' => 'September 2026',
            'amount' => 1800000,
            'status' => PaymentStatus::PENDING_VERIFICATION,
        ]);

        // Staf A verifikasi pembayaran di cabang A -> Berhasil
        $response = $this->actingAs($staffA)->postJson(route('payments.verify', $paymentA));
        $response->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertEquals(PaymentStatus::PAID, $paymentA->fresh()->status);
        $this->assertEquals($staffA->id, $paymentA->fresh()->verified_by);

        // Staf A verifikasi pembayaran di cabang B -> 403 Forbidden
        $this->actingAs($staffA)->postJson(route('payments.verify', $paymentB))
            ->assertStatus(403);
    }

    public function test_security_log_and_complaint_handling(): void
    {
        $prop = Property::create(['name' => 'Melati', 'slug' => 'melati', 'address' => 'Jl. A']);
        $room = Room::create([
            'property_id' => $prop->id,
            'room_number' => 'A301',
            'floor' => 3,
            'price' => 1500000,
            'status' => RoomStatus::OCCUPIED,
        ]);

        $staff = User::factory()->staff($prop->id)->create(['username' => 'staff_act']);
        $tenant = User::factory()->tenant($prop->id)->create(['username' => 'tenant_act']);

        // 1. Security Log Approval
        $log = SecurityLog::create([
            'property_id' => $prop->id,
            'tenant_id' => $tenant->id,
            'type' => SecurityLogType::LATE_RETURN,
            'date' => '2026-09-06',
            'planned_time' => '23:30',
            'notes' => 'Belajar kelompok',
            'status' => SecurityLogStatus::PENDING,
        ]);

        $this->actingAs($staff)->postJson(route('security-logs.approve', $log))
            ->assertOk()
            ->assertJsonPath('status', 'success');

        $this->assertEquals(SecurityLogStatus::APPROVED, $log->fresh()->status);

        // 2. Complaint Ticket Status Update
        $ticket = ComplaintTicket::create([
            'ticket_number' => 'TKT-999',
            'property_id' => $prop->id,
            'room_id' => $room->id,
            'tenant_id' => $tenant->id,
            'title' => 'Lampu Mati',
            'description' => 'Bohlam putus',
            'status' => ComplaintStatus::PENDING,
        ]);

        $this->actingAs($staff)->patchJson(route('complaints.update-status', $ticket), [
            'status' => ComplaintStatus::RESOLVED->value,
            'resolution_notes' => 'Bohlam LED diganti baru',
        ])->assertOk();

        $this->assertEquals(ComplaintStatus::RESOLVED, $ticket->fresh()->status);
        $this->assertNotNull($ticket->fresh()->resolved_at);
    }
}
