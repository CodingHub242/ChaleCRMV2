<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DealGroup;
use Illuminate\Http\Request;

class DealGroupController extends Controller
{
    public function index()
    {
        $groups = DealGroup::orderBy('name')->get();
        
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

        $group = DealGroup::create($validated);

        return response()->json([
            'success' => true,
            'data' => $group,
            'message' => 'Group created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $group = DealGroup::withCount(['deals'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $group
        ]);
    }

    public function update(Request $request, int $id)
    {
        $group = DealGroup::findOrFail($id);

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
        $group = DealGroup::findOrFail($id);
        
        // Don't delete if has deals - just detach
        $group->delete();

        return response()->json([
            'success' => true,
            'message' => 'Group deleted successfully'
        ]);
    }

    // Get deals count by stage for a group
    public function stageCounts(int $id)
    {
        $group = DealGroup::findOrFail($id);
        
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
