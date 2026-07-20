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
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthenticated.'
            ], Response::HTTP_UNAUTHORIZED);
        }

        // Super Admin always has full access
        if ($user->hasRole('super_admin')) {
            return $next($request);
        }

        // Check if user has any of the required roles
        if ($user->role && in_array($user->role->name, $roles)) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized action.'
        ], Response::HTTP_FORBIDDEN);
    }
}
