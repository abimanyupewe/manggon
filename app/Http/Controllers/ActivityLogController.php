<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Tampilkan riwayat audit trail sistem (Owner only).
     */
    public function index(Request $request): JsonResponse|Response
    {
        if (! $request->user()->isOwner()) {
            abort(403, 'Hanya Pemilik yang berhak mengakses log audit trail sistem.');
        }

        $query = ActivityLog::with(['user', 'property']);

        if ($request->filled('property_id')) {
            $query->where('property_id', $request->input('property_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', $request->input('action'));
        }

        $logs = $query->latest('created_at')->paginate(20);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $logs,
            ]);
        }

        return Inertia::render('audit/index', [
            'logs' => $logs,
        ]);
    }
}
