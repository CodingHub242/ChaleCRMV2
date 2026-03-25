<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    /**
     * Update user profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'name' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:20',
            'avatar' => 'nullable|string',
        ]);

        $data = [
            'name' => $request->name ?? $user->name,
            'phone' => $request->phone ?? $user->phone,
        ];

        // Handle avatar - could be a file upload or base64 data
        if ($request->has('avatar')) {
            $avatarData = $request->avatar;
            
            // Check if it's a base64 data URL
            if (Str::startsWith($avatarData, 'data:')) {
                // Extract the base64 data
                $avatarParts = explode(',', $avatarData, 2);
                if (count($avatarParts) === 2) {
                    $base64Data = $avatarParts[1];
                    $imageData = base64_decode($base64Data);
                    
                    if ($imageData !== false) {
                        // Determine file extension from data URL
                        preg_match('/data:image\/(\w+);/', $avatarData, $matches);
                        $extension = isset($matches[1]) ? $matches[1] : 'png';
                        
                        // Valid extensions
                        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                        if (!in_array($extension, $allowedExtensions)) {
                            $extension = 'png';
                        }
                        
                        // Generate unique filename
                        $filename = 'avatars/' . $user->id . '_' . time() . '.' . $extension;
                        
                        // Save to disk
                        Storage::disk('public')->put($filename, $imageData);
                        
                        // Delete old avatar if exists
                        if ($user->avatar) {
                            $oldPath = str_replace('/storage/', '', $user->avatar);
                            Storage::disk('public')->delete($oldPath);
                        }
                        
                        $data['avatar'] = '/storage/' . $filename;
                    }
                }
            } else {
                // It's already a URL path
                $data['avatar'] = $avatarData;
            }
        }

        $user->update($data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => $user,
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = Auth::user();
        
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect',
            ], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully',
        ]);
    }

    /**
     * Get current user profile
     */
    public function profile()
    {
        $user = Auth::user();
        
        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }
}
