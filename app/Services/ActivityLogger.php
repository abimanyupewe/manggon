<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class ActivityLogger
{
    /**
     * Catat log aktivitas ke dalam tabel activity_logs.
     *
     * @param string $action Nama aksi (contoh: 'verify_payment', 'create_bill', 'approve_security_log')
     * @param string $description Penjelasan ringkas yang mudah dibaca
     * @param Model|null $subject Entitas model terkait (polymorphic)
     * @param array<string, mixed>|null $properties Snapshot atribut sebelum/sesudah atau payload aksi
     * @param int|null $propertyId ID cabang terkait (jika null, diambil dari property_id user atau model)
     * @param int|null $userId ID user pelaku aksi (jika null, diambil dari auth()->id())
     */
    public static function log(
        string $action,
        string $description,
        ?Model $subject = null,
        ?array $properties = null,
        ?int $propertyId = null,
        ?int $userId = null
    ): ActivityLog {
        $currentUser = Auth::user();
        $actorId = $userId ?? $currentUser?->id;

        // Tentukan property_id jika tidak diberikan secara eksplisit
        if ($propertyId === null) {
            if ($subject && isset($subject->property_id)) {
                $propertyId = $subject->property_id;
            } elseif ($currentUser && $currentUser->property_id) {
                $propertyId = $currentUser->property_id;
            }
        }

        return ActivityLog::create([
            'user_id' => $actorId,
            'property_id' => $propertyId,
            'action' => $action,
            'description' => $description,
            'subject_type' => $subject ? get_class($subject) : null,
            'subject_id' => $subject?->getKey(),
            'properties' => $properties,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'created_at' => now(),
        ]);
    }
}
