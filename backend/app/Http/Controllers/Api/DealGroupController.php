<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\DealGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class DealGroupController extends Controller
{
    use ScopesByOrganization;
    
    public function index()
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealGroup::query();
        
        // Only filter if organization_id column exists and we have an org ID
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        
        $groups = $query->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $groups
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:deal_groups,name',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $organizationId = $this->getOrganizationId();
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $validated['organization_id'] = $organizationId;
        }
        
        $group = DealGroup::create($validated);

        return response()->json([
            'success' => true,
            'data' => $group,
            'message' => 'Group created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealGroup::withCount(['deals']);
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $group = $query->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $group
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealGroup::query();
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $group = $query->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:deal_groups,name,' . $id,
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $group->update($validated);

        return response()->json([
            'success' => true,
            'data' => $group,
            'message' => 'Group updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealGroup::query();
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $group = $query->findOrFail($id);
        
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ]);
    }

    // Get deals count by stage for a group
    public function stageCounts(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealGroup::query();
        if ($organizationId && Schema::hasColumn('deal_groups', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $group = $query->findOrFail($id);
        
        $stages = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];
        
        $counts = [];
        foreach ($stages as $stage) {
            $counts[strtolower(str_replace(' ', '_', $stage))] = $group->deals()->where('stage', $stage)->count();
        }
        
        $counts['total'] = $group->deals()->count();
        
        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }
}
