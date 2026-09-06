<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePropertyRequest;
use App\Models\Property;
use App\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PropertyController extends Controller
{
    /**
     * Tampilkan daftar cabang properti kos.
     */
    public function index(Request $request): JsonResponse|Response
    {
        $user = $request->user();

        $query = Property::withCount(['rooms', 'tenants', 'staff']);

        // Data scoping: Staf hanya melihat cabangnya sendiri
        if ($user->isStaff()) {
            $query->where('id', $user->property_id);
        }

        $properties = $query->latest()->get();

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $properties,
            ]);
        }

        return Inertia::render('properties/index', [
            'properties' => $properties,
        ]);
    }

    /**
     * Tampilkan detail cabang spesifik beserta daftar kamarnya.
     */
    public function show(Request $request, Property $property): JsonResponse|Response
    {
        if ($request->user()->isStaff() && $request->user()->property_id !== $property->id) {
            abort(403, 'Anda tidak memiliki akses ke cabang ini.');
        }

        $property->load(['rooms' => function ($q) {
            $q->orderBy('floor')->orderBy('room_number');
        }, 'staff']);

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'data' => $property,
            ]);
        }

        return Inertia::render('properties/show', [
            'property' => $property,
        ]);
    }

    /**
     * Tambah cabang baru (Owner only).
     */
    public function store(StorePropertyRequest $request): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();
        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);

        $property = Property::create($validated);

        ActivityLogger::log(
            action: 'create_property',
            description: "Pemilik membuat cabang kos baru: {$property->name}.",
            subject: $property
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Cabang properti berhasil ditambahkan.',
                'data' => $property,
            ], 201);
        }

        return redirect()->route('properties.index')->with('success', 'Cabang properti berhasil ditambahkan.');
    }

    /**
     * Perbarui data cabang kos (Owner only).
     */
    public function update(StorePropertyRequest $request, Property $property): JsonResponse|RedirectResponse
    {
        $validated = $request->validated();
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $property->update($validated);

        ActivityLogger::log(
            action: 'update_property',
            description: "Pemilik memperbarui data cabang: {$property->name}.",
            subject: $property
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => 'Data cabang berhasil diperbarui.',
                'data' => $property,
            ]);
        }

        return redirect()->route('properties.show', $property)->with('success', 'Data cabang berhasil diperbarui.');
    }

    /**
     * Hapus cabang kos (Owner only).
     */
    public function destroy(Request $request, Property $property): JsonResponse|RedirectResponse
    {
        if (! $request->user()->isOwner()) {
            abort(403, 'Hanya Pemilik yang berhak menghapus cabang kos.');
        }

        $name = $property->name;
        $property->delete();

        ActivityLogger::log(
            action: 'delete_property',
            description: "Pemilik menghapus cabang kos: {$name}."
        );

        if ($request->wantsJson()) {
            return response()->json([
                'status' => 'success',
                'message' => "Cabang kos {$name} berhasil dihapus.",
            ]);
        }

        return redirect()->route('properties.index')->with('success', "Cabang kos {$name} berhasil dihapus.");
    }
}
