<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ForcePasswordChangeController extends Controller
{
    /**
     * Tampilkan formulir perubahan kata sandi perdana.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->must_change_password) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/force-change-password', [
            'username' => $user->username,
            'name' => $user->name,
        ]);
    }

    /**
     * Proses penyimpanan kata sandi baru.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ]);

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'must_change_password' => false,
        ])->save();

        ActivityLogger::log(
            action: 'force_password_change',
            description: "Pengguna {$user->name} ({$user->username}) berhasil memperbarui kata sandi akun perdana.",
            subject: $user
        );

        return redirect()->route('dashboard')->with('status', 'Kata sandi berhasil diperbarui. Selamat datang di Manggon!');
    }
}
