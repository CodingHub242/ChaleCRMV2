<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\ZohoUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OrganizationController extends Controller
{
    /**
     * Get current user's organization.
     */
    public function current()
    {
        $user = auth()->user();
        
        if (!$user || !$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        $organization = Organization::with('users')->find($user->organization_id);

        return response()->json([
            'success' => true,
            'data' => $organization
        ]);
    }

    /**
     * Create a new organization and set the current user as admin.
     */
    public function store(Request $request)
    {
        $user = auth()->user();

        // Check if user already belongs to an organization
        if ($user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to an organization'
            ], 400);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
        ]);

        // Generate unique slug
        $validated['slug'] = Organization::generateSlug($validated['name']);

        $organization = Organization::create($validated);

        // Update user to belong to this organization with admin role
        $user->update([
            'organization_id' => $organization->id,
            'role' => ZohoUser::ROLE_ADMIN
        ]);
        //make sure validated['website'] is also returned in the response
        $organization->with('users');
        $organization->website = $validated['website'];

        return response()->json([
            'success' => true,
            'data' => $organization->with('users'),
            'message' => 'Organization created successfully'
        ], 201);
    }

    /**
     * Update the current user's organization.
     */
    public function update(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        // Only admin can update organization details
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can update organization details'
            ], 403);
        }

        $organization = Organization::findOrFail($user->organization_id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'website' => 'nullable|string|max:255',
        ]);

        $organization->update($validated);

        return response()->json([
            'success' => true,
            'data' => $organization,
            'message' => 'Organization updated successfully'
        ]);
    }

    /**
     * Get all users in the current user's organization.
     */
    public function users()
    {
        $user = auth()->user();
        
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        $users = ZohoUser::where('organization_id', $user->organization_id)
            ->select('id', 'name', 'email', 'role', 'avatar', 'phone', 'created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Invite a new user to the organization.
     */
    public function inviteUser(Request $request)
    {
        $user = auth()->user();
        
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        // Only admins and managers can invite users
        if (!$user->isAdminOrManager()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins and managers can invite users'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:50',
            'role' => 'sometimes|in:admin,user,manager',
        ]);

        // Generate a random password (in production, you'd send an invitation email)
        $password = substr(md5(uniqid(rand(), true)), 0, 8);

         //sms alert
        $curl = curl_init();

        curl_setopt_array($curl, [
            CURLOPT_URL => 'https://sms.arkesel.com/api/v2/sms/send',
            CURLOPT_HTTPHEADER => ['api-key: ZFRDQVFUVlZyQ0t1c3NsRllNc1U'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'POST',
            CURLOPT_POSTFIELDS => http_build_query([
                'sender' => 'CRM',
                'message' => "Hello, {$validated['name']}! You have been invited to join our organization on bolt solutions. Your temporary password is: {$password}. Please log in to your account and change your password once you have logged in.",
                'recipients' => [$validated['phone']],
                // When sending SMS to Nigerian recipients, specify the use_case field
                // 'use_case' => 'transactional'
            ]),
        ]);

        $response = curl_exec($curl);
        curl_close($curl);

        $newUser = ZohoUser::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($password),
            'phone' => $validated['phone'] ?? null,
            'organization_id' => $user->organization_id,
            'role' => $validated['role'] ?? ZohoUser::ROLE_USER,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $newUser->id,
                'name' => $newUser->name,
                'email' => $newUser->email,
                'role' => $newUser->role,
                'temporary_password' => $password // In production, send via email
            ],
            'message' => 'User invited successfully'
        ], 201);
    }

    /**
     * Update a user's role within the organization.
     */
    public function updateUserRole(Request $request, int $userId)
    {
        $user = auth()->user();
        
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        // Only admins can change roles
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can change user roles'
            ], 403);
        }

        $targetUser = ZohoUser::where('organization_id', $user->organization_id)
            ->findOrFail($userId);

        // Cannot change own role
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot change your own role'
            ], 400);
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,user,manager',
        ]);

        $targetUser->update(['role' => $validated['role']]);

        return response()->json([
            'success' => true,
            'data' => $targetUser,
            'message' => 'User role updated successfully'
        ]);
    }

    /**
     * Remove a user from the organization.
     */
    public function removeUser(int $userId)
    {
        $user = auth()->user();
        
        if (!$user->organization_id) {
            return response()->json([
                'success' => false,
                'message' => 'No organization found'
            ], 404);
        }

        // Only admins can remove users
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only admins can remove users'
            ], 403);
        }

        $targetUser = ZohoUser::where('organization_id', $user->organization_id)
            ->findOrFail($userId);

        // Cannot remove yourself
        if ($targetUser->id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot remove yourself from the organization'
            ], 400);
        }

        $targetUser->update(['organization_id' => null, 'role' => null]);

        return response()->json([
            'success' => true,
            'message' => 'User removed from organization successfully'
        ]);
    }
}
