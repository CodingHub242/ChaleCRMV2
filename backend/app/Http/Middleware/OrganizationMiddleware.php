<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class OrganizationMiddleware
{
    /**
     * Handle an incoming request.
     * Ensures the user belongs to an organization and sets the organization context.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // If no user is authenticated, let auth middleware handle it
        if (!$user) {
            return $next($request);
        }

        // If user doesn't have an organization, they need to create or join one
        if (!$user->organization_id) {
            // Allow access to organization creation endpoints
            $allowedRoutes = [
                'api/organizations',
                'api/organization',
            ];
            
            $currentRoute = $request->path();
            $isAllowedRoute = false;
            
            foreach ($allowedRoutes as $route) {
                if (str_starts_with($currentRoute, $route)) {
                    $isAllowedRoute = true;
                    break;
                }
            }

            if (!$isAllowedRoute) {
                return response()->json([
                    'success' => false,
                    'message' => 'You need to set up an organization first'
                ], 403);
            }
        }

        // Set the organization ID in the request for easy access in controllers
        if ($user->organization_id) {
            $request->merge(['organization_id' => $user->organization_id]);
            $request->attributes->set('organization_id', $user->organization_id);
        }

        return $next($request);
    }
}
