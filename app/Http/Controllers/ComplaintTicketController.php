<?php

namespace App\Http\Controllers;

use App\Enums\ComplaintStatus;
use App\Models\ComplaintTicket;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Enum;
use Inertia\Inertia;
use Inertia\Response;

class ComplaintTicketController extends Controller
{
    /**
     * Tampilkan daftar tiket komplain fasilitas kamar.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();
        $query = ComplaintTicket::with(['room', 'tenant.tenantProfile', 'property', 'handler']);

        if ($user->isStaff()) {
            $query->where('property_id', $user->property_id);
        } elseif ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $tickets = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $tickets,
            ]);
        }

        return Inertia::render('complaints/index', [
            'complaints' => $tickets,
        ]);
    }

    /**
     * Perbarui status pengerjaan tiket keluhan (Staf cabangnya atau Owner).
     */
    public function updateStatus(Request $request, ComplaintTicket $complaintTicket): JsonResponse|RedirectResponse
    {
        $user = $request->user();

        if ($user->isStaff() && $user->property_id !== $complaintTicket->property_id) {
            abort(403, 'Anda tidak memiliki wewenang menangani komplain di cabang lain.');
        }

        $validated = $request->validate([
            'status' => ['required', new Enum(ComplaintStatus::class)],
            'resolution_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $updateData = [
            'status' => $validated['status'],
            'handled_by' => $user->id,
            'resolution_notes' => $validated['resolution_notes'] ?? $complaintTicket->resolution_notes,
        ];

        if ($validated['status'] === ComplaintStatus::RESOLVED->value) {
            $updateData['resolved_at'] = now();
        }

        $complaintTicket->update($updateData);

        ActivityLogger::log(
            action: 'update_complaint_status',
            description: "Staf/Owner ({$user->name}) mengubah status tiket {$complaintTicket->ticket_number} menjadi '{$validated['status']}'.",
            subject: $complaintTicket
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Status tiket keluhan berhasil diperbarui.',
                'data' => $complaintTicket,
            ]);
        }

        return redirect()->back()->with('success', 'Status tiket keluhan berhasil diperbarui.');
    }
}
