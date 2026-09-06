<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Izinkan akses ke rute khusus penggantian password dan logout
            if ($request->routeIs('password.force-change*') || $request->routeIs('logout') || $request->is('api/v1/auth/*')) {
                return $next($request);
            }

            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'status' => 'error',
                    'code' => 'MUST_CHANGE_PASSWORD',
                    'message' => 'Anda wajib memperbarui kata sandi akun sebelum mengakses fitur lainnya.',
                ], 403);
            }

            return redirect()->route('password.force-change');
        }

        return $next($request);
    }
}
