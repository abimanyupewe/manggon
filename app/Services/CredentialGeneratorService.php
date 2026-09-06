<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Str;

class CredentialGeneratorService
{
    /**
     * Dictionary kata ramah (hewan/buah/bunga) dalam bahasa Indonesia untuk username tenant.
     *
     * @var list<string>
     */
    protected static array $dictionary = [
        'panda',
        'ceri',
        'mangga',
        'melati',
        'anggrek',
        'kelinci',
        'kucing',
        'koala',
        'apel',
        'jeruk',
        'stroberi',
        'lavender',
        'mawar',
        'tulip',
        'teratai',
        'dahlia',
        'flaminggo',
        'rusa',
        'lumba',
    ];

    /**
     * Generate username untuk Staf.
     * Format: nama depan + 4 digit terakhir nomor telepon (lowercase).
     * Contoh: "Budi Santoso", "081234567890" -> "budi7890".
     */
    public function generateStaffUsername(string $name, string $phoneNumber): string
    {
        // 1. Ekstrak nama depan dan bersihkan hanya karakter huruf
        $words = preg_split('/\s+/', trim($name));
        $firstName = $words[0] ?? 'staf';
        $cleanFirstName = strtolower(preg_replace('/[^a-zA-Z]/', '', $firstName));

        if (empty($cleanFirstName)) {
            $cleanFirstName = 'staf';
        }

        // 2. Ekstrak hanya digit dari nomor telepon dan ambil 4 digit terakhir
        $cleanPhone = preg_replace('/[^0-9]/', '', $phoneNumber);
        $phoneSuffix = strlen($cleanPhone) >= 4 ? substr($cleanPhone, -4) : str_pad($cleanPhone, 4, '0', STR_PAD_LEFT);

        $baseUsername = "{$cleanFirstName}{$phoneSuffix}";

        // 3. Pastikan unik di tabel users
        return $this->ensureUniqueUsername($baseUsername);
    }

    /**
     * Generate username untuk Tenant (Anak Kos Putri).
     * Format: [dictionary_hewan_buah]_[nomor_kamar] (lowercase).
     * Contoh: Kamar "A01" -> "panda_a01" atau "ceri_a01".
     */
    public function generateTenantUsername(string $roomNumber): string
    {
        // Bersihkan format nomor kamar (contoh: "A-01" -> "a01", "Kamar 02" -> "kamar02")
        $cleanRoom = strtolower(preg_replace('/[^a-zA-Z0-9]/', '', $roomNumber));
        if (empty($cleanRoom)) {
            $cleanRoom = 'room';
        }

        // Coba acak kata dari kamus yang belum dipakai untuk kamar tersebut
        $shuffledWords = self::$dictionary;
        shuffle($shuffledWords);

        foreach ($shuffledWords as $word) {
            $candidate = "{$word}_{$cleanRoom}";
            if (! User::where('username', $candidate)->exists()) {
                return $candidate;
            }
        }

        // Jika semua kombinasi kamus sudah dipakai, buat dengan suffix unik
        $base = "{$shuffledWords[0]}_{$cleanRoom}";
        return $this->ensureUniqueUsername($base);
    }

    /**
     * Generate kata sandi acak sementara yang aman.
     */
    public function generateTemporaryPassword(int $length = 8): string
    {
        return Str::password($length, true, true, false);
    }

    /**
     * Jamin keunikan username di tabel users.
     */
    protected function ensureUniqueUsername(string $baseUsername): string
    {
        $baseUsername = strtolower($baseUsername);
        $username = $baseUsername;
        $counter = 2;

        while (User::where('username', $username)->exists()) {
            $username = "{$baseUsername}_{$counter}";
            $counter++;
        }

        return $username;
    }
}
