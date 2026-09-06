<?php

namespace App\Http\Controllers;

use App\Enums\ComplaintStatus;
use App\Enums\PaymentStatus;
use App\Enums\RoomStatus;
use App\Enums\SecurityLogStatus;
use App\Models\ActivityLog;
use App\Models\ComplaintTicket;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Room;
use App\Models\SecurityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Tampilkan antarmuka dashboard terpadu berdasarkan peran pengguna.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();

        if ($user->isOwner()) {
            return $this->ownerDashboard($request);
        }

        if ($user->isStaff()) {
            return $this->staffDashboard($request);
        }

        return $this->tenantDashboard($request);
    }

    /**
     * Dashboard eksekutif untuk Pemilik (Multi-Cabang & Finansial).
     */
    private function ownerDashboard(Request $request): JsonResponse|Response
    {
        $totalProperties = Property::count();
        $totalRooms = Room::count();
        $occupiedRooms = Room::where('status', RoomStatus::OCCUPIED)->count();
        $emptyRooms = Room::where('status', RoomStatus::EMPTY)->count();
        $maintenanceRooms = Room::where('status', RoomStatus::MAINTENANCE)->count();
        $occupancyRate = $totalRooms > 0 ? round(($occupiedRooms / $totalRooms) * 100, 1) : 0;

        $monthlyRevenue = Payment::where('status', PaymentStatus::PAID)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->sum('amount');

        $pendingPaymentsCount = Payment::where('status', PaymentStatus::PENDING_VERIFICATION)->count();
        $unpaidPaymentsCount = Payment::where('status', PaymentStatus::UNPAID)->count();
        $pendingSecurityLogsCount = SecurityLog::where('status', SecurityLogStatus::PENDING)->count();
        $openComplaintsCount = ComplaintTicket::whereIn('status', [ComplaintStatus::PENDING, ComplaintStatus::IN_PROGRESS])->count();

        $properties = Property::withCount(['rooms', 'staff', 'rooms as empty_rooms_count' => function ($query) {
            $query->where('status', RoomStatus::EMPTY);
        }])->get();

        $recentActivities = ActivityLog::with('user')
            ->latest()
            ->limit(6)
            ->get();

        $data = [
            'role' => 'owner',
            'stats' => [
                'total_properties' => $totalProperties,
                'total_rooms' => $totalRooms,
                'occupied_rooms' => $occupiedRooms,
                'empty_rooms' => $emptyRooms,
                'maintenance_rooms' => $maintenanceRooms,
                'occupancy_rate' => $occupancyRate,
                'monthly_revenue' => (float) $monthlyRevenue,
                'pending_payments_count' => $pendingPaymentsCount,
                'unpaid_payments_count' => $unpaidPaymentsCount,
                'pending_security_logs_count' => $pendingSecurityLogsCount,
                'open_complaints_count' => $openComplaintsCount,
            ],
            'properties' => $properties,
            'recent_activities' => $recentActivities,
        ];

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        return Inertia::render('dashboard', $data);
    }

    /**
     * Dashboard operasional harian untuk Staf Penjaga ("Inbox-Zero UI").
     */
    private function staffDashboard(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $property = Property::find($user->property_id);

        $propertyId = $user->property_id;

        $totalRooms = Room::where('property_id', $propertyId)->count();
        $occupiedRooms = Room::where('property_id', $propertyId)->where('status', RoomStatus::OCCUPIED)->count();
        $emptyRooms = Room::where('property_id', $propertyId)->where('status', RoomStatus::EMPTY)->count();
        $maintenanceRooms = Room::where('property_id', $propertyId)->where('status', RoomStatus::MAINTENANCE)->count();

        // Inbox-Zero Items yang memerlukan aksi segera oleh staf
        $pendingPayments = Payment::with(['tenant', 'room'])
            ->where('property_id', $propertyId)
            ->where('status', PaymentStatus::PENDING_VERIFICATION)
            ->latest()
            ->limit(5)
            ->get();

        $pendingSecurityLogs = SecurityLog::with('tenant')
            ->where('property_id', $propertyId)
            ->where('status', SecurityLogStatus::PENDING)
            ->latest()
            ->limit(5)
            ->get();

        $activeComplaints = ComplaintTicket::with(['room', 'tenant'])
            ->where('property_id', $propertyId)
            ->whereIn('status', [ComplaintStatus::PENDING, ComplaintStatus::IN_PROGRESS])
            ->latest()
            ->limit(5)
            ->get();

        $data = [
            'role' => 'staff',
            'property' => $property,
            'stats' => [
                'total_rooms' => $totalRooms,
                'occupied_rooms' => $occupiedRooms,
                'empty_rooms' => $emptyRooms,
                'maintenance_rooms' => $maintenanceRooms,
                'pending_verifications_count' => $pendingPayments->count(),
                'pending_security_count' => $pendingSecurityLogs->count(),
                'active_complaints_count' => $activeComplaints->count(),
            ],
            'action_center' => [
                'pending_payments' => $pendingPayments,
                'pending_security_logs' => $pendingSecurityLogs,
                'active_complaints' => $activeComplaints,
            ],
        ];

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        return Inertia::render('dashboard', $data);
    }

    /**
     * Tampilan profil & hunian ringkas jika anak kos mengakses web browser.
     */
    private function tenantDashboard(Request $request): JsonResponse|Response
    {
        $user = $request->user()->load(['tenantProfile.room.property', 'property']);

        $pendingBills = Payment::where('tenant_id', $user->id)
            ->whereIn('status', [PaymentStatus::UNPAID, PaymentStatus::PENDING_VERIFICATION])
            ->latest()
            ->get();

        $recentLogs = SecurityLog::where('tenant_id', $user->id)
            ->latest()
            ->limit(3)
            ->get();

        $data = [
            'role' => 'tenant',
            'tenant' => $user,
            'pending_bills' => $pendingBills,
            'recent_logs' => $recentLogs,
        ];

        if ($request->wantsJson()) {
            return response()->json(['status' => 'success', 'data' => $data]);
        }

        return Inertia::render('dashboard', $data);
    }
}
