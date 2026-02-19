<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SocialPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SocialPostController extends Controller
{
    public function index(Request $request)
    {
        $query = SocialPost::query();

        if ($request->has('platform')) {
            $query->where('platform', $request->platform);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->orderBy('scheduled_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $posts]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'platform' => 'required|in:facebook,twitter,linkedin,instagram',
            'content' => 'required|string|max:5000',
            'media_urls' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'in:draft,scheduled,published,failed',
            'account_id' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $post = SocialPost::create($request->all());

        return response()->json(['success' => true, 'data' => $post, 'message' => 'Social post created'], 201);
    }

    public function show(SocialPost $socialPost)
    {
        return response()->json(['success' => true, 'data' => $socialPost]);
    }

    public function update(Request $request, SocialPost $socialPost)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'sometimes|string|max:5000',
            'media_urls' => 'nullable|array',
            'scheduled_at' => 'nullable|date',
            'status' => 'sometimes|in:draft,scheduled,published,failed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $socialPost->update($request->all());

        return response()->json(['success' => true, 'data' => $socialPost, 'message' => 'Post updated']);
    }

    public function destroy(SocialPost $socialPost)
    {
        $socialPost->delete();

        return response()->json(['success' => true, 'message' => 'Post deleted']);
    }

    public function publish(SocialPost $socialPost)
    {
        // Integration with social media API (Facebook Graph API, Twitter API, LinkedIn API)
        // $result = $this->publishToSocialMedia($socialPost);

        $socialPost->update([
            'status' => 'published',
            'published_at' => now(),
            'external_id' => 'external_post_id_123', // From API response
        ]);

        return response()->json(['success' => true, 'message' => 'Post published']);
    }

    public function schedule(Request $request, SocialPost $socialPost)
    {
        $validator = Validator::make($request->all(), [
            'scheduled_at' => 'required|date|after:now',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $socialPost->update([
            'scheduled_at' => $request->scheduled_at,
            'status' => 'scheduled',
        ]);

        return response()->json(['success' => true, 'message' => 'Post scheduled']);
    }

    public function analytics(SocialPost $socialPost)
    {
        // Fetch analytics from social media APIs
        $analytics = [
            'likes' => $socialPost->likes ?? 0,
            'comments' => $socialPost->comments ?? 0,
            'shares' => $socialPost->shares ?? 0,
            'clicks' => $socialPost->clicks ?? 0,
            'impressions' => $socialPost->impressions ?? 0,
            'reach' => $socialPost->reach ?? 0,
        ];

        return response()->json(['success' => true, 'data' => $analytics]);
    }
}
