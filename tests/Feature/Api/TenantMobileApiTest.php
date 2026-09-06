<?php

namespace Tests\Feature\Api;

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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class TenantMobileApiTest extends TestCase
{
    use RefreshDatabase;

    private Property $property;
    private Room $room;
    private User $tenant;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();

        $this->property = Property::create([
            'name' => 'Manggon Melati Residence',
            'slug' => 'melati-residence',
            'address' => 'Jl. Melati No. 12',
            'phone_number' => '081122334455',
            'facilities' => ['WiFi', 'CCTV 24 Jam', 'Dapur Bersama'],
        ]);

        $this->room = Room::create([
            'property_id' => $this->property->id,
            'room_number' => '101',
            'price' => 1500000,
            'status' => RoomStatus::OCCUPIED,
            'floor' => 1,
        ]);

        $this->tenant = User::factory()->tenant()->create([
            'name' => 'Anisa Rahmawati',
            'username' => 'bunga101',
            'email' => 'anisa@manggon.test',
            'password' => Hash::make('Secret123!'),
            'must_change_password' => false,
            'is_active' => true,
            'property_id' => $this->property->id,
        ]);

        TenantProfile::create([
            'user_id' => $this->tenant->id,
            'room_id' => $this->room->id,
            'entry_date' => now()->subMonths(2),
            'emergency_contact_name' => 'Ibu Rahmawati',
            'emergency_contact_phone' => '081299998888',
            'emergency_contact_relation' => 'Ibu Kandung',
        ]);
    }

    public function test_tenant_can_login_via_sanctum_and_get_token(): void
    {
        $response = $this->postJson(route('api.v1.auth.login'), [
            'email' => 'bunga101',
            'password' => 'Secret123!',
            'device_name' => 'Flutter Android Emulator',
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'message',
                'token',
                'token_type',
                'user' => [
                    'id',
                    'name',
                    'username',
                    'email',
                    'property',
                    'room',
                    'profile',
                ],
            ]);

        $this->assertNotEmpty($response->json('token'));
    }

    public function test_owner_and_staff_cannot_login_via_mobile_api(): void
    {
        $owner = User::factory()->owner()->create([
            'username' => 'owner_boss',
            'password' => Hash::make('Secret123!'),
        ]);

        $response = $this->postJson(route('api.v1.auth.login'), [
            'email' => 'owner_boss',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Aplikasi mobile ini dikhususkan untuk Anak Kos Putri. Pemilik dan staf dipersilakan mengakses Web Dashboard.');
    }

    public function test_inactive_tenant_cannot_login(): void
    {
        $this->tenant->update(['is_active' => false]);

        $response = $this->postJson(route('api.v1.auth.login'), [
            'email' => 'bunga101',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('message', 'Akun Anda sedang dinonaktifkan. Silakan hubungi pemilik kos.');
    }

    public function test_first_login_tenant_receives_403_must_change_password_with_temp_token(): void
    {
        $this->tenant->update(['must_change_password' => true]);

        $response = $this->postJson(route('api.v1.auth.login'), [
            'email' => 'bunga101',
            'password' => 'Secret123!',
        ]);

        $response->assertStatus(403)
            ->assertJsonPath('status', 'error')
            ->assertJsonPath('code', 'MUST_CHANGE_PASSWORD')
            ->assertJsonStructure(['token', 'token_type', 'user']);
    }

    public function test_tenant_blocked_by_password_change_middleware_on_operational_endpoints(): void
    {
        $this->tenant->update(['must_change_password' => true]);
        $token = $this->tenant->createToken('temp-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.profile.show'));

        $response->assertStatus(403)
            ->assertJsonPath('code', 'MUST_CHANGE_PASSWORD');
    }

    public function test_tenant_can_change_password_via_api_and_unlock_access(): void
    {
        $this->tenant->update(['must_change_password' => true]);
        $tempToken = $this->tenant->createToken('temp-token')->plainTextToken;

        // Change password using temp token
        $response = $this->withHeader('Authorization', 'Bearer ' . $tempToken)
            ->postJson(route('api.v1.auth.change-password'), [
                'password' => 'NewPassword123#',
                'password_confirmation' => 'NewPassword123#',
            ]);

        $response->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Kata sandi berhasil diperbarui.')
            ->assertJsonStructure(['token', 'user']);

        $this->tenant->refresh();
        $this->assertFalse($this->tenant->must_change_password);
        $this->assertTrue(Hash::check('NewPassword123#', $this->tenant->password));

        // Akses fitur operasional dengan fresh token
        $newToken = $response->json('token');
        $profileResponse = $this->withHeader('Authorization', 'Bearer ' . $newToken)
            ->getJson(route('api.v1.tenant.profile.show'));

        $profileResponse->assertOk()
            ->assertJsonPath('data.username', 'bunga101');
    }

    public function test_tenant_can_view_and_update_profile(): void
    {
        $token = $this->tenant->createToken('test-app')->plainTextToken;

        $getResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.profile.show'));

        $getResponse->assertOk()
            ->assertJsonPath('data.room.room_number', '101')
            ->assertJsonPath('data.property.name', 'Manggon Melati Residence');

        $updateResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->putJson(route('api.v1.tenant.profile.update'), [
                'phone_number' => '081234567890',
                'emergency_contact_name' => 'Kakak Putri',
                'emergency_contact_phone' => '081987654321',
                'emergency_contact_relation' => 'Kakak Kandung',
            ]);

        $updateResponse->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.phone_number', '081234567890')
            ->assertJsonPath('data.profile.emergency_contact_name', 'Kakak Putri');

        $this->assertDatabaseHas('users', ['id' => $this->tenant->id, 'phone_number' => '081234567890']);
        $this->assertDatabaseHas('tenant_profiles', ['user_id' => $this->tenant->id, 'emergency_contact_name' => 'Kakak Putri']);
    }

    public function test_tenant_can_view_bills_and_upload_payment_proof(): void
    {
        Storage::fake('public');

        $payment = Payment::create([
            'property_id' => $this->property->id,
            'room_id' => $this->room->id,
            'tenant_id' => $this->tenant->id,
            'invoice_number' => 'INV-202609-TEST',
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::UNPAID,
        ]);

        $token = $this->tenant->createToken('test-app')->plainTextToken;

        // 1. List bills
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.bills.index'));

        $listResponse->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.invoice_number', 'INV-202609-TEST');

        // 2. Show bill detail
        $showResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.bills.show', $payment->id));

        $showResponse->assertOk()
            ->assertJsonPath('data.amount', 1500000);

        // 3. Upload proof
        $file = UploadedFile::fake()->image('transfer_receipt.jpg');
        $uploadResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.tenant.bills.upload-proof', $payment->id), [
                'proof_image' => $file,
                'notes' => 'Transfer via BCA Mobile a.n. Anisa',
            ]);

        $uploadResponse->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.status', PaymentStatus::PENDING_VERIFICATION->value);

        $payment->refresh();
        $this->assertEquals(PaymentStatus::PENDING_VERIFICATION, $payment->status);
        $this->assertNotNull($payment->proof_image);
        $this->assertNotNull($payment->payment_date);
    }

    public function test_tenant_cannot_upload_proof_for_other_tenant_bill(): void
    {
        $otherTenant = User::factory()->tenant()->create();
        $otherPayment = Payment::create([
            'property_id' => $this->property->id,
            'room_id' => $this->room->id,
            'tenant_id' => $otherTenant->id,
            'invoice_number' => 'INV-OTHER-001',
            'billing_period' => 'September 2026',
            'amount' => 1500000,
            'status' => PaymentStatus::UNPAID,
        ]);

        $token = $this->tenant->createToken('test-app')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.tenant.bills.upload-proof', $otherPayment->id), [
                'proof_image' => 'https://via.placeholder.com/150',
            ]);

        $response->assertStatus(403);
    }

    public function test_tenant_can_submit_and_view_security_logs(): void
    {
        $token = $this->tenant->createToken('test-app')->plainTextToken;

        // Submit late return permission
        $storeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.tenant.security-logs.store'), [
                'type' => SecurityLogType::LATE_RETURN->value,
                'date' => now()->toDateString(),
                'planned_time' => '23:30',
                'notes' => 'Tugas kuliah praktikum di kampus.',
            ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.type', SecurityLogType::LATE_RETURN->value)
            ->assertJsonPath('data.status', SecurityLogStatus::PENDING->value);

        // List security logs
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.security-logs.index'));

        $listResponse->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.planned_time', '23:30');
    }

    public function test_tenant_can_submit_and_view_complaints(): void
    {
        Storage::fake('public');
        $token = $this->tenant->createToken('test-app')->plainTextToken;

        $file = UploadedFile::fake()->image('broken_ac.jpg');

        $storeResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.tenant.complaints.store'), [
                'title' => 'AC Kamar Tidak Dingin',
                'description' => 'Hanya keluar hembusan angin biasa tanpa hawa sejuk.',
                'photo_evidence' => $file,
            ]);

        $storeResponse->assertStatus(201)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.room_number', '101')
            ->assertJsonPath('data.status', ComplaintStatus::PENDING->value);

        $this->assertStringStartsWith('TKT-', $storeResponse->json('data.ticket_number'));

        // List complaints
        $listResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->getJson(route('api.v1.tenant.complaints.index'));

        $listResponse->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'AC Kamar Tidak Dingin');
    }

    public function test_tenant_can_logout_and_revoke_token(): void
    {
        $token = $this->tenant->createToken('test-app')->plainTextToken;

        $logoutResponse = $this->withHeader('Authorization', 'Bearer ' . $token)
            ->postJson(route('api.v1.auth.logout'));

        $logoutResponse->assertOk()
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Sesi mobile berhasil diakhiri.');

        $this->assertCount(0, $this->tenant->fresh()->tokens);
    }
}
