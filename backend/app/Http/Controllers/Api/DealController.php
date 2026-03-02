<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\Deal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    use ScopesByOrganization;
    
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');
        $stage = $request->input('stage', '');
        $groupId = $request->input('group_id', '');
        $organizationId = $this->getOrganizationId();
        
        $query = Deal::with(['contact', 'company', 'group']);
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($stage) {
            $query->where('stage', $stage);
        }
        
        if ($groupId) {
            $query->where('group_id', $groupId);
        }
        
        $deals = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $deals->items(),
            'meta' => [
                'current_page' => $deals->currentPage(),
                'last_page' => $deals->lastPage(),
                'per_page' => $deals->perPage(),
                'total' => $deals->total()
            ]
        ]);
    }

    // Get overall deal counts by stage
    public function counts()
    {
        $organizationId = $this->getOrganizationId();
        
        $query = Deal::query();
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $stages = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];
        
        $counts = [];
        foreach ($stages as $stage) {
            $counts[strtolower(str_replace(' ', '_', $stage))] = (clone $query)->where('stage', $stage)->count();
        }
        
        $counts['total'] = $query->count();
        
        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'stage' => 'nullable|string|max:100',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer',
            'group_id' => 'nullable|integer|exists:deal_groups,id',
            'description' => 'nullable|string',
        ]);

        $validated['organization_id'] = $this->getOrganizationId();
        $deal = Deal::create($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company', 'group']),
            'message' => 'Deal created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::with(['contact', 'company', 'group']);
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $deal
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'stage' => 'nullable|string|max:100',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer',
            'group_id' => 'nullable|integer|exists:deal_groups,id',
            'description' => 'nullable|string',
        ]);

        $deal->update($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company', 'group']),
            'message' => 'Deal updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);
        $deal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal deleted successfully'
        ]);
    }

    public function updateStage(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);

        $validated = $request->validate([
            'stage' => 'required|string|max:100',
        ]);

        $deal->update($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company']),
            'message' => 'Deal stage updated successfully'
        ]);
    }
}
