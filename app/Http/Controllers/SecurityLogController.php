<?php

namespace App\Http\Controllers;

use App\Enums\SecurityLogStatus;
use App\Models\SecurityLog;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SecurityLogController extends Controller
{
    /**
     * Tampilkan daftar izin pulang malam & buku tamu.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $query = SecurityLog::with(['tenant.tenantProfile.room', 'property', 'approver']);

        if ($user->isStaff()) {
            $query->where('property_id', $user->property_id);
        } elseif ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $logs = $query->latest('date')->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $logs,
            ]);
        }

        return Inertia::render('security/index', [
            'securityLogs' => $logs,
        ]);
    }

    /**
     * Setujui izin pulang malam atau tamu menginap (Staf cabangnya atau Owner).
     */
    public function approve(Request $request, SecurityLog $securityLog): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $securityLog->property_id) {
            abort(403, 'Anda tidak memiliki wewenang menyetujui izin keamanan di cabang lain.');
        }

        $securityLog->update([
            'status' => SecurityLogStatus::APPROVED,
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        ActivityLogger::log(
            action: 'approve_security_log',
            description: "Staf/Owner ({$user->name}) menyetujui {$securityLog->type->label()} untuk {$securityLog->tenant->name}.",
            subject: $securityLog
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Permohonan izin keamanan berhasil disetujui.',
                'data' => $securityLog,
            ]);
        }

        return redirect()->back()->with('success', 'Permohonan izin keamanan berhasil disetujui.');
    }

    /**
     * Tolak izin pulang malam atau tamu menginap (Staf cabangnya atau Owner).
     */
    public function reject(Request $request, SecurityLog $securityLog): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $securityLog->property_id) {
            abort(403, 'Anda tidak memiliki wewenang menolak izin keamanan di cabang lain.');
        }

        $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $securityLog->update([
            'status' => SecurityLogStatus::REJECTED,
            'rejection_reason' => $request->input('rejection_reason'),
            'approved_by' => $user->id,
            'approved_at' => now(),
        ]);

        ActivityLogger::log(
            action: 'reject_security_log',
            description: "Menolak {$securityLog->type->label()} untuk {$securityLog->tenant->name}. Alasan: {$request->input('rejection_reason')}",
            subject: $securityLog
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Permohonan izin keamanan ditolak.',
                'data' => $securityLog,
            ]);
        }

        return redirect()->back()->with('success', 'Permohonan izin keamanan ditolak.');
    }
}
