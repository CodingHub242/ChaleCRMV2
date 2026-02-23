<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    /**
     * Display a listing of activities.
     */
    public function index(Request $request)
    {
        $query = Activity::with('user')->orderBy('activity_date', 'desc');

        // Filter by type
        if ($request->has('type')) {
            $query->ofType($request->type);
        }

        // Filter by subject
        if ($request->has('subject_type') && $request->has('subject_id')) {
            $query->forSubject($request->subject_type, $request->subject_id);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('activity_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('activity_date', '<=', $request->to_date);
        }

        $perPage = $request->input('per_page', 20);
        $activities = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $activities->items(),
            'meta' => [
                'current_page' => $activities->currentPage(),
                'last_page' => $activities->lastPage(),
                'per_page' => $activities->perPage(),
                'total' => $activities->total()
            ]
        ]);
    }

    /**
     * Get activities for a specific subject (polymorphic).
     */
    public function forSubject(Request $request)
    {
        $request->validate([
            'subject_type' => 'required|string',
            'subject_id' => 'required|integer',
        ]);

        $activities = Activity::with('user')
            ->forSubject($request->subject_type, $request->subject_id)
            ->orderBy('activity_date', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Get recent activities for dashboard.
     */
    public function recent(Request $request)
    {
        $limit = $request->input('limit', 10);
        
        $activities = Activity::with('user')
            ->orderBy('activity_date', 'desc')
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $activities
        ]);
    }

    /**
     * Store a newly created activity log.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'activity_type' => 'required|string|max:50',
            'description' => 'required|string',
            'subject_type' => 'nullable|string|max:100',
            'subject_id' => 'nullable|integer',
            'activity_date' => 'nullable|date',
            'metadata' => 'nullable|array',
        ]);

        $validated['user_id'] = Auth::id() ?? $request->input('user_id');
        $validated['activity_date'] = $validated['activity_date'] ?? now();

        $activity = Activity::create($validated);

        return response()->json([
            'success' => true,
            'data' => $activity->load('user'),
            'message' => 'Activity logged successfully'
        ], 201);
    }

    /**
     * Display the specified activity.
     */
    public function show(Activity $activity)
    {
        return response()->json([
            'success' => true,
            'data' => $activity->load('user')
        ]);
    }

    /**
     * Remove the specified activity.
     */
    public function destroy(Activity $activity)
    {
        $activity->delete();

        return response()->json([
            'success' => true,
            'message' => 'Activity deleted successfully'
        ]);
    }

    /**
     * Get activity statistics.
     */
    public function statistics(Request $request)
    {
        $fromDate = $request->input('from_date', now()->subDays(30));
        $toDate = $request->input('to_date', now());

        $stats = [
            'total_activities' => Activity::whereBetween('activity_date', [$fromDate, $toDate])->count(),
            'by_type' => Activity::whereBetween('activity_date', [$fromDate, $toDate])
                ->select('activity_type')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('activity_type')
                ->get(),
            'by_user' => Activity::whereBetween('activity_date', [$fromDate, $toDate])
                ->select('user_id')
                ->selectRaw('COUNT(*) as count')
                ->groupBy('user_id')
                ->with('user')
                ->get(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
