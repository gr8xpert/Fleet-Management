<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Admin has access to everything
        if ($user->role === 'admin') {
            return $next($request);
        }

        // Check if user's role is in the allowed roles
        if (in_array($user->role, $roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'You do not have permission to perform this action.',
            'required_role' => $roles,
            'your_role' => $user->role,
        ], 403);
    }
}
