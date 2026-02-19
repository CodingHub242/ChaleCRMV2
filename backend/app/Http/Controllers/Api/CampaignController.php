<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CampaignController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Campaign::query();

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        // Sort by
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->per_page ?? 15;
        $campaigns = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $campaigns
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:email,social,event,advertising,other',
            'status' => 'in:draft,active,paused,completed,cancelled',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'target_audience' => 'nullable|array',
            'description' => 'nullable|string',
            'goals' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign = Campaign::create($request->all());

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Campaign created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Campaign $campaign)
    {
        $campaign->load(['leads', 'contacts', 'activities']);

        return response()->json([
            'success' => true,
            'data' => $campaign
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Campaign $campaign)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:email,social,event,advertising,other',
            'status' => 'sometimes|in:draft,active,paused,completed,cancelled',
            'budget' => 'nullable|numeric|min:0',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'target_audience' => 'nullable|array',
            'description' => 'nullable|string',
            'goals' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->update($request->all());

        return response()->json([
            'success' => true,
            'data' => $campaign,
            'message' => 'Campaign updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Campaign $campaign)
    {
        $campaign->delete();

        return response()->json([
            'success' => true,
            'message' => 'Campaign deleted successfully'
        ]);
    }

    /**
     * Get campaign statistics
     */
    public function statistics(Campaign $campaign)
    {
        $stats = [
            'total_leads' => $campaign->leads()->count(),
            'total_contacts' => $campaign->contacts()->count(),
            'converted_leads' => $campaign->leads()->where('status', 'converted')->count(),
            'emails_sent' => $campaign->emails_sent ?? 0,
            'emails_opened' => $campaign->emails_opened ?? 0,
            'emails_clicked' => $campaign->emails_clicked ?? 0,
            'total_revenue' => $campaign->leads()->where('status', 'converted')->sum('value'),
            'roi' => $campaign->budget > 0 
                ? (($campaign->leads()->where('status', 'converted')->sum('value') - $campaign->budget) / $campaign->budget) * 100 
                : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Associate leads with campaign
     */
    public function addLeads(Request $request, Campaign $campaign)
    {
        $validator = Validator::make($request->all(), [
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->leads()->syncWithoutDetaching($request->lead_ids);

        return response()->json([
            'success' => true,
            'message' => 'Leads added to campaign successfully'
        ]);
    }

    /**
     * Remove leads from campaign
     */
    public function removeLeads(Request $request, Campaign $campaign)
    {
        $validator = Validator::make($request->all(), [
            'lead_ids' => 'required|array',
            'lead_ids.*' => 'exists:leads,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $campaign->leads()->detach($request->lead_ids);

        return response()->json([
            'success' => true,
            'message' => 'Leads removed from campaign successfully'
        ]);
    }

    /**
     * Duplicate campaign
     */
    public function duplicate(Campaign $campaign)
    {
        $newCampaign = $campaign->replicate();
        $newCampaign->name = $campaign->name . ' (Copy)';
        $newCampaign->status = 'draft';
        $newCampaign->save();

        return response()->json([
            'success' => true,
            'data' => $newCampaign,
            'message' => 'Campaign duplicated successfully'
        ], 201);
    }
}
